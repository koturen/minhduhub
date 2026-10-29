import type { Media } from '../types/media';
import { demoMedia } from '../data/demoMedia';
import { isSafeHttpUrl } from '../lib/validation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * Integration point for persistent metadata. Swap LocalDemoRepository for an
 * implementation that talks to your API/database to get a shared public gallery.
 */
export interface MediaRepository {
  list(): Promise<Media[]>;
  get(id: string): Promise<Media | undefined>;
  add(media: Media): Promise<void>;
  /** Moderation hook: wire this to a real reports endpoint. */
  report(id: string, reason: string): Promise<void>;
}

const KEY = 'minhduhub:uploads';

function readLocal(): Media[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return (parsed as Media[]).filter((m) => typeof m?.id === 'string' && isSafeHttpUrl(m.url));
  } catch {
    return [];
  }
}

class LocalDemoRepository implements MediaRepository {
  async list(): Promise<Media[]> {
    return [...readLocal(), ...demoMedia]
      .filter((m) => m.visibility === 'public')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async get(id: string): Promise<Media | undefined> {
    return [...readLocal(), ...demoMedia].find((m) => m.id === id);
  }
  async add(media: Media): Promise<void> {
    try {
      localStorage.setItem(KEY, JSON.stringify([media, ...readLocal()]));
    } catch {
      throw new Error('Could not save to this browser. Storage may be full or disabled.');
    }
  }
  async report(id: string, reason: string): Promise<void> {
    console.info('Report received (no backend connected):', id, reason);
  }
}

interface Row {
  id: string; title: string; description: string | null; type: 'video' | 'image'; resource_type: 'video' | 'image';
  url: string; thumbnail_url: string | null; category: string; tags: string[]; created_at: string; visibility: Media['visibility'];
  width: number | null; height: number | null; duration: number | null; cloudinary_public_id: string | null;
  format: string | null; allow_download: boolean;
}

const fromRow = (r: Row): Media => ({
  id: r.id, title: r.title, description: r.description ?? undefined, type: r.type, resourceType: r.resource_type,
  url: r.url, thumbnailUrl: r.thumbnail_url ?? undefined, category: r.category, tags: r.tags ?? [],
  createdAt: r.created_at, visibility: r.visibility, width: r.width ?? undefined, height: r.height ?? undefined,
  duration: r.duration ?? undefined, cloudinaryPublicId: r.cloudinary_public_id ?? undefined,
  format: r.format ?? undefined, allowDownload: r.allow_download,
});

const toRow = (m: Media) => ({
  id: m.id, title: m.title, description: m.description ?? null, type: m.type, resource_type: m.resourceType,
  url: m.url, thumbnail_url: m.thumbnailUrl ?? null, category: m.category, tags: m.tags, created_at: m.createdAt,
  visibility: 'public', width: m.width ?? null, height: m.height ?? null, duration: m.duration ?? null,
  cloudinary_public_id: m.cloudinaryPublicId ?? null, format: m.format ?? null, allow_download: Boolean(m.allowDownload),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Dữ liệu dùng chung qua Supabase; các mục mẫu vẫn được trộn vào để giao diện không trống. */
class SupabaseRepository implements MediaRepository {
  async list(): Promise<Media[]> {
    if (!supabase) return demoMedia;
    const { data, error } = await supabase.from('media').select('*').eq('visibility', 'public').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const real = (data as Row[]).map(fromRow).filter((m) => isSafeHttpUrl(m.url));
    return [...real, ...demoMedia].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async get(id: string): Promise<Media | undefined> {
    const demo = demoMedia.find((m) => m.id === id);
    if (demo || !supabase || !UUID.test(id)) return demo;
    const { data, error } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as Row) : undefined;
  }
  async add(media: Media): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('media').insert(toRow(media));
    if (error) throw new Error(`Could not save details: ${error.message}`);
  }
  async report(id: string, reason: string): Promise<void> {
    if (!supabase || !UUID.test(id)) return; // mục mẫu không có trong DB
    const { error } = await supabase.from('reports').insert({ media_id: id, reason: reason.slice(0, 200) });
    if (error) throw new Error(error.message);
  }
}

export const mediaRepository: MediaRepository = isSupabaseConfigured ? new SupabaseRepository() : new LocalDemoRepository();

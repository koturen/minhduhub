import type { Media } from '../types/media';
import { isSafeHttpUrl } from '../lib/validation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * Integration point for persistent metadata. SupabaseRepository is used when
 * Supabase is configured; otherwise uploads live only in this browser.
 */
export interface MediaRepository {
  list(): Promise<Media[]>;
  get(id: string): Promise<Media | undefined>;
  add(media: Media): Promise<void>;
  /** Moderation hook. */
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

class LocalRepository implements MediaRepository {
  async list(): Promise<Media[]> {
    return readLocal().filter((m) => m.visibility === 'public').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async get(id: string): Promise<Media | undefined> {
    return readLocal().find((m) => m.id === id);
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
  url: string; thumbnail_url: string | null; tags: string[]; created_at: string; visibility: Media['visibility'];
  width: number | null; height: number | null; duration: number | null; cloudinary_public_id: string | null;
  format: string | null; allow_download: boolean; owner_id: string | null;
}

const fromRow = (r: Row): Media => ({
  id: r.id, title: r.title, description: r.description ?? undefined, type: r.type, resourceType: r.resource_type,
  url: r.url, thumbnailUrl: r.thumbnail_url ?? undefined, tags: r.tags ?? [],
  createdAt: r.created_at, visibility: r.visibility, width: r.width ?? undefined, height: r.height ?? undefined,
  duration: r.duration ?? undefined, cloudinaryPublicId: r.cloudinary_public_id ?? undefined,
  format: r.format ?? undefined, allowDownload: r.allow_download, ownerId: r.owner_id ?? undefined,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class SupabaseRepository implements MediaRepository {
  async list(): Promise<Media[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('media').select('*').eq('visibility', 'public').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as Row[]).map(fromRow).filter((m) => isSafeHttpUrl(m.url));
  }
  async get(id: string): Promise<Media | undefined> {
    if (!supabase || !UUID.test(id)) return undefined;
    const { data, error } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as Row) : undefined;
  }
  async add(media: Media): Promise<void> {
    if (!supabase) throw new Error('auth.needSupabase');
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) throw new Error('auth.required');
    const { error } = await supabase.from('media').insert({
      id: media.id, title: media.title, description: media.description ?? null, type: media.type,
      resource_type: media.resourceType, url: media.url, thumbnail_url: media.thumbnailUrl ?? null,
      category: '', tags: media.tags, created_at: media.createdAt, visibility: 'public',
      width: media.width ?? null, height: media.height ?? null, duration: media.duration ?? null,
      cloudinary_public_id: media.cloudinaryPublicId ?? null, format: media.format ?? null,
      allow_download: Boolean(media.allowDownload), owner_id: uid,
    });
    if (error) throw new Error(error.message);
  }
  async report(id: string, reason: string): Promise<void> {
    if (!supabase || !UUID.test(id)) return;
    const { error } = await supabase.from('reports').insert({ media_id: id, reason: reason.slice(0, 200) });
    if (error) throw new Error(error.message);
  }
}

export const mediaRepository: MediaRepository = isSupabaseConfigured ? new SupabaseRepository() : new LocalRepository();

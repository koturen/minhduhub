import type { Media } from '../types/media';
import { demoMedia } from '../data/demoMedia';
import { isSafeHttpUrl } from '../lib/validation';

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

export const mediaRepository: MediaRepository = new LocalDemoRepository();

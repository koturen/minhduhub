import { useCallback, useEffect, useState } from 'react';
import type { Media } from '../types/media';
import { mediaRepository } from '../services/mediaRepository';

interface State<T> { data: T; loading: boolean; error: string | null }

export function useMediaList() {
  const [state, setState] = useState<State<Media[]>>({ data: [], loading: true, error: null });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    mediaRepository.list().then(
      (data) => setState({ data, loading: false, error: null }),
      () => setState({ data: [], loading: false, error: 'Could not load media.' }),
    );
  }, []);
  useEffect(load, [load]);
  return { ...state, reload: load };
}

export function useMediaItem(id: string | undefined) {
  const [state, setState] = useState<State<Media | undefined>>({ data: undefined, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ data: undefined, loading: true, error: null });
    if (!id) { setState({ data: undefined, loading: false, error: null }); return; }
    mediaRepository.get(id).then(
      (data) => !cancelled && setState({ data, loading: false, error: null }),
      () => !cancelled && setState({ data: undefined, loading: false, error: 'Could not load this item.' }),
    );
    return () => { cancelled = true; };
  }, [id]);
  return state;
}

const RECENT_KEY = 'minhduhub:recent';

export function readRecentIds(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
}

export function trackRecent(id: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...readRecentIds().filter((x) => x !== id)].slice(0, 12)));
  } catch { /* preferences only; ignore */ }
}

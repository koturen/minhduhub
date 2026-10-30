import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useMediaList } from '../../hooks/useMedia';
import type { MediaType } from '../../types/media';
import { useI18n } from '../../i18n';
import MediaGrid, { GridSkeleton } from './MediaGrid';

const PAGE = 12;

/** Search/filter/sort listing. Filters live in URL query params. */
export default function MediaBrowser({ type, title }: { type?: MediaType; title: string }) {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useMediaList();
  const [text, setText] = useState(params.get('q') ?? '');
  const [visible, setVisible] = useState(PAGE);

  const q = params.get('q') ?? '';
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'latest';
  const rawKind = params.get('type');
  const kind: MediaType | '' = type ?? (rawKind === 'video' || rawKind === 'image' ? rawKind : '');

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
    setVisible(PAGE);
  };

  useEffect(() => setText(q), [q]);
  useEffect(() => {
    if (text === q) return;
    const id = setTimeout(() => setParam('q', text.trim()), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const results = useMemo(() => {
    const term = q.toLowerCase();
    return data
      .filter((m) => !kind || m.type === kind)
      .filter((m) => !term || m.title.toLowerCase().includes(term) || m.tags.some((tag) => tag.includes(term)))
      .sort((a, b) => (sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
  }, [data, q, sort, kind]);

  const hasFilters = Boolean(q || (!type && kind) || sort === 'oldest');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted" aria-hidden="true" />
          <label htmlFor="filter-q" className="sr-only">{t('browse.searchLabel')}</label>
          <input id="filter-q" className="input pl-9" placeholder={t('browse.searchLabel')} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {!type && (
          <>
            <label className="sr-only" htmlFor="filter-type">{t('browse.typeLabel')}</label>
            <select id="filter-type" className="input w-auto" value={kind} onChange={(e) => setParam('type', e.target.value)}>
              <option value="">{t('browse.typeAll')}</option>
              <option value="video">{t('browse.typeVideo')}</option>
              <option value="image">{t('browse.typeImage')}</option>
            </select>
          </>
        )}
        <label className="sr-only" htmlFor="filter-sort">{t('browse.sortLabel')}</label>
        <select id="filter-sort" className="input w-auto" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
          <option value="latest">{t('browse.latest')}</option>
          <option value="oldest">{t('browse.oldest')}</option>
        </select>
        {hasFilters && <button className="btn" onClick={() => { setText(''); setParams({}, { replace: true }); setVisible(PAGE); }}><X size={16} />{t('browse.clear')}</button>}
      </div>

      {loading && <GridSkeleton />}
      {error && (
        <div role="alert" className="rounded-md border border-danger p-4 text-sm">
          {t('browse.loadError')} <button className="underline" onClick={reload}>{t('common.retry')}</button>
        </div>
      )}
      {!loading && !error && results.length === 0 && (
        <p className="rounded-md border border-line p-8 text-center text-muted">{t('browse.empty')}</p>
      )}
      {!loading && !error && results.length > 0 && (
        <>
          <MediaGrid items={results.slice(0, visible)} />
          {visible < results.length && (
            <div className="mt-8 text-center"><button className="btn" onClick={() => setVisible((v) => v + PAGE)}>{t('common.loadMore')}</button></div>
          )}
        </>
      )}
    </div>
  );
}

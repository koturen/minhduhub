import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useMediaList } from '../../hooks/useMedia';
import { CATEGORIES, type MediaType } from '../../types/media';
import MediaGrid, { GridSkeleton } from './MediaGrid';

const PAGE = 12;

/** Search/filter/sort listing. Filters live in URL query params. */
export default function MediaBrowser({ type, title }: { type?: MediaType; title: string }) {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useMediaList();
  const [text, setText] = useState(params.get('q') ?? '');
  const [visible, setVisible] = useState(PAGE);

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'latest';
  const kind = type ?? (params.get('type') as MediaType | null) ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
    setVisible(PAGE);
  };

  // Keep the box in sync when the header search changes the URL.
  useEffect(() => setText(q), [q]);
  // Debounce typing into the URL.
  useEffect(() => {
    if (text === q) return;
    const id = setTimeout(() => setParam('q', text.trim()), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const results = useMemo(() => {
    const term = q.toLowerCase();
    return data
      .filter((m) => (!kind || m.type === kind) && (!category || m.category === category))
      .filter((m) => !term || m.title.toLowerCase().includes(term) || m.tags.some((t) => t.includes(term)))
      .sort((a, b) => (sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
  }, [data, q, category, sort, kind]);

  const hasFilters = Boolean(q || category || (!type && kind) || sort === 'oldest');

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted" aria-hidden="true" />
          <label htmlFor="filter-q" className="sr-only">Search by title or tag</label>
          <input id="filter-q" className="input pl-9" placeholder="Search by title or tag" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <label className="sr-only" htmlFor="filter-cat">Category</label>
        <select id="filter-cat" className="input w-auto" value={category} onChange={(e) => setParam('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {!type && (
          <>
            <label className="sr-only" htmlFor="filter-type">Media type</label>
            <select id="filter-type" className="input w-auto" value={kind} onChange={(e) => setParam('type', e.target.value)}>
              <option value="">Videos and images</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
            </select>
          </>
        )}
        <label className="sr-only" htmlFor="filter-sort">Sort</label>
        <select id="filter-sort" className="input w-auto" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
          <option value="latest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        {hasFilters && <button className="btn" onClick={() => { setText(''); setParams({}, { replace: true }); setVisible(PAGE); }}><X size={16} />Clear filters</button>}
      </div>

      {loading && <GridSkeleton />}
      {error && (
        <div role="alert" className="rounded-md border border-danger p-4 text-sm">
          {error} <button className="underline" onClick={reload}>Try again</button>
        </div>
      )}
      {!loading && !error && results.length === 0 && (
        <p className="rounded-md border border-line p-8 text-center text-muted">Nothing matches these filters. Clear them or try another search.</p>
      )}
      {!loading && !error && results.length > 0 && (
        <>
          <MediaGrid items={results.slice(0, visible)} />
          {visible < results.length && (
            <div className="mt-8 text-center"><button className="btn" onClick={() => setVisible((v) => v + PAGE)}>Load more</button></div>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Flag, Share2 } from 'lucide-react';
import type { MediaType } from '../../types/media';
import { trackRecent, useMediaItem, useMediaList } from '../../hooks/useMedia';
import { formatDate } from '../../lib/format';
import { isSafeHttpUrl } from '../../lib/validation';
import { mediaRepository } from '../../services/mediaRepository';
import MediaGrid from './MediaGrid';
import VideoPlayer from './VideoPlayer';
import ImageViewer from './ImageViewer';

export default function MediaDetail({ type }: { type: MediaType }) {
  const { id } = useParams();
  const { data: media, loading, error } = useMediaItem(id);
  const { data: all } = useMediaList();
  const [note, setNote] = useState('');

  useEffect(() => { if (media) trackRecent(media.id); }, [media]);

  const sameType = useMemo(() => all.filter((m) => m.type === type), [all, type]);
  const related = useMemo(
    () => (media ? sameType.filter((m) => m.id !== media.id).sort((a, b) => Number(b.category === media.category) - Number(a.category === media.category)).slice(0, 6) : []),
    [sameType, media],
  );
  const index = media ? sameType.findIndex((m) => m.id === media.id) : -1;

  const share = async () => {
    try { await navigator.clipboard.writeText(location.href); setNote('Link copied'); }
    catch { setNote('Copy failed. Copy the address bar instead.'); }
    setTimeout(() => setNote(''), 2500);
  };
  const report = async () => {
    if (!media) return;
    await mediaRepository.report(media.id, 'user-report');
    setNote('Report sent. Thank you.');
  };

  if (loading) return <div className="mx-auto max-w-5xl"><div className="skeleton aspect-video" /><div className="skeleton mt-4 h-8 w-1/2" /></div>;
  if (error) return <p role="alert" className="text-danger">{error}</p>;
  if (!media || media.type !== type || !isSafeHttpUrl(media.url)) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">{type === 'video' ? 'Video' : 'Image'} not found</h1>
        <p className="mb-6 text-muted">It may have been removed, or it was saved on another device.</p>
        <Link to={type === 'video' ? '/videos' : '/images'} className="btn btn-primary">Browse {type}s</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {type === 'video' ? (
        <VideoPlayer src={media.url} poster={media.thumbnailUrl} title={media.title} />
      ) : (
        <ImageViewer media={media} prevId={sameType[index - 1]?.id} nextId={sameType[index + 1]?.id} />
      )}
      <h1 className="mt-4 text-xl font-bold">{media.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>{formatDate(media.createdAt)}</span>
        <Link className="chip py-0.5" to={`/search?category=${media.category}`}>{media.category}</Link>
        {media.width && media.height && <span>{media.width}×{media.height}</span>}
        {media.format && <span>{media.format.toUpperCase()}</span>}
        <span className="ml-auto flex items-center gap-2">
          <button className="btn" onClick={share}>{note === 'Link copied' ? <Check size={16} /> : <Share2 size={16} />}Share</button>
          <button className="btn" onClick={report} aria-label="Report this media"><Flag size={16} />Report</button>
        </span>
      </div>
      <p role="status" className="min-h-5 text-sm text-ok">{note}</p>
      {media.description && <p className="mt-2 max-w-prose text-sm">{media.description}</p>}
      {media.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">{media.tags.map((t) => <Link key={t} className="chip py-0.5" to={`/search?q=${encodeURIComponent(t)}`}>#{t}</Link>)}</div>
      )}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Related {type}s</h2>
          <MediaGrid items={related} />
        </section>
      )}
    </div>
  );
}

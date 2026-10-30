import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Flag, Share2 } from 'lucide-react';
import type { MediaType } from '../../types/media';
import { trackRecent, useMediaItem, useMediaList } from '../../hooks/useMedia';
import { formatDate } from '../../lib/format';
import { isSafeHttpUrl } from '../../lib/validation';
import { mediaRepository } from '../../services/mediaRepository';
import { useI18n } from '../../i18n';
import MediaGrid from './MediaGrid';
import VideoPlayer from './VideoPlayer';
import ImageViewer from './ImageViewer';

export default function MediaDetail({ type }: { type: MediaType }) {
  const { t, locale } = useI18n();
  const { id } = useParams();
  const { data: media, loading, error } = useMediaItem(id);
  const { data: all } = useMediaList();
  const [note, setNote] = useState('');

  useEffect(() => { if (media) trackRecent(media.id); }, [media]);

  const sameType = useMemo(() => all.filter((m) => m.type === type), [all, type]);
  const related = useMemo(
    () => (media ? sameType.filter((m) => m.id !== media.id).slice(0, 6) : []),
    [sameType, media],
  );
  const index = media ? sameType.findIndex((m) => m.id === media.id) : -1;

  const share = async () => {
    try { await navigator.clipboard.writeText(location.href); setNote(t('detail.copied')); }
    catch { setNote(t('detail.copyFail')); }
    setTimeout(() => setNote(''), 2500);
  };
  const report = async () => {
    if (!media) return;
    await mediaRepository.report(media.id, 'user-report');
    setNote(t('detail.reported'));
  };

  if (loading) return <div className="mx-auto max-w-5xl"><div className="skeleton aspect-video" /><div className="skeleton mt-4 h-8 w-1/2" /></div>;
  if (error) return <p role="alert" className="text-danger">{t('detail.loadError')}</p>;
  if (!media || media.type !== type || !isSafeHttpUrl(media.url)) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">{t(type === 'video' ? 'detail.notFoundVideo' : 'detail.notFoundImage')}</h1>
        <p className="mb-6 text-muted">{t('detail.notFoundHint')}</p>
        <Link to={type === 'video' ? '/videos' : '/images'} className="btn btn-primary">{t(type === 'video' ? 'detail.browseVideo' : 'detail.browseImage')}</Link>
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
        <span>{formatDate(media.createdAt, locale)}</span>
        {media.width && media.height && <span>{media.width}×{media.height}</span>}
        {media.format && <span>{media.format.toUpperCase()}</span>}
        <span className="ml-auto flex items-center gap-2">
          <button className="btn" onClick={share}>{note === t('detail.copied') ? <Check size={16} /> : <Share2 size={16} />}{t('detail.share')}</button>
          <button className="btn" onClick={report} aria-label={t('detail.reportLabel')}><Flag size={16} />{t('detail.report')}</button>
        </span>
      </div>
      <p role="status" className="min-h-5 text-sm text-ok">{note}</p>
      {media.description && <p className="mt-2 max-w-prose text-sm">{media.description}</p>}
      {media.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">{media.tags.map((t) => <Link key={t} className="chip py-0.5" to={`/search?q=${encodeURIComponent(t)}`}>#{t}</Link>)}</div>
      )}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">{t(type === 'video' ? 'detail.relatedVideo' : 'detail.relatedImage')}</h2>
          <MediaGrid items={related} />
        </section>
      )}
    </div>
  );
}

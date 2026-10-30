import { Link } from 'react-router-dom';
import { Play, Upload } from 'lucide-react';
import { readRecentIds, useMediaList } from '../hooks/useMedia';
import MediaGrid, { GridSkeleton } from '../components/media/MediaGrid';
import Section from '../components/media/Section';
import { useI18n } from '../i18n';

export default function HomePage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useMediaList();
  const videos = data.filter((m) => m.type === 'video');
  const images = data.filter((m) => m.type === 'image');
  const featured = videos[0] ?? data[0];
  const recent = readRecentIds().map((id) => data.find((m) => m.id === id)).filter((m) => m !== undefined).slice(0, 6);

  if (error) {
    return <div role="alert" className="rounded-md border border-danger p-4 text-sm">{t('home.loadError')} <button className="underline" onClick={reload}>{t('common.retry')}</button></div>;
  }
  if (loading) return <GridSkeleton />;
  if (data.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-line p-10 text-center">
        <h1 className="mb-2 text-xl font-bold">{t('home.emptyTitle')}</h1>
        <p className="mb-6 text-sm text-muted">{t('home.emptyText')}</p>
        <Link to="/upload" className="btn btn-primary"><Upload size={16} />{t('nav.upload')}</Link>
      </div>
    );
  }
  return (
    <div>
      {featured && (
        <Link
          to={`/${featured.type === 'video' ? 'videos' : 'images'}/${featured.id}`}
          className="mb-10 grid overflow-hidden rounded-md border border-line bg-surface md:grid-cols-5"
        >
          <div className="relative aspect-video md:col-span-3">
            {featured.thumbnailUrl && <img src={featured.thumbnailUrl} alt="" className="h-full w-full object-cover" />}
            {featured.type === 'video' && <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-accent p-4 text-black"><Play fill="currentColor" /></span></span>}
          </div>
          <div className="flex flex-col justify-center gap-2 p-6 md:col-span-2">
            <p className="text-sm text-muted">{t('home.featured')}</p>
            <h1 className="text-2xl font-bold">{featured.title}</h1>
            {featured.description && <p className="line-clamp-3 text-sm text-muted">{featured.description}</p>}
          </div>
        </Link>
      )}
      {videos.length > 0 && <Section title={t('home.latestVideos')} to="/videos?sort=latest"><MediaGrid items={videos.slice(0, 6)} /></Section>}
      {images.length > 0 && <Section title={t('home.latestImages')} to="/images"><MediaGrid items={images.slice(0, 6)} /></Section>}
      {recent.length > 0 && <Section title={t('home.recent')}><MediaGrid items={recent} /></Section>}
    </div>
  );
}

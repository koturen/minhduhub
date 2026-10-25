import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CATEGORIES } from '../types/media';
import { readRecentIds, useMediaList } from '../hooks/useMedia';
import MediaGrid, { GridSkeleton } from '../components/media/MediaGrid';
import Section from '../components/media/Section';
import { isCloudinaryConfigured } from '../lib/cloudinary';

export default function HomePage() {
  const { data, loading, error, reload } = useMediaList();
  const videos = data.filter((m) => m.type === 'video');
  const images = data.filter((m) => m.type === 'image');
  const featured = videos[0] ?? data[0];
  const recent = readRecentIds().map((id) => data.find((m) => m.id === id)).filter((m) => m !== undefined).slice(0, 6);

  if (error) {
    return <div role="alert" className="rounded-md border border-danger p-4 text-sm">{error} <button className="underline" onClick={reload}>Try again</button></div>;
  }
  return (
    <div>
      {!isCloudinaryConfigured && (
        <p className="mb-6 rounded-md border border-line bg-surface p-3 text-sm text-muted">
          Demo mode: the sample items below come from Cloudinary's public demo cloud. Add your Cloudinary settings to enable uploads.
        </p>
      )}
      {loading && <GridSkeleton />}
      {!loading && featured && (
        <Link
          to={`/${featured.type === 'video' ? 'videos' : 'images'}/${featured.id}`}
          className="mb-10 grid overflow-hidden rounded-md border border-line bg-surface md:grid-cols-5"
        >
          <div className="relative aspect-video md:col-span-3">
            {featured.thumbnailUrl && <img src={featured.thumbnailUrl} alt="" className="h-full w-full object-cover" />}
            <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-accent p-4 text-black"><Play fill="currentColor" /></span></span>
          </div>
          <div className="flex flex-col justify-center gap-2 p-6 md:col-span-2">
            <p className="text-sm text-muted">Featured</p>
            <h1 className="text-2xl font-bold">{featured.title}</h1>
            <p className="line-clamp-3 text-sm text-muted">{featured.description}</p>
          </div>
        </Link>
      )}
      {!loading && (
        <>
          <Section title="Latest videos" to="/videos?sort=latest"><MediaGrid items={videos.slice(0, 6)} /></Section>
          <Section title="Latest images" to="/images"><MediaGrid items={images.slice(0, 6)} /></Section>
          <Section title="Browse by category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => <Link key={c} className="chip" to={`/search?category=${c}`}>{c}</Link>)}
            </div>
          </Section>
          {recent.length > 0 && <Section title="Recently viewed"><MediaGrid items={recent} /></Section>}
        </>
      )}
    </div>
  );
}

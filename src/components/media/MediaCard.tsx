import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Play } from 'lucide-react';
import type { Media } from '../../types/media';
import { formatDate, formatDuration } from '../../lib/format';
import { useI18n } from '../../i18n';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

function MediaCard({ media }: { media: Media }) {
  const { t, locale } = useI18n();
  const [failed, setFailed] = useState(false);
  const to = `/${media.type === 'video' ? 'videos' : 'images'}/${media.id}`;
  return (
    <Link to={to} className="group block rounded-md">
      <div className="relative aspect-video overflow-hidden rounded-md bg-card">
        <img
          src={failed || !media.thumbnailUrl ? PLACEHOLDER : media.thumbnailUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs">
          {media.type === 'video' ? <Play size={12} /> : <ImageIcon size={12} />}
          {t(media.type === 'video' ? 'type.video' : 'type.image')}
        </span>
        {media.type === 'video' && media.duration !== undefined && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs">{formatDuration(media.duration)}</span>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-accent">{media.title}</h3>
      <p className="mt-0.5 text-xs text-muted">{formatDate(media.createdAt, locale)}</p>
      {media.tags.length > 0 && <p className="mt-1 truncate text-xs text-muted">{media.tags.map((tag) => `#${tag}`).join(' ')}</p>}
    </Link>
  );
}
export default memo(MediaCard);

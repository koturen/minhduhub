import type { Media } from '../../types/media';
import MediaCard from './MediaCard';
import { useI18n } from '../../i18n';

export const gridClass = 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6';

export function GridSkeleton({ count = 8 }: { count?: number }) {
  const { t } = useI18n();
  return (
    <div className={gridClass} aria-busy="true" aria-label={t('common.loading')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}><div className="skeleton aspect-video" /><div className="skeleton mt-2 h-4 w-3/4" /></div>
      ))}
    </div>
  );
}

export default function MediaGrid({ items }: { items: Media[] }) {
  return (
    <div className={gridClass}>
      {items.map((m) => <MediaCard key={m.id} media={m} />)}
    </div>
  );
}

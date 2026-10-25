import { Link } from 'react-router-dom';
import { CATEGORIES } from '../types/media';
import { useMediaList } from '../hooks/useMedia';

export default function CategoriesPage() {
  const { data } = useMediaList();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Categories</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <Link key={c} to={`/search?category=${c}`} className="rounded-md border border-line bg-card p-4 transition-colors hover:border-accent">
            <div className="font-medium">{c}</div>
            <div className="text-sm text-muted">{data.filter((m) => m.category === c).length} items</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

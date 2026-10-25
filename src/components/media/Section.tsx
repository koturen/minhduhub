import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Section({ title, to, children }: { title: string; to?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {to && <Link to={to} className="text-sm text-accent hover:underline">See all</Link>}
      </div>
      {children}
    </section>
  );
}

import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="MinhDuHub home">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 2.5 28 9.5v13L16 29.5 4 22.5v-13z" fill="#111" stroke="#F5A623" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M13 11.5v9l7.5-4.5z" fill="#F5A623" />
      </svg>
      <span className="text-lg font-bold tracking-tight">MinhDu<span className="text-accent">Hub</span></span>
    </Link>
  );
}

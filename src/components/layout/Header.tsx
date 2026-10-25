import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, Upload, User, X } from 'lucide-react';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/videos', label: 'Videos' },
  { to: '/images', label: 'Images' },
  { to: '/categories', label: 'Categories' },
];
const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm transition-colors hover:text-ink ${isActive ? 'text-accent' : 'text-muted'}`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const searchForm = (
    <form onSubmit={submit} role="search" className="flex w-full">
      <label htmlFor="site-search" className="sr-only">Search media</label>
      <input id="site-search" className="input rounded-r-none" placeholder="Search titles and tags" value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="submit" aria-label="Search" className="btn rounded-l-none border-l-0 px-3"><Search size={18} /></button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="flex h-14 items-center gap-3 px-4">
        <button className="btn h-10 w-10 px-0 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>)}
        </nav>
        <div className="mx-auto hidden max-w-xl flex-1 md:block">{searchForm}</div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button className="btn h-10 w-10 px-0 md:hidden" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}><Search size={18} /></button>
          <Link to="/upload" className="btn btn-primary h-10"><Upload size={16} /><span className="hidden sm:inline">Upload</span></Link>
          <button className="btn h-10 w-10 px-0" aria-label="Guest profile" title="Guest (sign-in needs a backend)"><User size={18} /></button>
        </div>
      </div>
      {searchOpen && <div className="border-t border-line p-3 md:hidden">{searchForm}</div>}
      {menuOpen && (
        <nav aria-label="Mobile" className="flex flex-col border-t border-line p-2 md:hidden">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setMenuOpen(false)}>{l.label}</NavLink>)}
        </nav>
      )}
    </header>
  );
}

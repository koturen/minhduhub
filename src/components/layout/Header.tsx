import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Globe, LogOut, Menu, Search, Upload, User, X } from 'lucide-react';
import Logo from './Logo';
import { useI18n } from '../../i18n';
import { useAuth } from '../../auth/AuthContext';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm transition-colors hover:text-ink ${isActive ? 'text-accent' : 'text-muted'}`;

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/videos', label: t('nav.videos') },
    { to: '/images', label: t('nav.images') },
  ];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const searchForm = (
    <form onSubmit={submit} role="search" className="flex w-full">
      <label htmlFor="site-search" className="sr-only">{t('search.label')}</label>
      <input id="site-search" className="input rounded-r-none" placeholder={t('search.placeholder')} value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="submit" aria-label={t('search.submit')} className="btn rounded-l-none border-l-0 px-3"><Search size={18} /></button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="flex h-14 items-center gap-3 px-4">
        <button className="btn h-10 w-10 px-0 md:hidden" aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Logo />
        <nav aria-label={t('nav.main')} className="ml-4 hidden items-center md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>)}
        </nav>
        <div className="mx-auto hidden max-w-xl flex-1 md:block">{searchForm}</div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button className="btn h-10 w-10 px-0 md:hidden" aria-label={t('search.label')} onClick={() => setSearchOpen((v) => !v)}><Search size={18} /></button>
          <Link to="/upload" className="btn btn-primary h-10"><Upload size={16} /><span className="hidden sm:inline">{t('nav.upload')}</span></Link>
          <button className="btn h-10 gap-1 px-2" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label={t('nav.language')} title={t('nav.language')}>
            <Globe size={16} /><span className="text-xs font-semibold">{lang.toUpperCase()}</span>
          </button>
          {user ? (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-muted lg:inline" title={user.email ?? ''}>{user.email}</span>
              <button className="btn h-10 w-10 px-0" onClick={() => void signOut()} aria-label={t('nav.logout')} title={t('nav.logout')}><LogOut size={18} /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn hidden h-10 sm:inline-flex">{t('nav.login')}</Link>
              <Link to="/register" className="btn hidden h-10 lg:inline-flex">{t('nav.register')}</Link>
              <Link to="/login" className="btn h-10 w-10 px-0 sm:hidden" aria-label={t('nav.login')}><User size={18} /></Link>
            </>
          )}
        </div>
      </div>
      {searchOpen && <div className="border-t border-line p-3 md:hidden">{searchForm}</div>}
      {menuOpen && (
        <nav aria-label={t('nav.mobile')} className="flex flex-col border-t border-line p-2 md:hidden">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setMenuOpen(false)}>{l.label}</NavLink>)}
          {!user && <NavLink to="/login" className={navClass} onClick={() => setMenuOpen(false)}>{t('nav.login')}</NavLink>}
          {!user && <NavLink to="/register" className={navClass} onClick={() => setMenuOpen(false)}>{t('nav.register')}</NavLink>}
        </nav>
      )}
    </header>
  );
}

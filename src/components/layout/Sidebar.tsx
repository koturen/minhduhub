import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, Film, Home, Image as ImageIcon, PanelLeftClose, PanelLeftOpen, Upload } from 'lucide-react';
import { useI18n } from '../../i18n';

const KEY = 'minhduhub:sidebar-collapsed';

export default function Sidebar() {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  const toggle = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(KEY, c ? '0' : '1'); } catch { /* ignore */ }
      return !c;
    });
  };
  const items = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/videos?sort=latest', label: t('nav.latest'), icon: Clock },
    { to: '/videos', label: t('nav.videos'), icon: Film },
    { to: '/images', label: t('nav.gallery'), icon: ImageIcon },
    { to: '/upload', label: t('nav.upload'), icon: Upload },
  ];
  return (
    <aside className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col gap-1 border-r border-line bg-surface p-2 transition-[width] lg:flex ${collapsed ? 'w-14' : 'w-52'}`}>
      <nav aria-label={t('nav.sidebar')} className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} title={label} className={({ isActive }) => `flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-card ${isActive && !to.includes('?') ? 'text-accent' : 'text-muted hover:text-ink'}`}>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <button onClick={toggle} className="btn mt-auto h-10 px-0" aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </aside>
  );
}

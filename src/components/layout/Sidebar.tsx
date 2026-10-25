import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, Film, FolderOpen, Home, Image as ImageIcon, PanelLeftClose, PanelLeftOpen, Upload } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/videos?sort=latest', label: 'Latest uploads', icon: Clock },
  { to: '/videos', label: 'Videos', icon: Film },
  { to: '/images', label: 'Image gallery', icon: ImageIcon },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/upload', label: 'Upload', icon: Upload },
];
const KEY = 'minhduhub:sidebar-collapsed';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  const toggle = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(KEY, c ? '0' : '1'); } catch { /* ignore */ }
      return !c;
    });
  };
  return (
    <aside className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col gap-1 border-r border-line bg-surface p-2 transition-[width] lg:flex ${collapsed ? 'w-14' : 'w-52'}`}>
      <nav aria-label="Sidebar" className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={label} to={to} end={end} title={label} className={({ isActive }) => `flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-card ${isActive && !to.includes('?') ? 'text-accent' : 'text-muted hover:text-ink'}`}>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <button onClick={toggle} className="btn mt-auto h-10 px-0" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </aside>
  );
}

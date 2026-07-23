import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  GraduationCap,
  ClipboardList,
  Mail,
  FileText,
  Newspaper,
  Calendar,
  Users,
  Image,
  ExternalLink,
  LogOut,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Seo from '../Seo';

const links = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/contact-messages', label: 'Messages', icon: Mail },
  { to: '/admin/admissions', label: 'Admissions', icon: GraduationCap },
  { to: '/admin/posts', label: 'News', icon: Newspaper },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/pages', label: 'Pages', icon: FileText },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
];

const pageTitles = {
  '/admin': { title: 'Dashboard', subtitle: 'School operations overview' },
  '/admin/settings': { title: 'Site Settings', subtitle: 'School name, logo, contact details' },
  '/admin/admissions': { title: 'Admissions Dashboard', subtitle: 'Protocol content, requirements, fees & FAQs' },
  '/admin/applications': { title: 'Applications', subtitle: 'Review and manage student applications' },
  '/admin/contact-messages': { title: 'Contact Messages', subtitle: 'Messages from parents and visitors' },
  '/admin/pages': { title: 'Pages', subtitle: 'Custom website pages' },
  '/admin/posts': { title: 'News', subtitle: 'Announcements and school updates' },
  '/admin/events': { title: 'Events', subtitle: 'School calendar and activities' },
  '/admin/staff': { title: 'Staff', subtitle: 'Faculty and administration profiles' },
  '/admin/gallery': { title: 'Gallery', subtitle: 'School photos and media' },
};

export default function AdminLayout() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDashboard = location.pathname === '/admin';

  const pageMeta = pageTitles[location.pathname] || {
    title: 'Administration',
    subtitle: 'School content management',
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] text-slate-500">
        <div className="animate-pulse font-medium">Loading...</div>
      </div>
    );
  }

  if (location.pathname === '/admin/login') {
    if (isAuthenticated) return <Navigate to="/admin" replace />;
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Seo title={pageMeta.title} description="School administration portal" noindex path={location.pathname} />

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 sm:px-4 py-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 -ml-1 rounded-xl text-rw-navy hover:bg-slate-100 transition"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-rw-navy truncate">{pageMeta.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{pageMeta.subtitle}</p>
        </div>
        <img src="/logo.jpg" alt="" className="w-8 h-8 object-contain rounded-lg border border-slate-100" />
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100vw-3rem,240px)] flex-col bg-white border-r border-slate-200/80 transition-transform duration-200 ease-out lg:translate-x-0 lg:z-40 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0 flex items-center justify-between gap-2">
          <Link to="/admin" className="flex items-center gap-3 group min-w-0" onClick={() => setSidebarOpen(false)}>
            <img
              src="/logo.jpg"
              alt="School logo"
              className="w-10 h-10 object-contain rounded-xl border border-slate-100 p-1 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-sm text-rw-navy leading-tight truncate">Elena Guerra</div>
              <div className="text-[10px] font-semibold text-brand-red-600 tracking-wide uppercase">
                Admin
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overscroll-contain">
          {links.map((link) => (
            <NavItem key={link.to} link={link} onNavigate={() => setSidebarOpen(false)} />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 shrink-0 space-y-0.5">
          <div className="px-3 py-2 mb-1 rounded-xl bg-slate-50">
            <p className="text-xs font-semibold text-rw-navy truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'Admin'}</p>
          </div>
          <NavLink
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-rw-navy text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-rw-navy'
              }`
            }
          >
            <Settings size={18} strokeWidth={1.75} className="shrink-0" />
            Settings
          </NavLink>
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rw-navy transition"
          >
            <HelpCircle size={18} strokeWidth={1.75} />
            Support
          </button>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rw-navy transition"
          >
            <ExternalLink size={18} strokeWidth={1.75} />
            View website
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-brand-red-600 transition"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:ml-[240px] flex min-h-dvh lg:h-screen min-w-0 flex-col overflow-hidden">
        {!isDashboard && (
          <header className="hidden lg:block shrink-0 bg-white border-b border-slate-200/80 px-6 py-4">
            <h1 className="text-lg font-semibold text-rw-navy">{pageMeta.title}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{pageMeta.subtitle}</p>
          </header>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 lg:p-6 w-full max-w-[100vw]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NavItem({ link, onNavigate }) {
  const Icon = link.icon;
  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
          isActive
            ? 'bg-rw-navy text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-50 hover:text-rw-navy'
        }`
      }
    >
      <Icon size={18} strokeWidth={1.75} className="shrink-0" />
      {link.label}
    </NavLink>
  );
}

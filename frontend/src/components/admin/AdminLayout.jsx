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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const isDashboard = location.pathname === '/admin';

  const pageMeta = pageTitles[location.pathname] || {
    title: 'Administration',
    subtitle: 'School content management',
  };

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
      <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-[240px] flex-col bg-white border-r border-slate-200/80">
        <div className="p-5 border-b border-slate-100 shrink-0">
          <Link to="/admin" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="School logo"
              className="w-10 h-10 object-contain rounded-xl border border-slate-100 p-1"
            />
            <div className="min-w-0">
              <div className="font-bold text-sm text-rw-navy leading-tight">Elena Guerra</div>
              <div className="text-[10px] font-semibold text-brand-red-600 tracking-wide uppercase">
                Admin
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map((link) => (
            <NavItem key={link.to} link={link} />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 shrink-0 space-y-0.5">
          <NavLink
            to="/admin/settings"
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

      <div className="ml-[240px] flex h-screen min-w-0 flex-col overflow-hidden">
        {!isDashboard && (
          <header className="shrink-0 bg-white border-b border-slate-200/80 px-6 py-4">
            <h1 className="text-lg font-semibold text-rw-navy">{pageMeta.title}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{pageMeta.subtitle}</p>
          </header>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 lg:p-6 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NavItem({ link }) {
  const Icon = link.icon;
  return (
    <NavLink
      to={link.to}
      end={link.end}
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

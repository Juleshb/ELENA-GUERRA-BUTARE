import { Link, Outlet, useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail, ChevronRight, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import GetInTouchFab from './GetInTouchFab';
import { DesktopNav, MobileNav } from './NavMenu';
import { resolveLogoUrl } from '../lib/brand';

const SCHOOL_MOTTO = 'Esprit, garde-nous dans ton amour';

const FOOTER_GROUPS = [
  {
    title: 'About',
    links: [
      { to: '/about', label: 'Our Story' },
      { to: '/staff', label: 'Staff' },
      { to: '/gallery', label: 'Gallery' },
    ],
  },
  {
    title: 'Admissions',
    links: [
      { to: '/admissions', label: 'Admissions & Fees' },
      { to: '/apply', label: 'Apply Online' },
      { to: '/apply/track', label: 'Track Application' },
    ],
  },
  {
    title: 'Campus Life',
    links: [
      { to: '/news', label: 'News' },
      { to: '/events', label: 'Events' },
      { to: '/contact', label: 'Contact' },
    ],
  },
];

export default function Layout() {
  const [settings, setSettings] = useState(null);
  const [navPages, setNavPages] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const logoSrc = resolveLogoUrl(settings?.logoUrl);
  const schoolName = settings?.schoolName || 'C.S ELENA GUERRA';
  const schoolLocation = settings?.tagline || 'BUTARE';

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data));
    api.get('/pages').then((res) => {
      setNavPages(res.data.filter((p) => p.showInNav));
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-rw-navy text-white text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="hidden md:inline-flex items-center gap-1 text-blue-200 hover:text-white transition-colors duration-300"
              >
                <Mail size={12} />
                {settings.email}
              </a>
            )}
            <span className="font-semibold text-rw-gold-400 tracking-wide italic hidden sm:inline">
              {SCHOOL_MOTTO}
            </span>
            <span className="text-blue-300 hidden lg:inline">|</span>
            <span className="text-blue-200 hidden lg:inline">Butare, Rwanda</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-blue-200">
            <Link
              to="/events"
              className="hover:text-white font-medium transition-colors duration-300 hidden sm:inline"
            >
              Calendar &amp; Events
            </Link>
            <Link
              to="/apply"
              className="hover:text-rw-gold-400 font-semibold transition-colors duration-300 text-white/90"
            >
              Apply Now
            </Link>
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="hover:text-white transition-colors duration-300 hidden md:inline"
              >
                {settings.phone}
              </a>
            )}
            <Link
              to="/admin"
              className="hover:text-rw-gold-400 font-medium transition-colors duration-300 hidden sm:inline"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="rw-tricolor" />

      <header
        className={`glass-nav-header sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled ? 'glass-nav-header-scrolled' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="glass-panel rounded-2xl p-1.5 shadow-sm">
                <img
                  src={logoSrc}
                  alt={`${schoolName} logo`}
                  className="h-14 w-14 object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <div className="font-bold text-rw-blue-800 text-base md:text-lg leading-tight tracking-tight group-hover:text-rw-blue-600 transition-colors duration-300">
                  {schoolName}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="h-px w-4 bg-brand-red-600 hidden sm:block transition-all duration-300 group-hover:w-6" />
                  <span className="text-brand-red-600 text-xs md:text-sm font-bold tracking-widest uppercase">
                    {schoolLocation}
                  </span>
                  <span className="h-px w-4 bg-brand-red-600 hidden sm:block transition-all duration-300 group-hover:w-6" />
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="lg:hidden p-2.5 rounded-xl glass-panel text-rw-navy transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <DesktopNav extraPages={navPages} />
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            } lg:hidden`}
          >
            <div className="overflow-hidden">
              {mobileOpen && (
                <div className="mobile-glass-menu mobile-nav-enter">
                  <MobileNav extraPages={navPages} onNavigate={() => setMobileOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div key={location.pathname} className="page-enter">
          <Outlet context={{ settings }} />
        </div>
      </main>

      <footer className="bg-rw-navy text-blue-100 mt-auto">
        <div className="rw-tricolor" />
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={logoSrc}
                alt=""
                className="h-14 w-14 object-contain bg-white/5 rounded-lg p-1"
              />
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{schoolName}</h3>
                <p className="text-brand-red-500 text-sm font-bold tracking-widest uppercase mt-0.5">
                  {schoolLocation}
                </p>
                <p className="text-rw-gold-400 text-xs font-medium italic mt-1">{SCHOOL_MOTTO}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-blue-200/90">
              {settings?.about
                ? settings.about.replace(/<[^>]*>/g, '').slice(0, 160) + '...'
                : 'A Catholic school in Butare committed to faith, knowledge, and character.'}
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="hover:text-rw-gold-400 transition-all duration-300 flex items-center gap-1 group"
                    >
                      <ChevronRight
                        size={14}
                        className="text-brand-red-500 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              {settings?.address && (
                <li className="flex gap-2">
                  <MapPin size={16} className="text-rw-gold-400 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings?.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-white flex gap-2 transition-colors duration-300"
                  >
                    <Phone size={16} className="text-rw-gold-400 shrink-0" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white flex gap-2 transition-colors duration-300"
                  >
                    <Mail size={16} className="text-rw-gold-400 shrink-0" />
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
            <Link
              to="/contact"
              className="inline-block mt-4 text-sm font-semibold text-rw-gold-400 hover:text-white transition-all duration-300"
            >
              <span className="inline-flex items-center gap-1 group">
                Contact Us{' '}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-blue-300">
            <span>
              © {new Date().getFullYear()} {schoolName}. All rights reserved.
            </span>
            <span className="italic text-rw-gold-400">{SCHOOL_MOTTO}</span>
          </div>
        </div>
      </footer>

      <GetInTouchFab />
    </div>
  );
}

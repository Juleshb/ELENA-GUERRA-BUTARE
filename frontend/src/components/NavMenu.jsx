import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

const NAV_GROUPS = [
  {
    id: 'about',
    label: 'About',
    items: [
      { to: '/about', label: 'Our Story', description: 'Mission, vision & values' },
      { to: '/staff', label: 'Staff', description: 'Meet our team' },
      { to: '/gallery', label: 'Gallery', description: 'Campus & school life' },
    ],
  },
  {
    id: 'admissions',
    label: 'Admissions',
    items: [
      { to: '/admissions', label: 'Admissions & Fees', description: 'Protocol & requirements' },
      { to: '/apply', label: 'Apply Online', description: 'Start your application' },
      { to: '/apply/track', label: 'Track Application', description: 'Check your status' },
    ],
  },
  {
    id: 'campus',
    label: 'Campus Life',
    items: [
      { to: '/news', label: 'News', description: 'Latest announcements' },
      { to: '/events', label: 'Events', description: 'Calendar & activities' },
    ],
  },
];

function isGroupActive(group, pathname) {
  return group.items.some(
    (item) => pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
  );
}

function isItemActive(pathname, to) {
  if (to === '/') return pathname === '/';
  if (to === '/apply') {
    return pathname === '/apply' || pathname === '/apply/success';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DesktopNav({ extraPages = [] }) {
  const [openId, setOpenId] = useState(null);
  const location = useLocation();
  const navRef = useRef(null);
  const closeTimerRef = useRef(null);

  const openMenu = (id) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenId(id);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpenId(null), 150);
  };

  useEffect(() => {
    setOpenId(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const allGroups = [
    ...NAV_GROUPS,
    ...(extraPages.length
      ? [
          {
            id: 'pages',
            label: 'More',
            items: extraPages.map((p) => ({
              to: `/page/${p.slug}`,
              label: p.title,
              description: p.excerpt?.slice(0, 40) || 'Read more',
            })),
          },
        ]
      : []),
  ];

  return (
    <nav ref={navRef} className="glass-nav-pill hidden lg:flex items-center gap-0.5">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
      >
        Home
      </NavLink>

      {allGroups.map((group) => {
        const active = isGroupActive(group, location.pathname);
        const isOpen = openId === group.id;

        return (
          <div
            key={group.id}
            className="relative"
            onMouseEnter={() => openMenu(group.id)}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={`nav-link inline-flex items-center gap-1 ${active ? 'nav-link-active' : ''} ${
                isOpen ? 'nav-link-open' : ''
              }`}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {group.label}
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 min-w-[260px]">
                <div className="nav-dropdown glass-panel py-2 px-1">
                  <div className="h-px mx-3 mb-1 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  {group.items.map((item, i) => {
                    const itemActive = isItemActive(location.pathname, item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`nav-dropdown-item block px-4 py-3 mx-1 rounded-xl transition-all duration-300 group ${
                          itemActive ? 'nav-dropdown-item-active' : ''
                        }`}
                        style={{ animationDelay: `${i * 50}ms` }}
                        onClick={() => setOpenId(null)}
                      >
                        <span className="font-semibold text-sm text-rw-navy group-hover:text-rw-blue-600 transition-colors">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="block text-xs text-slate-500/90 mt-0.5 group-hover:text-slate-600">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <NavLink
        to="/contact"
        className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
      >
        Contact
      </NavLink>

      <Link
        to="/apply"
        className="glass-apply-btn ml-1 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
      >
        Apply
      </Link>
    </nav>
  );
}

export function MobileNav({ extraPages = [], onNavigate }) {
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();

  const allGroups = [
    ...NAV_GROUPS,
    ...(extraPages.length
      ? [
          {
            id: 'pages',
            label: 'More',
            items: extraPages.map((p) => ({
              to: `/page/${p.slug}`,
              label: p.title,
            })),
          },
        ]
      : []),
  ];

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <nav className="flex flex-col gap-0.5">
      <NavLink
        to="/"
        end
        onClick={onNavigate}
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
      >
        Home
      </NavLink>

      {allGroups.map((group) => {
        const isExpanded = expanded === group.id;
        const active = isGroupActive(group, location.pathname);

        return (
          <div key={group.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(group.id)}
              className={`mobile-nav-link w-full flex items-center justify-between ${
                active ? 'text-rw-blue-700 font-semibold mobile-nav-link-active' : ''
              }`}
            >
              {group.label}
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`mobile-submenu grid transition-all duration-300 ease-out ${
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pl-3 pb-2 pt-1 space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                          isActive
                            ? 'mobile-nav-link-active font-medium'
                            : 'text-slate-600 hover:bg-white/40'
                        }`
                      }
                    >
                      <ChevronRight size={14} className="text-brand-red-500 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <NavLink
        to="/contact"
        onClick={onNavigate}
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
      >
        Contact
      </NavLink>

      <Link
        to="/apply"
        onClick={onNavigate}
        className="glass-apply-btn mx-1 mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white text-center transition-all duration-300 active:scale-[0.98]"
      >
        Apply Online
      </Link>
    </nav>
  );
}

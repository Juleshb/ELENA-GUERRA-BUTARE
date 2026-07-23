import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ClipboardList,
  Mail,
  Calendar,
  Newspaper,
  Users,
  ArrowUpRight,
  Bell,
  Search,
  FileText,
  Image,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import MiniCalendar from '../../components/admin/MiniCalendar';

const STATUS_LABELS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WAITLISTED: 'Waitlisted',
};

const STATUS_COLORS = {
  PENDING: '#d71920',
  UNDER_REVIEW: '#1e5a9e',
  ACCEPTED: '#008f45',
  REJECTED: '#94a3b8',
  WAITLISTED: '#7c3aed',
};

const LEVEL_LABELS = {
  PRIMARY: 'Primary',
  ORDINARY_LEVEL: 'O-Level',
  ADVANCED_LEVEL: 'A-Level',
};

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function DonutChart({ segments, total, label }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {segments.map((seg) => {
            const dash = (seg.value / total) * circumference;
            const el = (
              <circle
                key={seg.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-rw-navy">{total}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
        </div>
      </div>
      <ul className="space-y-2 flex-1">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              {seg.label}
            </span>
            <span className="font-semibold text-rw-navy tabular-nums">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AreaChart({ data, labels }) {
  const max = Math.max(...data, 1);
  const w = 320;
  const h = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - (v / max) * (h - 16) - 8;
    return `${x},${y}`;
  });
  const area = `M0,${h} L${points.join(' L')} L${w},${h} Z`;
  const line = `M${points.join(' L')}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e5a9e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1e5a9e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke="#1e5a9e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-2 h-36 pt-4">
      {data.map((v, i) => (
        <div key={labels[i]} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-rw-blue-700 to-rw-blue-500 transition-all"
            style={{ height: `${Math.max((v / max) * 100, 8)}%` }}
          />
          <span className="text-[10px] text-slate-500 font-medium">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, to, variant = 'light' }) {
  const styles = {
    light: 'bg-rw-blue-50 text-rw-navy border-rw-blue-100',
    soft: 'bg-white text-rw-navy border-slate-200',
    dark: 'bg-rw-navy text-white border-rw-navy',
  };

  return (
    <Link
      to={to}
      className={`rounded-2xl border p-3.5 sm:p-5 shadow-sm hover:shadow-md transition group relative overflow-hidden ${styles[variant]}`}
    >
      <ArrowUpRight
        size={18}
        className={`absolute top-3 right-3 sm:top-4 sm:right-4 opacity-40 group-hover:opacity-100 transition ${
          variant === 'dark' ? 'text-white' : 'text-rw-navy'
        }`}
      />
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${variant === 'dark' ? 'text-white' : 'text-rw-navy'}`}>
        {value}
      </p>
      <p className={`text-xs sm:text-sm font-medium mt-1 pr-5 ${variant === 'dark' ? 'text-blue-100' : 'text-slate-600'}`}>
        {label}
      </p>
    </Link>
  );
}

function Card({ title, action, actionTo, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>
      {(title || actionTo) && (
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100">
          {title && <h3 className="text-sm font-semibold text-rw-navy truncate">{title}</h3>}
          {actionTo && (
            <Link to={actionTo} className="text-xs font-medium text-rw-blue-600 hover:underline shrink-0">
              {action}
            </Link>
          )}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({});
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    Promise.all([
      api.get('/applications'),
      api.get('/contact'),
      api.get('/events?admin=true'),
      api.get('/posts?admin=true'),
      api.get('/pages?admin=true'),
      api.get('/staff?admin=true'),
      api.get('/gallery?admin=true'),
      api.get('/admissions?admin=true'),
    ])
      .then(([apps, contact, ev, po, pages, staff, gallery, admissions]) => {
        setApplications(apps.data);
        setMessages(contact.data);
        const now = new Date();
        setEvents(
          ev.data
            .filter((e) => new Date(e.startDate) >= now)
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        );
        setPosts(po.data.filter((p) => p.published));
        setCounts({
          staff: staff.data.length,
          gallery: gallery.data.length,
          pages: pages.data.length,
          drafts: po.data.filter((p) => !p.published).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const unreadMessages = messages.filter((m) => !m.read);

  const levelSegments = useMemo(() => {
    const keys = Object.keys(LEVEL_LABELS);
    const colors = ['#1e5a9e', '#d71920', '#5b9bd5'];
    return keys
      .map((key, i) => ({
        label: LEVEL_LABELS[key],
        value: applications.filter((a) => a.level === key).length,
        color: colors[i],
      }))
      .filter((s) => s.value > 0);
  }, [applications]);

  const statusSegments = useMemo(() => {
    return Object.keys(STATUS_LABELS)
      .map((key) => ({
        label: STATUS_LABELS[key],
        value: applications.filter((a) => a.status === key).length,
        color: STATUS_COLORS[key],
      }))
      .filter((s) => s.value > 0);
  }, [applications]);

  const monthlyApps = useMemo(() => {
    const months = [];
    const labels = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      labels.push(d.toLocaleString('en', { month: 'short' }));
      months.push(
        applications.filter((a) => {
          const s = new Date(a.submittedAt);
          return s.getFullYear() === d.getFullYear() && s.getMonth() === d.getMonth();
        }).length
      );
    }
    return { data: months, labels };
  }, [applications]);

  const weekdayActivity = useMemo(() => {
    const days = [0, 0, 0, 0, 0];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    [...applications, ...messages].forEach((item) => {
      const d = new Date(item.submittedAt || item.createdAt);
      const day = d.getDay();
      if (day >= 1 && day <= 5) days[day - 1] += 1;
    });
    return { data: days, labels };
  }, [applications, messages]);

  const recentActivity = useMemo(() => {
    const items = [
      ...applications.map((a) => ({
        id: a.id,
        type: 'application',
        text: `New application from ${a.studentFirstName} ${a.studentLastName}`,
        time: a.submittedAt,
      })),
      ...messages.map((m) => ({
        id: m.id,
        type: 'message',
        text: `Message from ${m.name}`,
        time: m.createdAt,
      })),
    ];
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  }, [applications, messages]);

  const publishedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)).slice(0, 4),
    [posts]
  );

  const recentMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
    [messages]
  );

  const eventDates = useMemo(() => events.map((e) => new Date(e.startDate)), [events]);

  const initials = (user?.name || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 sm:space-y-6">
        <div className="h-12 bg-white rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 sm:h-28 bg-white rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-56 bg-white rounded-2xl" />
          <div className="h-56 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-rw-navy shrink-0 hidden lg:block">Dashboard</h2>
          <div className="relative flex-1 max-w-xl w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search applications, messages…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30 focus:border-rw-blue-400 shadow-sm"
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Applications" value={applications.length} to="/admin/applications" variant="light" />
          <StatCard label="Staff profiles" value={counts.staff ?? 0} to="/admin/staff" variant="soft" />
          <StatCard label="Messages" value={messages.length} to="/admin/contact-messages" variant="soft" />
          <StatCard label="Published news" value={posts.length} to="/admin/posts" variant="dark" />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
          <Card title="Applications by level">
            {levelSegments.length > 0 ? (
              <DonutChart
                segments={levelSegments}
                total={applications.length}
                label="Total"
              />
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">No applications yet.</p>
            )}
          </Card>
          <Card title="Applications over time">
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rw-blue-600" />
                Submissions
              </span>
            </div>
            <AreaChart data={monthlyApps.data} labels={monthlyApps.labels} />
          </Card>
        </div>

        {/* Activity row */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
          <Card title="Weekly portal activity">
            <BarChart data={weekdayActivity.data} labels={weekdayActivity.labels} />
          </Card>
          <Card title="Application status">
            {statusSegments.length > 0 ? (
              <DonutChart
                segments={statusSegments}
                total={applications.length}
                label="Apps"
              />
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">No data yet.</p>
            )}
          </Card>
        </div>

        {/* Notice + messages */}
        <div className="grid lg:grid-cols-5 gap-3 sm:gap-4">
          <Card title="Notice board" action="Manage" actionTo="/admin/posts" className="lg:col-span-3">
            {publishedPosts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No published news yet.</p>
            ) : (
              <ul className="space-y-3">
                {publishedPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      to="/admin/posts"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rw-blue-50 text-rw-blue-700 flex items-center justify-center shrink-0">
                        <Newspaper size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-rw-navy group-hover:text-rw-blue-600 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Draft'}
                          {post.excerpt ? ` · ${post.excerpt.slice(0, 50)}…` : ''}
                        </p>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-rw-blue-600 shrink-0 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Messages" action="Inbox" actionTo="/admin/contact-messages" className="lg:col-span-2">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No messages yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentMessages.map((msg) => (
                  <li key={msg.id}>
                    <Link
                      to="/admin/contact-messages"
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-rw-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {msg.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-rw-navy truncate flex items-center gap-1.5">
                          {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-red-500 shrink-0" />}
                          {msg.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {msg.subject || msg.message}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Right sidebar — stacks under main content on smaller screens */}
      <aside className="w-full xl:w-72 shrink-0 flex flex-col gap-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rw-blue-600 to-rw-navy text-white text-sm font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-rw-navy truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <Link
            to="/admin/contact-messages"
            className="relative p-2 rounded-xl hover:bg-slate-50 text-slate-500"
          >
            <Bell size={18} />
            {unreadMessages.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red-500" />
            )}
          </Link>
        </div>

        <MiniCalendar
          viewDate={calendarDate}
          onViewDateChange={setCalendarDate}
          selectedDate={new Date()}
          markedDates={eventDates}
        />

        <Card title="Upcoming events" action="All" actionTo="/admin/events">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No upcoming events.</p>
          ) : (
            <ul className="space-y-3 -mx-1">
              {events.slice(0, 4).map((event) => {
                const start = new Date(event.startDate);
                return (
                  <li key={event.id}>
                    <Link
                      to="/admin/events"
                      className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="w-12 shrink-0 rounded-xl bg-brand-red-50 text-brand-red-700 flex flex-col items-center justify-center py-1.5 border border-brand-red-100">
                        <span className="text-sm font-bold leading-none">{start.getDate()}</span>
                        <span className="text-[9px] uppercase font-semibold">
                          {start.toLocaleString('en', { month: 'short' })}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm font-medium text-rw-navy line-clamp-2 leading-snug mt-0.5">
                          {event.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Recent activity">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item) => (
                <li key={`${item.type}-${item.id}`} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === 'application'
                        ? 'bg-rw-blue-50 text-rw-blue-700'
                        : 'bg-brand-red-50 text-brand-red-600'
                    }`}
                  >
                    {item.type === 'application' ? (
                      <ClipboardList size={14} />
                    ) : (
                      <MessageSquare size={14} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{relativeTime(item.time)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quick content links */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: GraduationCap, label: 'Admissions', to: '/admin/admissions' },
            { icon: Image, label: 'Gallery', to: '/admin/gallery' },
            { icon: FileText, label: 'Pages', to: '/admin/pages' },
            { icon: Trophy, label: 'Review', to: '/admin/applications' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-rw-blue-200 hover:bg-rw-blue-50/30 transition text-center shadow-sm"
            >
              <item.icon size={18} className="text-rw-blue-600" />
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

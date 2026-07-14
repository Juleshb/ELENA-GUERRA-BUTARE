import { Link } from 'react-router-dom';
import {
  School,
  Calendar,
  Users,
  Newspaper,
  Camera,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { ReadMoreLink } from '../ui/Button';
import { Reveal, RevealGroup } from '../ui/Reveal';

const EXPLORE_LINKS = [
  {
    to: '/about',
    title: 'About Our School',
    description: 'Mission, vision, history, and what makes C.S Elena Guerra unique.',
    icon: School,
    accent: 'from-rw-blue-600 to-rw-blue-800',
  },
  {
    to: '/events',
    title: 'Open Days & Events',
    description: 'Visit campus, meet teachers, and attend information sessions.',
    icon: Calendar,
    accent: 'from-brand-red-600 to-brand-red-700',
  },
  {
    to: '/staff',
    title: 'Meet Our Team',
    description: 'Head teacher, deputies, and department leaders ready to guide you.',
    icon: Users,
    accent: 'from-rw-blue-700 to-rw-navy',
  },
  {
    to: '/news',
    title: 'Latest News',
    description: 'Announcements, results, and updates from the school community.',
    icon: Newspaper,
    accent: 'from-rw-blue-600 to-rw-navy',
  },
  {
    to: '/gallery',
    title: 'Campus Gallery',
    description: 'Explore classrooms, labs, sports facilities, and student life.',
    icon: Camera,
    accent: 'from-brand-red-500 to-rw-blue-700',
  },
  {
    to: '/contact',
    title: 'Contact & Location',
    description: 'Directions, phone, email, and general enquiries.',
    icon: MapPin,
    accent: 'from-rw-navy to-rw-blue-900',
  },
];

export default function ExploreSection({ events = [], posts = [] }) {
  return (
    <section id="explore" className="scroll-mt-32">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-10 rounded-full bg-brand-red-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-red-600">Discover</p>
                <h2 className="text-2xl md:text-3xl font-bold text-rw-navy">Explore more</h2>
              </div>
            </div>
            <p className="text-slate-600 max-w-xl">
              Discover campus life, people, news, and how to reach C.S Elena Guerra.
            </p>
          </div>
        </div>
      </Reveal>

      <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {EXPLORE_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-hover flex flex-col"
            >
              <div className={`h-1.5 bg-gradient-to-r ${item.accent}`} />
              <div className="p-5 flex flex-col flex-1">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center mb-4 shadow-sm transition-transform duration-500 group-hover:scale-105`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-rw-navy group-hover:text-rw-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm mt-2 flex-1 leading-relaxed">{item.description}</p>
                <span className="mt-4 text-rw-blue-600 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                  Explore <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </RevealGroup>

      {(events.length > 0 || posts.length > 0) && (
        <RevealGroup className="grid md:grid-cols-2 gap-6">
          {events.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="font-bold text-rw-navy mb-4 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center">
                  <Calendar size={18} />
                </span>
                Upcoming for applicants
              </h3>
              <ul className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <li key={event.id} className="flex gap-3 text-sm p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-rw-blue-600 to-rw-navy text-white flex flex-col items-center justify-center text-xs font-bold shadow-sm">
                      <span>{new Date(event.startDate).getDate()}</span>
                      <span className="opacity-80 uppercase text-[10px]">
                        {new Date(event.startDate).toLocaleString('en', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-rw-navy">{event.title}</p>
                      {event.location && (
                        <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-brand-red-600" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <ReadMoreLink to="/events">View all events</ReadMoreLink>
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="font-bold text-rw-navy mb-4 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center">
                  <Newspaper size={18} />
                </span>
                Related news
              </h3>
              <ul className="space-y-4">
                {posts.slice(0, 3).map((post) => (
                  <li key={post.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <Link
                      to={`/news/${post.slug}`}
                      className="font-semibold text-rw-navy hover:text-rw-blue-600 text-sm line-clamp-2 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{post.excerpt}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <ReadMoreLink to="/news">Explore all news</ReadMoreLink>
              </div>
            </div>
          )}
        </RevealGroup>
      )}
    </section>
  );
}

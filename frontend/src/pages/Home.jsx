import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import api from '../api/client';
import { Button, ReadMoreLink } from '../components/ui/Button';
import HeroVideoBackground from '../components/HeroVideoBackground';
import { EmptyState } from '../components/ui/Card';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import { resolveLogoUrl } from '../lib/brand';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  School,
  Sparkles,
  Users,
} from 'lucide-react';

const MOTTO = 'Esprit, garde-nous dans ton amour';

const PROGRAMS = [
  {
    title: 'Primary',
    subtitle: 'P1 – P6',
    description: 'Foundational learning rooted in faith, literacy, and character.',
    to: '/admissions#levels',
    icon: BookOpen,
    accent: 'from-rw-blue-600 to-rw-blue-800',
  },
  {
    title: 'Ordinary Level',
    subtitle: 'S1 – S3',
    description: 'Strong academic core with values-based Catholic education.',
    to: '/admissions#levels',
    icon: School,
    accent: 'from-brand-red-600 to-brand-red-700',
  },
  {
    title: 'Advanced Level',
    subtitle: 'S4 – S6',
    description: 'Prepare for university, leadership, and service to society.',
    to: '/admissions#levels',
    icon: GraduationCap,
    accent: 'from-rw-blue-700 to-rw-navy',
  },
];

function ordinalDay(date) {
  const d = new Date(date).getDate();
  if (d > 3 && d < 21) return `${d}th`;
  switch (d % 10) {
    case 1:
      return `${d}st`;
    case 2:
      return `${d}nd`;
    case 3:
      return `${d}rd`;
    default:
      return `${d}th`;
  }
}

function formatEventTime(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const startStr = new Date(start).toLocaleTimeString('en-GB', opts).toUpperCase();
  if (!end) return startStr;
  const endStr = new Date(end).toLocaleTimeString('en-GB', opts).toUpperCase();
  return `${startStr} - ${endStr}`;
}

function HomeNewsCard({ post }) {
  const date = post.publishedAt || post.createdAt;
  const monthYear = new Date(date).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="group bg-white rounded-xl border border-slate-200/80 overflow-hidden card-hover flex flex-col h-full">
      <div className="relative h-52 overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            className="w-full h-full object-cover img-zoom"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rw-blue-100 via-white to-brand-red-50 flex items-center justify-center">
            <Sparkles size={40} className="text-rw-blue-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-rw-navy/80 via-rw-navy/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rw-gold-400 mb-1">
            {monthYear}
          </p>
          <h3 className="font-bold text-white text-lg leading-snug line-clamp-2">{post.title}</h3>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-slate-600 text-sm line-clamp-3 flex-1">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <ReadMoreLink to={`/news/${post.slug}`}>Read more</ReadMoreLink>
        </div>
      </div>
    </article>
  );
}

function HomeEventRow({ event }) {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;
  const multiDay =
    end &&
    (end.getDate() !== start.getDate() ||
      end.getMonth() !== start.getMonth() ||
      end.getFullYear() !== start.getFullYear());

  return (
    <Link
      to="/events"
      className="flex gap-5 md:gap-8 p-5 md:p-6 bg-white rounded-xl border border-slate-200/80 card-hover group"
    >
      <div className="shrink-0 w-20 md:w-24 text-center">
        <p className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-none">
          {ordinalDay(event.startDate)}
        </p>
        <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-rw-navy mt-1">
          {start.toLocaleString('en', { month: 'long' })}
        </p>
        {multiDay && end && (
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            – {ordinalDay(end)} {end.toLocaleString('en', { month: 'short' })}
          </p>
        )}
      </div>
      <div className="flex-1 min-w-0 border-l border-slate-200 pl-5 md:pl-8">
        <h3 className="font-bold text-rw-navy text-lg group-hover:text-rw-blue-600 transition">
          {event.title}
        </h3>
        <p className="text-sm font-semibold text-rw-blue-600 mt-1">
          {formatEventTime(event.startDate, event.endDate)}
        </p>
        {event.location && (
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0 text-brand-red-500" />
            {event.location}
          </p>
        )}
      </div>
      <ArrowRight
        size={20}
        className="shrink-0 text-slate-300 group-hover:text-rw-blue-600 group-hover:translate-x-1 transition self-center hidden sm:block"
      />
    </Link>
  );
}

export default function Home() {
  const { settings } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/posts').then((res) => setPosts(res.data.slice(0, 3)));
    api.get('/events').then((res) => {
      const upcoming = res.data
        .filter((e) => new Date(e.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .slice(0, 6);
      setEvents(upcoming.length ? upcoming : res.data.slice(0, 6));
    });
  }, []);

  const schoolName = settings?.schoolName || 'C.S ELENA GUERRA';
  const location = settings?.tagline || 'BUTARE';
  const aboutPlain = settings?.about?.replace(/<[^>]*>/g, '') || '';
  const heroTitle = settings?.heroTitle || schoolName;
  const heroSubtitle = settings?.heroSubtitle || MOTTO;

  return (
    <>
      {/* Welcome hero — cinematic video background */}
      <section className="hero-welcome relative bg-rw-navy text-white overflow-hidden flex items-center justify-center min-h-[88svh] md:min-h-[92svh]">
        <HeroVideoBackground videoUrl={settings?.heroImageUrl} />
        <div className="absolute inset-0 bg-gradient-to-b from-rw-navy/70 via-rw-navy/55 to-rw-blue-900/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,48,88,0.45)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rw-navy/60 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 w-full z-10 flex flex-col items-center justify-center min-h-[inherit]">
          <div className="max-w-3xl mx-auto text-center hero-content">
            <span className="hero-fade-in hero-delay-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-brand-red-300 text-xs font-bold uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red-500 animate-pulse" />
              Welcome to {schoolName}
            </span>

            <h1 className="hero-fade-in hero-delay-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] text-white tracking-tight drop-shadow-lg">
              {heroTitle}
            </h1>

            <div className="hero-fade-in hero-delay-3 flex items-center justify-center gap-3 my-6 md:my-8">
              <span className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-brand-red-500" />
              <p className="text-blue-100/95 text-lg md:text-xl lg:text-2xl italic font-medium max-w-xl leading-relaxed">
                &ldquo;{heroSubtitle}&rdquo;
              </p>
              <span className="h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-brand-red-500" />
            </div>

            <p className="hero-fade-in hero-delay-4 text-sm md:text-base text-blue-200/90 uppercase tracking-[0.25em] font-semibold">
              {location} · Rwanda
            </p>

            <div className="hero-fade-in hero-delay-5 flex flex-wrap justify-center gap-4 mt-10 md:mt-12">
              <Button
                to="/apply"
                variant="red"
                className="!px-8 !py-3.5 !text-base shadow-xl shadow-brand-red-600/30"
              >
                Apply Now
              </Button>
              <Button
                to="/about"
                variant="outline"
                className="!px-8 !py-3.5 !text-base !border-white/60 !text-white hover:!bg-white/15 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>
          </div>

          <a
            href="#home-continue"
            className="hero-fade-in hero-delay-6 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-blue-200/70 hover:text-white transition-colors duration-300 group"
            aria-label="Scroll to explore"
          >
            <span className="text-[10px] uppercase tracking-widest font-semibold">Explore</span>
            <span className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2 group-hover:border-white/60 transition-colors">
              <span className="w-1 h-2 rounded-full bg-white/80 animate-bounce" />
            </span>
          </a>
        </div>

        <div className="rw-tricolor absolute bottom-0 left-0 right-0 z-10" />
      </section>

      <div id="home-continue" className="scroll-mt-20" />

      {/* Big statement + logo — "Go further" style */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <Reveal className="lg:col-span-7 order-2 lg:order-1" variant="left">
              <p className="text-brand-red-600 font-bold text-sm uppercase tracking-[0.2em] mb-3">
                {location}, Rwanda
              </p>
              <h2 className="home-display-title">
                Grow in faith,
                <br />
                <span className="text-rw-blue-600">excel in learning</span>
              </h2>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed max-w-xl">
                {settings?.vision ||
                  "We foster academic excellence, responsibility, and respect while nurturing school spirit rooted in Catholic values. Our vision is a community where God's love is evident and students are prepared to serve both God and society with compassion and integrity."}
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Button to="/about" variant="primary">
                  Discover our story
                </Button>
                <Button to="/admissions" variant="secondary">
                  Admissions & fees
                </Button>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-5 order-1 lg:order-2 flex justify-center" variant="right" delay={2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-rw-blue-100 to-brand-red-50 rounded-3xl rotate-3 transition-transform duration-700 hover:rotate-6" />
                <div className="relative bg-white rounded-2xl p-8 md:p-10 border border-slate-200/80 shadow-xl transition-transform duration-500 hover:-translate-y-1">
                  <img
                    src={resolveLogoUrl(settings?.logoUrl)}
                    alt={`${schoolName} logo`}
                    className="w-48 h-48 md:w-56 md:h-56 object-contain mx-auto transition-transform duration-700 hover:scale-105"
                  />
                  <p className="text-center font-bold text-rw-navy mt-4 text-lg">{heroTitle}</p>
                  <p className="text-center text-brand-red-600 text-xs font-bold tracking-widest uppercase mt-1">
                    {location}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Which level suits you? */}
      <section className="bg-gradient-to-br from-rw-blue-50 via-rw-blue-50/60 to-brand-red-50/40 border-y border-rw-blue-100/80">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="home-section-heading section-title-animate">
              Which academic level
              <br />
              <span className="text-brand-red-600">suits you?</span>
            </h2>
            <Link
              to="/admissions#levels"
              className="inline-flex items-center gap-2 mt-6 text-rw-blue-600 font-semibold hover:text-rw-blue-700 group transition-colors duration-300"
            >
              Find your level
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </Reveal>

          <RevealGroup className="grid md:grid-cols-3 gap-6">
            {PROGRAMS.map((program) => (
              <Link
                key={program.title}
                to={program.to}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 card-hover"
              >
                <div className={`h-2 bg-gradient-to-r ${program.accent}`} />
                <div className="p-6 md:p-7">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.accent} text-white flex items-center justify-center mb-4 shadow-md`}
                  >
                    <program.icon size={22} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {program.subtitle}
                  </p>
                  <h3 className="text-xl font-bold text-rw-navy mt-1 group-hover:text-rw-blue-600 transition">
                    {program.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed">{program.description}</p>
                  <span className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-rw-blue-600">
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* New or returning applicant */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="home-section-heading section-title-animate">
            Are you applying
            <br />
            <span className="text-rw-blue-600">for the first time</span>
            <br />
            or tracking an application?
          </h2>
          <p className="mt-4 text-slate-600">Choose the path that matches your situation</p>
        </Reveal>

        <RevealGroup className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            to="/apply"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rw-blue-600 to-rw-navy text-white p-8 md:p-10 card-hover"
          >
            <Users size={36} className="text-white/30 absolute top-6 right-6" />
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">New student</p>
            <h3 className="text-2xl font-bold mt-2">Apply online</h3>
            <p className="text-blue-100 mt-3 text-sm leading-relaxed max-w-sm">
              Submit your application digitally, upload documents, and receive a reference number
              for tracking.
            </p>
            <span className="inline-flex items-center gap-2 mt-6 font-semibold text-sm bg-white/15 px-4 py-2 rounded-lg group-hover:bg-white/25 transition">
              Start application <ArrowRight size={16} />
            </span>
          </Link>

          <Link
            to="/apply/track"
            className="group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-8 md:p-10 card-hover hover:border-rw-blue-300"
          >
            <GraduationCap size={36} className="text-rw-blue-100 absolute top-6 right-6" />
            <p className="text-brand-red-600 text-xs font-bold uppercase tracking-widest">
              Returning applicant
            </p>
            <h3 className="text-2xl font-bold text-rw-navy mt-2">Track your application</h3>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed max-w-sm">
              Already applied? Enter your reference number to check status updates from our
              admissions office.
            </p>
            <span className="inline-flex items-center gap-2 mt-6 font-semibold text-sm text-rw-blue-600 group-hover:gap-3 transition-all">
              Track status <ArrowRight size={16} />
            </span>
          </Link>
        </RevealGroup>
      </section>

      {/* News */}
      <section className="bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="home-section-heading !text-left section-title-animate">News</h2>
            <ReadMoreLink to="/news">Read more</ReadMoreLink>
          </Reveal>
          {posts.length > 0 ? (
            <RevealGroup className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {posts.map((post) => (
                <HomeNewsCard key={post.id} post={post} />
              ))}
            </RevealGroup>
          ) : (
            <EmptyState message="No news published yet. Check back soon." />
          )}
        </div>
      </section>

      {/* Events */}
      <section className="bg-rw-slate">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="home-section-heading !text-left section-title-animate">Events</h2>
            <ReadMoreLink to="/events">View all events</ReadMoreLink>
          </Reveal>
          {events.length > 0 ? (
            <RevealGroup className="grid gap-4">
              {events.map((event) => (
                <HomeEventRow key={event.id} event={event} />
              ))}
            </RevealGroup>
          ) : (
            <EmptyState message="No upcoming events scheduled. Visit our events calendar soon." />
          )}
        </div>
      </section>

      {/* Our story */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rw-navy via-rw-blue-800 to-rw-navy" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="rw-tricolor absolute top-0 left-0 right-0" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal variant="left">
              <p className="text-rw-gold-400 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                Our story
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                A Catholic school in Butare dedicated to the whole person
              </h2>
              <p className="mt-6 text-blue-100 leading-relaxed">
                {aboutPlain ||
                  'C.S Elena Guerra Butare is a Catholic school dedicated to academic excellence, spiritual growth, and character formation. We welcome learners who seek knowledge rooted in faith and service to the community.'}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {settings?.mission && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5">
                    <Heart size={20} className="text-brand-red-400 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-1">
                      Mission
                    </p>
                    <p className="text-sm text-blue-50 line-clamp-4">{settings.mission}</p>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5">
                  <Sparkles size={20} className="text-rw-gold-400 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-1">
                    Location
                  </p>
                  <p className="text-sm text-blue-50">
                    {settings?.address || 'Butare, Huye District, Southern Province, Rwanda'}
                  </p>
                </div>
              </div>
              <Button to="/about" variant="red" className="mt-8">
                Find out more
              </Button>
            </Reveal>
            <Reveal variant="right" delay={2} className="flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                <div className="flex items-center gap-4">
                  <img
                    src={resolveLogoUrl(settings?.logoUrl)}
                    alt=""
                    className="w-20 h-20 object-contain bg-white/10 rounded-xl p-2"
                  />
                  <div>
                    <p className="font-bold text-white text-lg">{schoolName}</p>
                    <p className="text-brand-red-400 text-sm font-bold tracking-widest">{location}</p>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {settings?.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-3 bg-white rounded-xl p-4 text-rw-navy hover:shadow-lg transition card-hover"
                  >
                    <Mail size={20} className="text-rw-blue-600 shrink-0" />
                    <span className="text-sm font-medium truncate">{settings.email}</span>
                  </a>
                )}
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-3 bg-white rounded-xl p-4 text-rw-navy hover:shadow-lg transition card-hover"
                  >
                    <Phone size={20} className="text-rw-blue-600 shrink-0" />
                    <span className="text-sm font-medium">{settings.phone}</span>
                  </a>
                )}
                <Link
                  to="/events"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 text-rw-navy hover:shadow-lg transition card-hover sm:col-span-2"
                >
                  <Calendar size={20} className="text-brand-red-600 shrink-0" />
                  <span className="text-sm font-medium">Calendar &amp; events</span>
                  <ArrowRight size={16} className="ml-auto text-slate-400" />
                </Link>
                <Link
                  to="/my-messages"
                  className="flex items-center gap-3 bg-brand-red-600 rounded-xl p-4 text-white hover:bg-brand-red-700 transition card-hover sm:col-span-2"
                >
                  <MessageCircle size={20} className="shrink-0" />
                  <span className="text-sm font-semibold">Get in touch with us</span>
                  <ArrowRight size={16} className="ml-auto opacity-80" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

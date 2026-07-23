import { useEffect } from 'react';
import { Link, useOutletContext, useLocation } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import Seo from '../components/Seo';
import { mediaUrl } from '../lib/apiConfig';
import { BookOpen, Cross, GraduationCap, Heart, Quote, Target, Telescope, User } from 'lucide-react';

function plainText(value) {
  return (value || '').replace(/<[^>]*>/g, '').trim();
}

function paragraphs(text) {
  return plainText(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function StorySection({ id, eyebrow, title, children, icon: Icon }) {
  return (
    <section id={id} className="scroll-mt-28">
      <Reveal>
        <div className="flex items-start gap-4 mb-6">
          {Icon && (
            <span className="w-12 h-12 rounded-xl bg-rw-blue-50 text-rw-blue-700 flex items-center justify-center shrink-0">
              <Icon size={22} />
            </span>
          )}
          <div>
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-widest text-brand-red-600 mb-1">{eyebrow}</p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-rw-navy">{title}</h2>
          </div>
        </div>
        {children}
      </Reveal>
    </section>
  );
}

function ProseBlock({ text, className = '' }) {
  const parts = paragraphs(text);
  if (!parts.length) return null;
  return (
    <div className={`space-y-4 leading-relaxed ${className}`}>
      {parts.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

function SpeakerPortrait({ photoUrl, name, size = 'lg' }) {
  const src = mediaUrl(photoUrl);
  const sizes = {
    md: 'w-24 h-24 md:w-28 md:h-28',
    lg: 'w-36 h-36 md:w-44 md:h-44',
    xl: 'w-40 h-40 md:w-52 md:h-52',
  };
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${sizes[size]}`}>
      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-rw-blue-500 via-brand-red-500 to-rw-gold-400 opacity-80" />
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100">
        {src ? (
          <img src={src} alt={name || 'Speaker'} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rw-navy to-rw-blue-800 text-white">
            {name ? (
              <span className="text-2xl md:text-3xl font-bold tracking-wide">{initials}</span>
            ) : (
              <User size={40} className="opacity-70" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Speech layout: portrait + name plate + message */
function SpeechCard({
  photoUrl,
  name,
  role,
  message,
  variant = 'light',
}) {
  const isDark = variant === 'dark';

  return (
    <article
      className={`rounded-2xl overflow-hidden shadow-sm ${
        isDark
          ? 'bg-gradient-to-br from-rw-navy to-rw-blue-900 text-white shadow-xl'
          : 'bg-white border border-slate-200/80'
      }`}
    >
      {!isDark && <div className="h-1.5 bg-gradient-to-r from-rw-blue-600 via-brand-red-600 to-rw-blue-600" />}
      <div className="p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
          <div className="flex flex-col items-center text-center shrink-0">
            <SpeakerPortrait photoUrl={photoUrl} name={name} size={isDark ? 'xl' : 'lg'} />
            {(name || role) && (
              <div className="mt-4 max-w-[14rem]">
                {name && (
                  <p className={`font-bold text-lg leading-snug ${isDark ? 'text-white' : 'text-rw-navy'}`}>
                    {name}
                  </p>
                )}
                {role && (
                  <p
                    className={`text-sm mt-1 font-medium ${
                      isDark ? 'text-rw-gold-400' : 'text-rw-blue-700'
                    }`}
                  >
                    {role}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full">
            <Quote
              size={28}
              className={`mb-4 ${isDark ? 'text-rw-gold-400/80' : 'text-rw-blue-200'}`}
              strokeWidth={1.5}
            />
            <ProseBlock
              text={message}
              className={isDark ? 'text-blue-50' : 'text-slate-700'}
            />
            {name && (
              <p
                className={`mt-8 pt-5 border-t font-semibold ${
                  isDark ? 'border-white/15 text-white' : 'border-slate-100 text-rw-navy'
                }`}
              >
                — {name}
                {role && (
                  <span className={`block text-sm font-normal mt-0.5 ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>
                    {role}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function About() {
  const { settings } = useOutletContext();
  const location = useLocation();
  const schoolName = settings?.schoolName || 'C.S ELENA GUERRA';

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash, settings]);

  const nav = [
    { id: 'historical-background', label: 'History' },
    { id: 'principal-message', label: 'Principal' },
    { id: 'mother-elena', label: 'Mother Elena' },
    { id: 'director-message', label: 'Director of Studies' },
    { id: 'mission-vision', label: 'Mission & Vision' },
  ];

  const principalRole = [settings?.principalTitle || 'Headmistress', schoolName]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Seo
        title="About Us"
        description="Historical background, principal message, history of Saint Elena Guerra, mission and vision of C.S Elena Guerra Butare — Catholic school in Huye, Rwanda."
        path="/about"
      />
      <PageHeader
        title={`About ${schoolName}`}
        subtitle="Our story, leadership messages, and the legacy of Saint Elena Guerra"
        breadcrumbs={[{ label: 'About' }]}
      />

      <div className="sticky top-[72px] z-30 bg-white/90 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto nav-scroll">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-rw-blue-50 hover:text-rw-navy transition"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-16">
        {settings?.historicalBackground && (
          <StorySection
            id="historical-background"
            eyebrow="Our beginnings"
            title="Historical background"
            icon={BookOpen}
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-10 shadow-sm">
              <ProseBlock text={settings.historicalBackground} className="text-slate-700" />
            </div>
          </StorySection>
        )}

        {settings?.principalMessage && (
          <StorySection
            id="principal-message"
            eyebrow="Leadership"
            title="Principal message"
            icon={Quote}
          >
            <SpeechCard
              photoUrl={settings.principalPhotoUrl}
              name={settings.principalName}
              role={principalRole}
              message={settings.principalMessage}
            />
          </StorySection>
        )}

        {settings?.motherElenaHistory && (
          <StorySection
            id="mother-elena"
            eyebrow="Our foundress"
            title="History of Mother Elena Guerra"
            icon={Cross}
          >
            <SpeechCard
              photoUrl={settings.motherElenaPhotoUrl}
              name="Saint Elena Guerra"
              role="Foundress · Oblates of the Holy Spirit"
              message={settings.motherElenaHistory}
              variant="dark"
            />
          </StorySection>
        )}

        {settings?.directorMessage && (
          <StorySection
            id="director-message"
            eyebrow="Academics"
            title="Welcome from the Director of Studies"
            icon={GraduationCap}
          >
            <SpeechCard
              photoUrl={settings.directorPhotoUrl}
              name={settings.directorName}
              role="Director of Studies"
              message={settings.directorMessage}
            />
          </StorySection>
        )}

        <StorySection id="mission-vision" eyebrow="Who we are" title="Mission, vision & motto" icon={Heart}>
          <RevealGroup className="grid md:grid-cols-3 gap-5">
            {settings?.mission && (
              <article className="bg-white rounded-2xl border border-slate-200/80 p-6 card-hover">
                <Target className="text-rw-blue-600 mb-3" size={22} />
                <h3 className="font-bold text-rw-navy mb-2">Our mission</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{plainText(settings.mission)}</p>
              </article>
            )}
            {settings?.vision && (
              <article className="bg-white rounded-2xl border border-slate-200/80 p-6 card-hover">
                <Telescope className="text-brand-red-600 mb-3" size={22} />
                <h3 className="font-bold text-rw-navy mb-2">Our vision</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{plainText(settings.vision)}</p>
              </article>
            )}
            {settings?.schoolMotto && (
              <article className="bg-rw-navy rounded-2xl p-6 text-white card-hover">
                <Quote className="text-rw-gold-400 mb-3" size={22} />
                <h3 className="font-bold mb-2">Our motto</h3>
                <p className="text-blue-100 italic leading-relaxed">{plainText(settings.schoolMotto)}</p>
              </article>
            )}
          </RevealGroup>
        </StorySection>

        <Reveal className="text-center">
          <Link
            to="/admissions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-red-600 text-white font-semibold hover:bg-brand-red-700 transition"
          >
            Explore admissions
          </Link>
        </Reveal>
      </div>
    </>
  );
}

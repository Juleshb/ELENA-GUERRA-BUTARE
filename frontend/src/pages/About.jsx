import { useEffect } from 'react';
import { Link, useOutletContext, useLocation } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import Seo from '../components/Seo';
import { BookOpen, Cross, GraduationCap, Heart, Quote, Target, Telescope } from 'lucide-react';

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

function ProseBlock({ text }) {
  const parts = paragraphs(text);
  if (!parts.length) return null;
  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {parts.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
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
              <ProseBlock text={settings.historicalBackground} />
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
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-rw-blue-600 via-brand-red-600 to-rw-blue-600" />
              <div className="p-6 md:p-10">
                <p className="text-sm font-semibold text-rw-blue-700 mb-4">
                  {settings.principalTitle || 'Headmistress'} · {schoolName}
                </p>
                <ProseBlock text={settings.principalMessage} />
              </div>
            </div>
          </StorySection>
        )}

        {settings?.motherElenaHistory && (
          <StorySection
            id="mother-elena"
            eyebrow="Our foundress"
            title="History of Mother Elena Guerra"
            icon={Cross}
          >
            <div className="bg-gradient-to-br from-rw-navy to-rw-blue-900 rounded-2xl text-white p-6 md:p-10 shadow-xl">
              <div className="prose-invert space-y-4 text-blue-50 leading-relaxed">
                {paragraphs(settings.motherElenaHistory).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </StorySection>
        )}

        {settings?.directorMessage && (
          <StorySection
            id="director-message"
            eyebrow="Academics"
            title="Welcome from the Director of Studies"
            icon={GraduationCap}
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-10 shadow-sm">
              <ProseBlock text={settings.directorMessage} />
              {settings.directorName && (
                <p className="mt-6 pt-4 border-t border-slate-100 font-semibold text-rw-navy">
                  {settings.directorName}
                  <span className="block text-sm font-normal text-slate-500 mt-0.5">
                    Director of Studies
                  </span>
                </p>
              )}
            </div>
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

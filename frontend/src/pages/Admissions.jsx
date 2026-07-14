import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Card';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import SectionNav from '../components/admissions/SectionNav';
import LevelsExplorer from '../components/admissions/LevelsExplorer';
import FaqAccordion from '../components/admissions/FaqAccordion';
import ExploreSection from '../components/admissions/ExploreSection';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  ClipboardPen,
  Clock,
  FileCheck,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Sparkles,
  Wallet,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Eligibility: CheckCircle2,
  Documents: FileText,
  Assessment: ClipboardPen,
};

const CATEGORY_ACCENTS = {
  Eligibility: 'from-rw-blue-600 to-rw-blue-800',
  Documents: 'from-brand-red-600 to-brand-red-700',
  Assessment: 'from-rw-blue-700 to-rw-navy',
};

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-1 h-10 rounded-full bg-brand-red-600" />
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-brand-red-600">{eyebrow}</p>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-rw-navy">{title}</h2>
      </div>
    </div>
  );
}

function AdmissionsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-pulse">
      <div className="h-64 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export default function Admissions() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    Promise.all([api.get('/admissions'), api.get('/events'), api.get('/posts')])
      .then(([adm, ev, po]) => {
        setData(adm.data);
        setEvents(ev.data);
        setPosts(po.data);
        if (adm.data.steps?.length) setActiveStep(adm.data.steps[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sectionIds = [
      'overview',
      'levels',
      'process',
      'requirements',
      'fees',
      'faq',
      'explore',
      'contact',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Admissions Protocol"
          subtitle="Explore how to apply — study levels, steps, documents, fees & FAQs"
          breadcrumbs={[{ label: 'Admissions' }]}
        />
        <AdmissionsSkeleton />
      </>
    );
  }

  const { protocol, steps, requirements, fees, faqs } = data || {};
  const groupedReqs = (requirements || []).reduce((acc, req) => {
    if (!acc[req.category]) acc[req.category] = [];
    acc[req.category].push(req);
    return acc;
  }, {});

  const activeStepData = steps?.find((s) => s.id === activeStep);
  const activeIndex = steps?.findIndex((s) => s.id === activeStep) ?? 0;

  const quickStats = [
    { label: 'Steps', value: steps?.length || 0, icon: ClipboardList },
    { label: 'Levels', value: fees?.length || 0, icon: GraduationCap },
    { label: 'Documents', value: requirements?.length || 0, icon: FileText },
    { label: 'FAQs', value: faqs?.length || 0, icon: CircleHelp },
  ];

  return (
    <>
      <PageHeader
        title="Admissions Protocol"
        subtitle="Explore how to apply — study levels, steps, documents, fees & FAQs"
        breadcrumbs={[{ label: 'Admissions' }]}
      />

      <SectionNav activeSection={activeSection} />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-20 md:space-y-24">
        {/* Overview hero */}
        <section id="overview" className="scroll-mt-32">
          {(protocol?.intro || protocol?.overview) ? (
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rw-blue-600 via-brand-red-600 to-rw-blue-600" />
                <div className="grid lg:grid-cols-5 gap-0">
                  <div className="lg:col-span-3 p-6 md:p-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rw-blue-50 text-rw-blue-700 text-xs font-bold uppercase tracking-wide mb-5">
                      <Sparkles size={14} />
                      Admissions at C.S Elena Guerra
                    </div>
                    {protocol.intro && (
                      <p className="text-lg text-slate-700 leading-relaxed">{protocol.intro}</p>
                    )}
                    {protocol.overview && (
                      <p className="mt-4 text-slate-600 leading-relaxed">{protocol.overview}</p>
                    )}
                    {protocol.deadlineNote && (
                      <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-rw-navy">Important deadline</p>
                          <p className="text-slate-700 text-sm mt-1">{protocol.deadlineNote}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a
                        href="#process"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rw-blue-200 text-rw-blue-700 text-sm font-semibold hover:bg-rw-blue-50 transition-all duration-300"
                      >
                        View process <ArrowRight size={16} />
                      </a>
                      <a
                        href="#explore"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all duration-300"
                      >
                        Explore school <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-gradient-to-br from-rw-navy via-rw-blue-800 to-rw-blue-900 text-white p-6 md:p-8 flex flex-col justify-center">
                    <p className="text-rw-gold-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Apply online
                    </p>
                    <h3 className="text-xl font-bold leading-snug">
                      Submit your application digitally — no campus visit required
                    </h3>
                    <p className="text-blue-100 text-sm mt-3 leading-relaxed">
                      Upload documents, attach your registration fee slip, and track your status
                      online at any time.
                    </p>
                    <div className="flex flex-col gap-2 mt-6">
                      <Link
                        to="/apply"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-rw-navy rounded-xl text-sm font-bold hover:bg-rw-blue-50 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        Start application <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/apply/track"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/40 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all duration-300"
                      >
                        Track status
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <EmptyState message="Admissions overview coming soon." />
          )}

          <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3 card-hover"
                >
                  <span className="w-10 h-10 rounded-xl bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-rw-navy tabular-nums leading-none">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </RevealGroup>
        </section>

        <LevelsExplorer fees={fees || []} />

        {/* Process timeline */}
        <section id="process" className="scroll-mt-32">
          <Reveal>
            <SectionHeading
              eyebrow="Step by step"
              title="Admission process"
            />
            <p className="text-slate-600 mb-10 max-w-2xl">
              Follow each step in order. Select a step below to read the full details.
            </p>
          </Reveal>

          {steps?.length > 0 ? (
            <div className="space-y-8">
              {/* Progress bar — desktop */}
              <Reveal delay={1}>
                <div className="hidden lg:block relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-rw-blue-600 to-brand-red-600 transition-all duration-500"
                    style={{ width: `${(activeIndex / Math.max(steps.length - 1, 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {steps.map((step, i) => {
                      const isActive = activeStep === step.id;
                      const isPast = i < activeIndex;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setActiveStep(step.id)}
                          className="flex flex-col items-center gap-2 group w-24"
                        >
                          <span
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                              isActive
                                ? 'bg-rw-navy text-white shadow-lg shadow-rw-navy/30 scale-110'
                                : isPast
                                  ? 'bg-rw-blue-600 text-white'
                                  : 'bg-white border-2 border-slate-200 text-slate-500 group-hover:border-rw-blue-300'
                            }`}
                          >
                            {step.stepNumber}
                          </span>
                          <span
                            className={`text-xs font-medium text-center line-clamp-2 transition-colors ${
                              isActive ? 'text-rw-navy font-semibold' : 'text-slate-500'
                            }`}
                          >
                            {step.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Reveal>

              <div className="grid lg:grid-cols-5 gap-6">
                {/* Step list — mobile + sidebar */}
                <RevealGroup className="lg:col-span-2 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`shrink-0 lg:shrink flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-300 w-full ${
                        activeStep === step.id
                          ? 'bg-rw-navy text-white border-rw-navy shadow-lg'
                          : 'bg-white border-slate-200 hover:border-rw-blue-300 hover:bg-rw-blue-50/50'
                      }`}
                    >
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          activeStep === step.id
                            ? 'bg-white/15 text-white'
                            : 'bg-rw-blue-50 text-rw-blue-700'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <span className="font-semibold text-sm line-clamp-2">{step.title}</span>
                    </button>
                  ))}
                </RevealGroup>

                {/* Step detail panel */}
                <Reveal className="lg:col-span-3" variant="right" delay={2}>
                  {activeStepData ? (
                    <div className="relative bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 min-h-[220px] shadow-sm overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-rw-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-rw-blue-600 to-rw-navy text-white flex items-center justify-center font-bold text-lg shadow-md">
                            {activeStepData.stepNumber}
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-red-600">
                              Step {activeStepData.stepNumber} of {steps.length}
                            </p>
                            <h3 className="text-xl font-bold text-rw-navy">{activeStepData.title}</h3>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{activeStepData.description}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          {activeStepData.stepNumber < steps.length && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = steps.find(
                                  (s) => s.stepNumber === activeStepData.stepNumber + 1
                                );
                                if (next) setActiveStep(next.id);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rw-blue-600 text-white text-sm font-semibold hover:bg-rw-blue-700 transition-all duration-300"
                            >
                              Next step <ArrowRight size={16} />
                            </button>
                          )}
                          {activeStepData.stepNumber === steps.length && (
                            <Link
                              to="/apply"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red-600 text-white text-sm font-semibold hover:bg-brand-red-700 transition-all duration-300"
                            >
                              Start application <ArrowRight size={16} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Select a step to view details." />
                  )}
                </Reveal>
              </div>
            </div>
          ) : (
            <EmptyState message="Admission steps will be published soon." />
          )}
        </section>

        {/* Requirements */}
        <section id="requirements" className="scroll-mt-32">
          <Reveal>
            <SectionHeading eyebrow="What you need" title="Documents & requirements" />
            <p className="text-slate-600 mb-10 max-w-2xl">
              Gather all required documents before submitting your application package.
            </p>
          </Reveal>

          {Object.keys(groupedReqs).length > 0 ? (
            <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedReqs).map(([category, items]) => {
                const CatIcon = CATEGORY_ICONS[category] || FileCheck;
                const accent = CATEGORY_ACCENTS[category] || 'from-rw-blue-600 to-rw-navy';
                return (
                  <article
                    key={category}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-hover flex flex-col"
                  >
                    <div className={`px-5 py-4 bg-gradient-to-r ${accent} text-white flex items-center gap-3`}>
                      <CatIcon size={20} strokeWidth={2} aria-hidden />
                      <h3 className="font-bold">{category}</h3>
                      <span className="ml-auto text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                        {items.length}
                      </span>
                    </div>
                    <ul className="divide-y divide-slate-100 flex-1">
                      {items.map((req) => (
                        <li key={req.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-rw-green-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-rw-navy text-sm">{req.title}</p>
                                {req.level && (
                                  <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rw-green-50 text-rw-green-700">
                                    {req.level}
                                  </span>
                                )}
                              </div>
                              {req.description && (
                                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                                  {req.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </RevealGroup>
          ) : (
            <EmptyState message="Requirements will be published soon." />
          )}
        </section>

        {/* Fees */}
        <section id="fees" className="scroll-mt-32">
          <Reveal>
            <SectionHeading eyebrow="Investment" title="Registration fees" />
            <p className="text-slate-600 mb-10 max-w-2xl">
              Registration fees vary by study level. Payment slip must be uploaded with your online
              application.
            </p>
          </Reveal>

          {fees?.length > 0 ? (
            <>
              <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 lg:hidden">
                {fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 card-hover"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-xl bg-rw-green-50 text-rw-green-700 flex items-center justify-center">
                        <Wallet size={18} />
                      </span>
                      <p className="font-semibold text-rw-navy">{fee.level}</p>
                    </div>
                    <p className="text-2xl font-bold text-rw-green-700">{fee.amount}</p>
                    {fee.description && (
                      <p className="text-slate-500 text-sm mt-2">{fee.description}</p>
                    )}
                  </div>
                ))}
              </RevealGroup>

              <Reveal className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-rw-navy text-white text-left">
                      <th className="px-6 py-4 font-semibold">Level</th>
                      <th className="px-6 py-4 font-semibold">Fee</th>
                      <th className="px-6 py-4 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fees.map((fee, i) => (
                      <tr
                        key={fee.id}
                        className={`transition-colors hover:bg-rw-blue-50/50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        <td className="px-6 py-4 font-medium text-rw-navy">{fee.level}</td>
                        <td className="px-6 py-4 font-bold text-rw-green-700 text-base">{fee.amount}</td>
                        <td className="px-6 py-4 text-slate-600">{fee.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
            </>
          ) : (
            <EmptyState message="Fee information will be published soon." />
          )}
        </section>

        <FaqAccordion faqs={faqs || []} />

        <ExploreSection events={events} posts={posts} />

        {/* Contact */}
        <section id="contact" className="scroll-mt-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rw-navy via-rw-blue-800 to-rw-blue-900 text-white p-8 md:p-12 shadow-xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-brand-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-rw-gold-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Get in touch
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold">Admissions office</h2>
                  <p className="text-blue-100 mt-3 leading-relaxed">
                    Visit us or contact the office for forms, status checks, and enquiries about
                    enrolling at C.S Elena Guerra.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {protocol?.officeHours && (
                      <li className="flex gap-3 items-center">
                        <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <Clock size={16} className="text-rw-gold-400" />
                        </span>
                        {protocol.officeHours}
                      </li>
                    )}
                    {protocol?.applicationPhone && (
                      <li>
                        <a
                          href={`tel:${protocol.applicationPhone}`}
                          className="flex gap-3 items-center hover:text-rw-gold-400 transition-colors duration-300"
                        >
                          <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Phone size={16} className="text-rw-gold-400" />
                          </span>
                          {protocol.applicationPhone}
                        </a>
                      </li>
                    )}
                    {protocol?.applicationEmail && (
                      <li>
                        <a
                          href={`mailto:${protocol.applicationEmail}`}
                          className="flex gap-3 items-center hover:text-rw-gold-400 transition-colors duration-300"
                        >
                          <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Mail size={16} className="text-rw-gold-400" />
                          </span>
                          {protocol.applicationEmail}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/apply"
                    className="inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-white text-rw-navy rounded-xl font-bold hover:bg-rw-blue-50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Apply online <ArrowRight size={16} />
                  </Link>
                  {protocol?.applicationEmail && (
                    <a
                      href={`mailto:${protocol.applicationEmail}?subject=Admission%20Enquiry`}
                      className="inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/25 rounded-xl font-semibold hover:bg-white/15 transition-all duration-300"
                    >
                      Email admissions
                    </a>
                  )}
                  <Button to="/contact" variant="outline" className="!border-white/50 !text-white hover:!bg-white/10">
                    General contact
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2} className="mt-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center shrink-0">
                  <ClipboardList size={22} />
                </span>
                <div>
                  <h3 className="font-bold text-rw-navy text-lg">Application checklist</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Complete all {steps?.length || 6} steps and gather every document before
                    submitting your package.
                  </p>
                </div>
              </div>
              <Link
                to="/apply"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-red-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-red-700 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start application <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}

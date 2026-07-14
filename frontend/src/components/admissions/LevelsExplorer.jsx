import { BookOpen, FlaskConical, GraduationCap, Library } from 'lucide-react';
import { Reveal, RevealGroup } from '../ui/Reveal';

const LEVEL_META = {
  'Primary (P1–P6)': {
    icon: BookOpen,
    grades: 'P1 – P6',
    focus: 'Foundation literacy, numeracy, and character building',
    accent: 'from-rw-blue-600 to-rw-blue-800',
  },
  'Ordinary Level (S1–S3)': {
    icon: GraduationCap,
    grades: 'S1 – S3',
    focus: 'National curriculum, competency-based learning, REB preparation',
    accent: 'from-brand-red-600 to-brand-red-700',
  },
  'Advanced Level (S4–S6)': {
    icon: FlaskConical,
    grades: 'S4 – S6',
    focus: 'Science, arts & language combinations, university readiness',
    accent: 'from-rw-blue-700 to-rw-navy',
  },
};

export default function LevelsExplorer({ fees = [] }) {
  if (!fees.length) return null;

  return (
    <section id="levels" className="scroll-mt-32">
      <Reveal>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-10 rounded-full bg-brand-red-600" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-red-600">Study pathways</p>
            <h2 className="text-2xl md:text-3xl font-bold text-rw-navy">Explore study levels</h2>
          </div>
        </div>
        <p className="text-slate-600 mb-10 max-w-2xl">
          Choose the level that matches your child&apos;s age and academic background. Each pathway has
          specific requirements and registration fees.
        </p>
      </Reveal>

      <RevealGroup className="grid md:grid-cols-3 gap-6">
        {fees.map((fee) => {
          const meta = LEVEL_META[fee.level] || {
            icon: Library,
            grades: fee.level,
            focus: fee.description,
            accent: 'from-rw-blue-600 to-rw-navy',
          };
          const Icon = meta.icon;
          return (
            <article
              key={fee.id}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-hover flex flex-col h-full"
            >
              <div className={`h-2 bg-gradient-to-r ${meta.accent}`} />
              <div className="p-6 flex flex-col flex-1">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.accent} text-white flex items-center justify-center mb-4 shadow-md transition-transform duration-500 group-hover:scale-105`}
                >
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="font-bold text-rw-navy text-lg group-hover:text-rw-blue-600 transition-colors">
                  {fee.level}
                </h3>
                <p className="text-rw-blue-600 font-semibold text-sm mt-1">{meta.grades}</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed flex-1">{meta.focus}</p>
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Registration fee
                  </span>
                  <span className="font-bold text-rw-green-700 text-lg">{fee.amount}</span>
                </div>
              </div>
            </article>
          );
        })}
      </RevealGroup>
    </section>
  );
}

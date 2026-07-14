const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'levels', label: 'Levels' },
  { id: 'process', label: 'Process' },
  { id: 'requirements', label: 'Documents' },
  { id: 'fees', label: 'Fees' },
  { id: 'faq', label: 'FAQ' },
  { id: 'explore', label: 'Explore' },
  { id: 'contact', label: 'Contact' },
];

export default function SectionNav({ activeSection }) {
  return (
    <nav className="sticky top-[72px] z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto nav-scroll py-3 -mx-4 px-4 md:mx-0 md:px-0">
          {SECTIONS.map((section) => {
            const active = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  active
                    ? 'bg-rw-navy text-white shadow-md shadow-rw-navy/20'
                    : 'text-slate-600 hover:bg-rw-blue-50 hover:text-rw-navy'
                }`}
              >
                {section.label}
              </a>
            );
          })}
          <a
            href="/apply"
            className="shrink-0 ml-1 px-4 py-2 rounded-full text-sm font-semibold bg-brand-red-600 text-white shadow-md shadow-brand-red-600/25 hover:bg-brand-red-700 transition-all duration-300"
          >
            Apply Online
          </a>
        </div>
      </div>
    </nav>
  );
}

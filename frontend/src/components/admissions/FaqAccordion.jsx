import { useState } from 'react';
import { Reveal, RevealGroup } from '../ui/Reveal';

export default function FaqAccordion({ faqs = [] }) {
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);

  if (!faqs.length) return null;

  return (
    <Reveal as="section" id="faq" className="scroll-mt-24">
      <h2 className="section-title section-title-animate mb-3">Frequently Asked Questions</h2>
      <p className="text-slate-600 mb-8 max-w-2xl">
        Quick answers to common questions about applying to C.S Elena Guerra.
      </p>
      <RevealGroup className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-rw-blue-50/50 transition-colors duration-300"
              >
                <span className="font-semibold text-rw-navy pr-4">{faq.question}</span>
                <span
                  className={`shrink-0 w-8 h-8 rounded-full bg-rw-blue-100 text-rw-blue-700 flex items-center justify-center font-bold transition-transform duration-300 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="accordion-panel px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </RevealGroup>
    </Reveal>
  );
}

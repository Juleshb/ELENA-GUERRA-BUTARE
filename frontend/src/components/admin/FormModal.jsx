import { X } from 'lucide-react';

export default function FormModal({
  title,
  open,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Save',
  wide = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        } max-h-[92dvh] sm:max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-rw-navy text-white shrink-0">
          <h2 className="font-semibold text-sm sm:text-base truncate">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white shrink-0"
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">{children}</div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 safe-pb">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-rw-navy text-white rounded-xl hover:bg-rw-blue-800 text-sm font-medium transition"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30 focus:border-rw-blue-400';

export const checkboxClass =
  'w-4 h-4 rounded border-slate-300 text-rw-navy focus:ring-rw-blue-500';

export function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" className={checkboxClass} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

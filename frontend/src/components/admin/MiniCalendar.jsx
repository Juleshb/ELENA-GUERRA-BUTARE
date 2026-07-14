import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthGrid, isSameDay, toDateKey } from '../../utils/calendar';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function MiniCalendar({ viewDate, onViewDateChange, selectedDate, onSelectDate, markedDates = [] }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getMonthGrid(year, month);
  const today = new Date();
  const marked = new Set(markedDates.map((d) => toDateKey(d)));

  const prev = () => onViewDateChange(new Date(year, month - 1, 1));
  const next = () => onViewDateChange(new Date(year, month + 1, 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prev} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-rw-navy">
          {viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" onClick={next} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-slate-400 mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ date, inMonth }) => {
          const key = toDateKey(date);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const hasEvent = marked.has(key);

          return (
            <button
              key={key + inMonth}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={`aspect-square rounded-lg text-xs font-medium transition relative ${
                !inMonth
                  ? 'text-slate-300'
                  : isSelected
                    ? 'bg-rw-navy text-white'
                    : isToday
                      ? 'bg-brand-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {date.getDate()}
              {hasEvent && inMonth && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

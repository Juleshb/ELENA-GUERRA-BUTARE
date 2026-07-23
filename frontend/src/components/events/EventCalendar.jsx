import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import {
  formatMonthYear,
  getMonthGrid,
  groupEventsByDay,
  isSameDay,
  toDateKey,
} from '../../utils/calendar';
import {
  groupSpecialDaysByDay,
  getSpecialDaysOnDate,
  primarySpecialDayType,
  SPECIAL_DAY_STYLES,
} from '../../data/specialDays';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EventCalendar({
  events = [],
  viewDate,
  onViewDateChange,
  selectedDate,
  onSelectDate,
  onEventClick,
  admin = false,
  showSpecialDays = true,
  className = '',
}) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getMonthGrid(year, month);
  const byDay = groupEventsByDay(events);
  const specialByDay = showSpecialDays ? groupSpecialDaysByDay(year) : {};
  const today = new Date();

  const prevMonth = () => onViewDateChange(new Date(year, month - 1, 1));
  const nextMonth = () => onViewDateChange(new Date(year, month + 1, 1));
  const goToday = () => {
    const now = new Date();
    onViewDateChange(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate?.(now);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-rw-blue-50/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-bold text-rw-navy min-w-[10rem] text-center text-lg">
            {formatMonthYear(viewDate)}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="px-4 py-2 text-sm font-semibold text-white bg-rw-blue-600 hover:bg-rw-blue-700 rounded-xl transition shadow-sm"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-rw-navy text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 sm:py-2.5 text-center">
            <span className="sm:hidden">{d.slice(0, 1)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map(({ date, inMonth }) => {
          const key = toDateKey(date);
          const dayEvents = byDay[key] || [];
          const daySpecial = specialByDay[key] || [];
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const specialType = primarySpecialDayType(daySpecial);
          const specialStyle = specialType ? SPECIAL_DAY_STYLES[specialType] : null;

          const visibleSpecial = daySpecial.slice(0, specialType === 'public-holiday' ? 2 : 1);
          const maxEvents = daySpecial.length > 0 ? 2 : 3;
          const visibleEvents = dayEvents.slice(0, maxEvents);
          const more =
            dayEvents.length - visibleEvents.length + Math.max(0, daySpecial.length - visibleSpecial.length);

          return (
            <button
              key={key + inMonth}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={`min-h-[72px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-1.5 md:p-2 border-b border-r border-slate-100 text-left transition flex flex-col ${
                inMonth ? 'hover:bg-rw-blue-50/40' : 'text-slate-400'
              } ${
                inMonth && specialStyle
                  ? specialStyle.cell
                  : inMonth
                    ? 'bg-white'
                    : 'bg-slate-50/60'
              } ${isSelected ? 'ring-2 ring-inset ring-rw-blue-500 !bg-rw-blue-50 shadow-inner' : ''}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday
                      ? 'bg-brand-red-600 text-white'
                      : inMonth
                        ? 'text-rw-navy'
                        : 'text-slate-400'
                  }`}
                >
                  {date.getDate()}
                </span>
                {daySpecial.some((s) => s.type === 'public-holiday') && inMonth && (
                  <Flag size={12} className="text-green-700 shrink-0" aria-hidden />
                )}
              </div>
              <div className="space-y-0.5 flex-1 overflow-hidden w-full">
                {visibleSpecial.map((sp) => (
                  <span
                    key={sp.id}
                    className={`block w-full truncate text-[9px] md:text-[10px] px-1 py-0.5 rounded font-semibold leading-tight ${SPECIAL_DAY_STYLES[sp.type].chip}`}
                    title={sp.title}
                  >
                    {sp.title}
                  </span>
                ))}
                {visibleEvents.map((event) => (
                  <span
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={`block w-full truncate text-[10px] md:text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer ${
                      admin && !event.published
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rw-blue-100 text-rw-blue-800 hover:bg-rw-blue-200'
                    }`}
                    title={event.title}
                  >
                    {event.title}
                  </span>
                ))}
                {more > 0 && (
                  <span className="text-[10px] text-slate-500 font-medium px-1">+{more} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        {showSpecialDays && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
              Rwanda public holiday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-100 border border-sky-300" />
              Rwanda commemorative
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-100 border border-violet-300" />
              International day
            </span>
          </>
        )}
        {admin && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rw-blue-100 border border-rw-blue-200" />
              School event (published)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
              Draft
            </span>
          </>
        )}
        {!admin && showSpecialDays && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rw-blue-100 border border-rw-blue-200" />
            School event
          </span>
        )}
      </div>
    </div>
  );
}

/** Side panel list of special days for a selected date */
export function SpecialDaysList({ date, className = '' }) {
  const days = getSpecialDaysOnDate(date);
  if (!days.length) return null;

  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-2 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        <Flag size={12} className="text-green-600" />
        Rwanda & international calendar
      </p>
      {days.map((sp) => (
        <div
          key={sp.id}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${SPECIAL_DAY_STYLES[sp.type].chip}`}
        >
          <span className="text-[10px] uppercase font-bold opacity-70 block mb-0.5">
            {SPECIAL_DAY_STYLES[sp.type].label}
          </span>
          {sp.title}
        </div>
      ))}
    </div>
  );
}

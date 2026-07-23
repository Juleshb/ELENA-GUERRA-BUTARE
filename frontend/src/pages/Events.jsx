import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  List,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Flag,
  CalendarDays,
} from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import EventCalendar, { SpecialDaysList } from '../components/events/EventCalendar';
import { EmptyState } from '../components/ui/Card';
import Seo from '../components/Seo';
import { eventOccursOnDay } from '../utils/calendar';
import {
  formatEventDateRange,
  formatEventTime,
  getUpcomingEvents,
  groupEventsByMonth,
  isMultiDayEvent,
  ordinalDay,
} from '../lib/events';

const VIEWS = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'list', label: 'List', icon: List },
];

function DateBadge({ date, size = 'md' }) {
  const d = new Date(date);
  const sizes = {
    sm: { box: 'w-14 h-14', day: 'text-xl', month: 'text-[9px]' },
    md: { box: 'w-16 h-16', day: 'text-2xl', month: 'text-[10px]' },
    lg: { box: 'w-20 h-20', day: 'text-3xl', month: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`${s.box} rounded-2xl bg-gradient-to-br from-rw-blue-600 to-rw-blue-800 text-white flex flex-col items-center justify-center shadow-lg shrink-0`}
    >
      <span className={`${s.day} font-bold leading-none`}>{d.getDate()}</span>
      <span className={`${s.month} uppercase font-bold tracking-wider mt-0.5 opacity-90`}>
        {d.toLocaleString('en', { month: 'short' })}
      </span>
    </div>
  );
}

function FeaturedEvent({ event, onSelect }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rw-navy via-rw-blue-800 to-rw-blue-900 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
        <DateBadge date={event.startDate} size="lg" />
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rw-gold-400 mb-2">
            <Sparkles size={14} />
            Next up
          </span>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">{event.title}</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-blue-100">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-rw-gold-400" />
              {formatEventDateRange(event)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-rw-gold-400" />
              {formatEventTime(event.startDate, event.endDate)}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-red-400" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-4 text-blue-100/90 leading-relaxed line-clamp-2 max-w-2xl">
              {event.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSelect(event)}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red-600 hover:bg-brand-red-700 rounded-xl text-sm font-semibold transition self-start md:self-center"
        >
          View on calendar
          <ChevronRight size={16} />
        </button>
      </div>
      {isMultiDayEvent(event) && (
        <div className="relative px-6 md:px-8 pb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
            Multi-day event · ends {ordinalDay(event.endDate)}{' '}
            {new Date(event.endDate).toLocaleString('en', { month: 'short' })}
          </span>
        </div>
      )}
    </article>
  );
}

function UpcomingStrip({ events, selectedId, onSelect }) {
  if (events.length <= 1) return null;

  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <div className="flex gap-3 min-w-min">
        {events.slice(0, 8).map((event) => {
          const start = new Date(event.startDate);
          const active = selectedId === event.id;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left min-w-[200px] ${
                active
                  ? 'bg-rw-blue-600 border-rw-blue-600 text-white shadow-md'
                  : 'bg-white border-slate-200 hover:border-rw-blue-300 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-center shrink-0 ${
                  active ? 'bg-white/20 text-white' : 'bg-rw-blue-50 text-rw-blue-700'
                }`}
              >
                <span className="text-sm font-bold leading-none">{start.getDate()}</span>
                <span className="text-[8px] uppercase font-bold">
                  {start.toLocaleString('en', { month: 'short' })}
                </span>
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-rw-navy'}`}>
                  {event.title}
                </p>
                <p className={`text-xs truncate mt-0.5 ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                  {formatEventTime(event.startDate, event.endDate)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventDetailCard({ event }) {
  if (!event) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-rw-blue-600 to-rw-blue-800 px-5 py-4 text-white">
        <div className="flex items-center gap-4">
          <DateBadge date={event.startDate} size="sm" />
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-snug">{event.title}</h2>
            {isMultiDayEvent(event) && (
              <p className="text-blue-100 text-xs mt-1 font-medium">Multi-day event</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center shrink-0">
              <Calendar size={16} />
            </div>
            <div>
              <p className="font-semibold text-rw-navy">Date</p>
              <p className="text-slate-600 mt-0.5">{formatEventDateRange(event)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="font-semibold text-rw-navy">Time</p>
              <p className="text-slate-600 mt-0.5">
                {formatEventTime(event.startDate, event.endDate)}
              </p>
            </div>
          </div>
          {event.location && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-brand-red-50 text-brand-red-600 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="font-semibold text-rw-navy">Location</p>
                <p className="text-slate-600 mt-0.5">{event.location}</p>
              </div>
            </div>
          )}
        </div>
        {event.description && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-semibold text-rw-navy mb-2">About this event</p>
            <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarEventItem({ event, selected, onClick }) {
  const start = new Date(event.startDate);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
        selected
          ? 'bg-rw-blue-600 text-white shadow-md'
          : 'bg-slate-50 hover:bg-rw-blue-50 border border-transparent hover:border-rw-blue-100'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${
          selected ? 'bg-white/20' : 'bg-white text-rw-blue-700 shadow-sm'
        }`}
      >
        <span className="text-sm font-bold leading-none">{start.getDate()}</span>
        <span className="text-[8px] uppercase font-bold opacity-80">
          {start.toLocaleString('en', { month: 'short' })}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold truncate ${selected ? 'text-white' : 'text-rw-navy'}`}>
          {event.title}
        </p>
        <p className={`text-xs truncate mt-0.5 ${selected ? 'text-blue-100' : 'text-slate-500'}`}>
          {formatEventTime(event.startDate, event.endDate)}
          {event.location ? ` · ${event.location}` : ''}
        </p>
      </div>
    </button>
  );
}

function ListView({ events }) {
  const groups = groupEventsByMonth(events);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-rw-navy">{group.label}</h2>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {group.events.length} event{group.events.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-4">
            {group.events.map((event) => (
              <article
                key={event.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 card-hover flex flex-col sm:flex-row gap-5 md:gap-6"
              >
                <DateBadge date={event.startDate} size="md" />
                <div className="flex-1 min-w-0 sm:border-l sm:border-slate-100 sm:pl-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-rw-navy group-hover:text-rw-blue-600 transition">
                      {event.title}
                    </h3>
                    {isMultiDayEvent(event) && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-rw-blue-50 text-rw-blue-700">
                        Multi-day
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} className="text-rw-blue-500" />
                      {formatEventDateRange(event)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-rw-blue-500" />
                      {formatEventTime(event.startDate, event.endDate)}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-brand-red-600 font-medium text-sm mt-2 flex items-center gap-1.5">
                      <MapPin size={14} className="shrink-0" />
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-slate-600 mt-4 leading-relaxed text-sm line-clamp-3">
                      {event.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar');
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    api
      .get('/events')
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = useMemo(() => getUpcomingEvents(events), [events]);
  const nextEvent = upcoming[0];

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((e) => eventOccursOnDay(e, selectedDate))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [events, selectedDate]
  );

  const displayEvent = selectedEvent || selectedDayEvents[0];

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startDate));
    setViewDate(new Date(event.startDate.getFullYear(), event.startDate.getMonth(), 1));
    setView('calendar');
  };

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [events]);

  return (
    <>
      <Seo
        title="School Calendar & Events"
        description="Upcoming school events, open days, and key dates at C.S Elena Guerra Butare, alongside Rwanda public holidays."
        path="/events"
      />
      <PageHeader
        title="School Calendar & Events"
        subtitle="Upcoming activities, open days, and key dates alongside Rwanda public holidays"
        breadcrumbs={[{ label: 'Events' }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState message="No upcoming events scheduled. Check back soon for school activities." />
        ) : (
          <>
            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
                <CalendarDays size={16} className="text-rw-blue-600" />
                <span>
                  <strong className="text-rw-navy">{upcoming.length}</strong> upcoming
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
                <Calendar size={16} className="text-brand-red-600" />
                <span>
                  <strong className="text-rw-navy">{thisMonthCount}</strong> this month
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
                <Flag size={16} className="text-green-600" />
                <span className="text-slate-500">Holidays marked on calendar</span>
              </div>
            </div>

            {/* Featured next event */}
            {nextEvent && <FeaturedEvent event={nextEvent} onSelect={selectEvent} />}

            {/* Upcoming strip */}
            <UpcomingStrip
              events={upcoming}
              selectedId={displayEvent?.id}
              onSelect={selectEvent}
            />

            {/* View toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-rw-navy">Browse events</h2>
              <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm self-start">
                {VIEWS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      view === id
                        ? 'bg-rw-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'calendar' ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EventCalendar
                    events={events}
                    viewDate={viewDate}
                    onViewDateChange={setViewDate}
                    selectedDate={selectedDate}
                    onSelectDate={(d) => {
                      setSelectedDate(d);
                      setSelectedEvent(null);
                    }}
                    onEventClick={selectEvent}
                  />
                </div>

                <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-rw-blue-50/30 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-rw-blue-600 mb-1">
                      Selected day
                    </p>
                    <p className="text-2xl font-bold text-rw-navy">
                      {selectedDate.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedDayEvents.length} school event
                      {selectedDayEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <SpecialDaysList date={selectedDate} />

                  {selectedDayEvents.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                        Events on this day
                      </p>
                      {selectedDayEvents.map((event) => (
                        <SidebarEventItem
                          key={event.id}
                          event={event}
                          selected={displayEvent?.id === event.id}
                          onClick={() => setSelectedEvent(event)}
                        />
                      ))}
                    </div>
                  )}

                  <EventDetailCard event={displayEvent} />

                  {!displayEvent && selectedDayEvents.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                      <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        No school events on this day. Select another date or browse upcoming
                        events above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ListView events={events} />
            )}
          </>
        )}
      </div>
    </>
  );
}

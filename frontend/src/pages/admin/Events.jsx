import { useState } from 'react';
import {
  Calendar,
  List,
  Plus,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  EyeOff,
} from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import FormModal, { Field, inputClass, CheckboxField } from '../../components/admin/FormModal';
import EventCalendar, { SpecialDaysList } from '../../components/events/EventCalendar';
import { AdminButton, AdminCard, AdminEmpty, AdminToggleGroup, AdminToolbar } from '../../components/admin/AdminUI';
import {
  defaultStartForDay,
  eventOccursOnDay,
  toDatetimeLocalValue,
} from '../../utils/calendar';
import { getSpecialDaysOnDate } from '../../data/specialDays';

const empty = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  published: true,
};

export default function AdminEvents() {
  const { items, loading, create, update, remove } = useCrud('/events');
  const [view, setView] = useState('calendar');
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const selectedEvents = items
    .filter((e) => eventOccursOnDay(e, selectedDate))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const upcomingCount = items.filter((e) => new Date(e.startDate) >= new Date()).length;

  const openCreate = (day = selectedDate) => {
    setForm({ ...empty, startDate: defaultStartForDay(day) });
    setEditingId(null);
    setModal(true);
  };

  const openEdit = (row) => {
    setForm({
      ...row,
      startDate: toDatetimeLocalValue(row.startDate),
      endDate: row.endDate ? toDatetimeLocalValue(row.endDate) : '',
    });
    setEditingId(row.id);
    setModal(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    };
    if (editingId) await update(editingId, data);
    else await create(data);
    setModal(false);
  };

  const handleDelete = async (id) => {
    await remove(id);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-64" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminToolbar stats={`${items.length} events · ${upcomingCount} upcoming`}>
        <AdminToggleGroup
          options={[
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'list', label: 'List', icon: List },
          ]}
          value={view}
          onChange={setView}
        />
        <AdminButton variant="accent" icon={Plus} onClick={() => openCreate()}>
          New event
        </AdminButton>
      </AdminToolbar>

      {view === 'calendar' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EventCalendar
              events={items}
              viewDate={viewDate}
              onViewDateChange={setViewDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEventClick={openEdit}
              admin
            />
          </div>

          {/* Selected day panel */}
          <AdminCard noPadding className="flex flex-col min-h-[320px] !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Selected day
              </p>
              <p className="font-bold text-rw-navy mt-0.5">
                {selectedDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <SpecialDaysList date={selectedDate} />
              {selectedEvents.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pt-1">
                  School events
                </p>
              )}
              {selectedEvents.length === 0 && !getSpecialDaysOnDate(selectedDate).length ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  No events on this day.
                </p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No school events on this day.</p>
              ) : (
                selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-rw-blue-200 hover:bg-rw-blue-50/30 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-rw-navy truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {new Date(event.startDate).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {event.endDate &&
                            ` – ${new Date(event.endDate).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`}
                        </p>
                        {event.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} />
                            {event.location}
                          </p>
                        )}
                        {!event.published && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5">
                            <EyeOff size={10} />
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className="p-1.5 rounded-md text-rw-blue-600 hover:bg-rw-blue-100"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-100">
              <AdminButton
                variant="secondary"
                icon={Plus}
                onClick={() => openCreate(selectedDate)}
                className="w-full justify-center"
              >
                Add event on this day
              </AdminButton>
            </div>
          </AdminCard>
        </div>
      ) : (
        <AdminCard noPadding className="divide-y divide-slate-100 !p-0 overflow-hidden">
          {[...items]
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50 transition"
              >
                <div className="shrink-0 w-14 h-14 rounded-xl bg-rw-navy text-white flex flex-col items-center justify-center">
                  <span className="text-lg font-bold leading-none">
                    {new Date(event.startDate).getDate()}
                  </span>
                  <span className="text-[9px] uppercase font-semibold">
                    {new Date(event.startDate).toLocaleString('en', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-rw-navy">{event.title}</p>
                    {!event.published && (
                      <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date(event.startDate).toLocaleString('en-GB')}
                    {event.location && ` · ${event.location}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <AdminButton variant="ghost" onClick={() => openEdit(event)} className="!px-3 !py-1.5">
                    Edit
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => handleDelete(event.id)} className="!px-3 !py-1.5">
                    Delete
                  </AdminButton>
                </div>
              </div>
            ))}
          {items.length === 0 && <AdminEmpty message="No events yet." />}
        </AdminCard>
      )}

      <FormModal
        title={editingId ? 'Edit Event' : 'New Event'}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSave}
      >
        <Field label="Title">
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={form.location || ''}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </Field>
        <Field label="Start Date & Time">
          <input
            type="datetime-local"
            className={inputClass}
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </Field>
        <Field label="End Date & Time (optional)">
          <input
            type="datetime-local"
            className={inputClass}
            value={form.endDate || ''}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <CheckboxField
          label="Published on public website"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
      </FormModal>
    </div>
  );
}

export function isSameDay(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function toDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7; // Monday = 0
  const days = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, inMonth: false });
  }

  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }

  while (days.length % 7 !== 0) {
    const next = days.length - startPad - last.getDate() + 1;
    days.push({
      date: new Date(year, month + 1, next),
      inMonth: false,
    });
  }

  return days;
}

export function eventOccursOnDay(event, day) {
  const start = startOfDay(event.startDate);
  const end = event.endDate ? startOfDay(event.endDate) : start;
  const current = startOfDay(day);
  return current >= start && current <= end;
}

export function groupEventsByDay(events) {
  const map = {};
  for (const event of events) {
    const start = startOfDay(event.startDate);
    const end = event.endDate ? startOfDay(event.endDate) : start;
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toDateKey(cursor);
      if (!map[key]) map[key] = [];
      map[key].push(event);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return map;
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function defaultStartForDay(day) {
  const d = new Date(day);
  d.setHours(9, 0, 0, 0);
  return toDatetimeLocalValue(d);
}

export function ordinalDay(date) {
  const d = new Date(date).getDate();
  if (d > 3 && d < 21) return `${d}th`;
  switch (d % 10) {
    case 1:
      return `${d}st`;
    case 2:
      return `${d}nd`;
    case 3:
      return `${d}rd`;
    default:
      return `${d}th`;
  }
}

export function formatEventTime(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const startStr = new Date(start).toLocaleTimeString('en-GB', opts).toUpperCase();
  if (!end) return startStr;
  const endStr = new Date(end).toLocaleTimeString('en-GB', opts).toUpperCase();
  return `${startStr} – ${endStr}`;
}

export function isMultiDayEvent(event) {
  if (!event?.endDate) return false;
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return (
    end.getDate() !== start.getDate() ||
    end.getMonth() !== start.getMonth() ||
    end.getFullYear() !== start.getFullYear()
  );
}

export function formatEventDateRange(event) {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  if (!end || !isMultiDayEvent(event)) {
    return start.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear();

  const startPart = start.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const endPart = end.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
    year: sameYear ? undefined : 'numeric',
  });

  return `${startPart} – ${endPart}`;
}

export function getUpcomingEvents(events, from = new Date()) {
  const now = new Date(from);
  now.setHours(0, 0, 0, 0);
  return [...events]
    .filter((e) => {
      const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
      end.setHours(23, 59, 59, 999);
      return end >= now;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

export function groupEventsByMonth(events) {
  const groups = {};
  for (const event of events) {
    const d = new Date(event.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { key, label, events: [] };
    groups[key].events.push(event);
  }
  return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
}

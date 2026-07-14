import { toDateKey } from '../utils/calendar';

/** @typedef {{ id: string; title: string; type: 'public-holiday' | 'international' | 'rwanda'; date: string }} SpecialDay */

const FIXED_PUBLIC_HOLIDAYS = [
  { month: 1, day: 1, title: "New Year's Day" },
  { month: 2, day: 1, title: 'National Heroes Day' },
  { month: 4, day: 7, title: 'Genocide against the Tutsi Memorial Day' },
  { month: 5, day: 1, title: 'Labour Day' },
  { month: 7, day: 1, title: 'Independence Day' },
  { month: 7, day: 4, title: 'Liberation Day' },
  { month: 8, day: 15, title: 'Assumption of Mary' },
  { month: 12, day: 25, title: 'Christmas Day' },
  { month: 12, day: 26, title: 'Boxing Day' },
];

const RWANDA_COMMEMORATIVE = [
  { month: 5, day: 28, title: 'Democracy & National Unity Day' },
  { month: 12, day: 31, title: 'New Year\'s Eve' },
];

const INTERNATIONAL_DAYS = [
  { month: 1, day: 24, title: 'International Day of Education' },
  { month: 2, day: 11, title: 'Women & Girls in Science Day' },
  { month: 2, day: 21, title: 'International Mother Language Day' },
  { month: 3, day: 8, title: "International Women's Day" },
  { month: 3, day: 21, title: 'International Day for the Elimination of Racial Discrimination' },
  { month: 4, day: 7, title: 'World Health Day' },
  { month: 4, day: 22, title: 'Earth Day' },
  { month: 4, day: 23, title: 'World Book & Copyright Day' },
  { month: 5, day: 15, title: 'International Day of Families' },
  { month: 5, day: 25, title: 'Africa Day' },
  { month: 6, day: 1, title: 'Global Day of Parents' },
  { month: 6, day: 5, title: 'World Environment Day' },
  { month: 6, day: 16, title: 'Day of the African Child' },
  { month: 6, day: 26, title: 'International Day against Drug Abuse' },
  { month: 9, day: 8, title: 'International Literacy Day' },
  { month: 9, day: 21, title: 'International Day of Peace' },
  { month: 10, day: 1, title: 'International Day of Older Persons' },
  { month: 10, day: 5, title: 'World Teachers\' Day' },
  { month: 10, day: 10, title: 'World Mental Health Day' },
  { month: 10, day: 11, title: 'International Day of the Girl Child' },
  { month: 11, day: 14, title: 'World Diabetes Day' },
  { month: 11, day: 20, title: 'World Children\'s Day' },
  { month: 11, day: 25, title: 'Elimination of Violence against Women Day' },
  { month: 12, day: 1, title: 'World AIDS Day' },
  { month: 12, day: 3, title: 'International Day of Persons with Disabilities' },
  { month: 12, day: 10, title: 'Human Rights Day' },
];

/** Western Easter Sunday (used for Rwanda public holidays). */
export function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** First Friday of August — Umuganura (Rwanda harvest celebration). */
export function getUmuganuraDate(year) {
  const d = new Date(year, 7, 1);
  while (d.getDay() !== 5) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function makeDay(year, month, day, title, type) {
  const date = new Date(year, month - 1, day);
  return {
    id: `${type}-${toDateKey(date)}-${title.slice(0, 12).replace(/\s/g, '')}`,
    title,
    type,
    date: toDateKey(date),
  };
}

function movableHolidays(year) {
  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  const umuganura = getUmuganuraDate(year);

  return [
    { date: goodFriday, title: 'Good Friday' },
    { date: easterMonday, title: 'Easter Monday' },
    { date: umuganura, title: 'Umuganura Day' },
  ].map(({ date, title }) => ({
    id: `public-${toDateKey(date)}-${title.replace(/\s/g, '')}`,
    title,
    type: 'public-holiday',
    date: toDateKey(date),
  }));
}

/** All special days for a calendar year. */
export function getSpecialDaysForYear(year) {
  const days = [];

  for (const h of FIXED_PUBLIC_HOLIDAYS) {
    days.push(makeDay(year, h.month, h.day, h.title, 'public-holiday'));
  }
  days.push(...movableHolidays(year));

  for (const h of RWANDA_COMMEMORATIVE) {
    days.push(makeDay(year, h.month, h.day, h.title, 'rwanda'));
  }

  for (const h of INTERNATIONAL_DAYS) {
    days.push(makeDay(year, h.month, h.day, h.title, 'international'));
  }

  return days.sort((a, b) => a.date.localeCompare(b.date));
}

/** Map of date key → special days (may be multiple on same date, e.g. Apr 7). */
export function groupSpecialDaysByDay(year) {
  const map = {};
  for (const day of getSpecialDaysForYear(year)) {
    if (!map[day.date]) map[day.date] = [];
    map[day.date].push(day);
  }
  return map;
}

export function getSpecialDaysOnDate(date) {
  const year = new Date(date).getFullYear();
  const key = toDateKey(date);
  return groupSpecialDaysByDay(year)[key] || [];
}

export const SPECIAL_DAY_STYLES = {
  'public-holiday': {
    cell: 'bg-green-50/80',
    chip: 'bg-green-100 text-green-900 border border-green-200',
    label: 'Rwanda public holiday',
    dot: 'bg-green-600',
  },
  international: {
    cell: 'bg-violet-50/50',
    chip: 'bg-violet-100 text-violet-900 border border-violet-200',
    label: 'International day',
    dot: 'bg-violet-600',
  },
  rwanda: {
    cell: 'bg-sky-50/50',
    chip: 'bg-sky-100 text-sky-900 border border-sky-200',
    label: 'Rwanda commemorative day',
    dot: 'bg-sky-600',
  },
};

export function primarySpecialDayType(days) {
  if (!days?.length) return null;
  if (days.some((d) => d.type === 'public-holiday')) return 'public-holiday';
  if (days.some((d) => d.type === 'rwanda')) return 'rwanda';
  return 'international';
}

const pad = (value: number) => String(value).padStart(2, '0');

export interface WeekRange {
  index: number;
  startKey: string;
  endKey: string;
}

/** Fecha local en formato YYYY-MM-DD */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function currentMonthKey(): string {
  return todayKey().slice(0, 7);
}

export function dayKey(monthKey: string, day: number): string {
  return `${monthKey}-${pad(day)}`;
}

function monthParts(monthKey: string): [number, number] {
  const [year, month] = monthKey.split('-').map(Number);
  return [year, month];
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthParts(monthKey);
  return new Date(year, month, 0).getDate();
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthParts(monthKey);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthParts(monthKey);
  const label = new Intl.DateTimeFormat('es-UY', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('es-UY', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(year, month - 1, day),
  );
}

/** Semanas de lunes a domingo, recortadas al mes */
export function weeksOfMonth(monthKey: string): WeekRange[] {
  const [year, month] = monthParts(monthKey);
  const totalDays = daysInMonth(monthKey);
  const weeks: WeekRange[] = [];
  let start = 1;
  while (start <= totalDays) {
    const weekday = (new Date(year, month - 1, start).getDay() + 6) % 7;
    const end = Math.min(totalDays, start + (6 - weekday));
    weeks.push({ index: weeks.length + 1, startKey: dayKey(monthKey, start), endKey: dayKey(monthKey, end) });
    start = end + 1;
  }
  return weeks;
}

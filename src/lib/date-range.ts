import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

export type PresetRange = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';
export type RangeSelection = PresetRange | 'custom';

export const PRESET_LABELS: Record<PresetRange, string> = {
  today: 'Today',
  thisWeek: 'This week',
  thisMonth: 'This month',
  thisYear: 'This year',
};

export function toDbDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function isDateInRange(dateStr: string, range: DateRange): boolean {
  return (
    dateStr >= toDbDateStr(range.start) && dateStr <= toDbDateStr(range.end)
  );
}

export function getPresetRange(
  preset: PresetRange,
  now: Date = new Date(),
): DateRange {
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'thisWeek':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

export function formatDateRange(range: DateRange): string {
  const start = format(range.start, 'MMM d');
  const end = format(range.end, 'MMM d');
  return start === end ? start : `${start} – ${end}`;
}

export function parseDateInput(value: string, isEnd: boolean): Date {
  const time = isEnd ? 'T23:59:59' : 'T00:00:00';
  return new Date(`${value}${time}`);
}

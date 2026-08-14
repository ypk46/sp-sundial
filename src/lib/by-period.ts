import {
  differenceInCalendarDays,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
} from 'date-fns';
import { db } from '../db/db';
import type { DateRange } from './date-range';
import { isDateInRange } from './date-range';

export type PeriodGranularity = 'day' | 'week' | 'month';

export interface PeriodBucket {
  label: string;
  dateKey: string;
  totalTimeMs: number;
  byProject: {
    projectId: string;
    title: string;
    color: string;
    timeMs: number;
  }[];
}

const NO_PROJECT_COLOR = '#64748b';

export function getGranularity(range: DateRange): PeriodGranularity {
  const days = differenceInCalendarDays(range.end, range.start);
  if (days <= 31) return 'day';
  if (days <= 90) return 'week';
  return 'month';
}

function parseDateStr(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function getBucketKey(dateStr: string, granularity: PeriodGranularity): string {
  const date = parseDateStr(dateStr);
  if (granularity === 'day') return dateStr;
  if (granularity === 'week') {
    return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

function getBucketLabel(
  bucketStart: Date,
  granularity: PeriodGranularity,
): string {
  if (granularity === 'month') return format(bucketStart, 'MMM');
  return format(bucketStart, 'MMM d');
}

function generateAllBuckets(
  range: DateRange,
  granularity: PeriodGranularity,
): Map<string, PeriodBucket> {
  const map = new Map<string, PeriodBucket>();

  if (granularity === 'day') {
    for (const date of eachDayOfInterval({
      start: range.start,
      end: range.end,
    })) {
      const key = format(date, 'yyyy-MM-dd');
      map.set(key, {
        label: getBucketLabel(date, granularity),
        dateKey: key,
        totalTimeMs: 0,
        byProject: [],
      });
    }
  } else if (granularity === 'week') {
    const weekStart = startOfWeek(range.start, { weekStartsOn: 1 });
    const weekEnd = startOfWeek(range.end, { weekStartsOn: 1 });
    for (const date of eachWeekOfInterval(
      { start: weekStart, end: weekEnd },
      { weekStartsOn: 1 },
    )) {
      const key = format(date, 'yyyy-MM-dd');
      map.set(key, {
        label: getBucketLabel(date, granularity),
        dateKey: key,
        totalTimeMs: 0,
        byProject: [],
      });
    }
  } else {
    const monthStart = startOfMonth(range.start);
    const monthEnd = startOfMonth(range.end);
    for (const date of eachMonthOfInterval({
      start: monthStart,
      end: monthEnd,
    })) {
      const key = format(date, 'yyyy-MM-dd');
      map.set(key, {
        label: getBucketLabel(date, granularity),
        dateKey: key,
        totalTimeMs: 0,
        byProject: [],
      });
    }
  }

  return map;
}

export async function aggregateByPeriod(
  range: DateRange,
  selectedProjectIds: Set<string> | null,
  selectedTagIds: Set<string> | null,
): Promise<{ granularity: PeriodGranularity; buckets: PeriodBucket[] }> {
  const tasks = await db.tasks.toArray();
  const projects = await db.projects.toArray();
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const granularity = getGranularity(range);
  const buckets = generateAllBuckets(range, granularity);

  const topLevel = tasks.filter((t) => !t.parentId);

  const byProject = selectedProjectIds
    ? topLevel.filter((t) => t.projectId && selectedProjectIds.has(t.projectId))
    : topLevel;

  const byTag = selectedTagIds
    ? byProject.filter((t) => t.tagIds.some((id) => selectedTagIds.has(id)))
    : byProject;

  for (const task of byTag) {
    for (const [dateStr, timeMs] of Object.entries(task.timeSpentOnDay)) {
      if (timeMs === 0) continue;
      if (!isDateInRange(dateStr, range)) continue;

      const bucketKey = getBucketKey(dateStr, granularity);
      const bucket = buckets.get(bucketKey);
      if (!bucket) continue;

      bucket.totalTimeMs += timeMs;

      const projectId = task.projectId ?? '__no_project__';
      const proj = bucket.byProject.find((p) => p.projectId === projectId);
      if (proj) {
        proj.timeMs += timeMs;
      } else {
        const project = projectMap.get(task.projectId ?? '');
        bucket.byProject.push({
          projectId,
          title: project?.title ?? 'No project',
          color: project?.color ?? NO_PROJECT_COLOR,
          timeMs,
        });
      }
    }
  }

  const sorted = Array.from(buckets.values()).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey),
  );

  return { granularity, buckets: sorted };
}

import { db } from '../db/db';
import type { DateRange } from './date-range';
import { isDateInRange, toDbDateStr } from './date-range';

export interface DashboardMetrics {
  totalTimeMs: number;
  tasksCompleted: number;
  activeDays: number;
  avgDailyMs: number;
}

const EMPTY_METRICS: DashboardMetrics = {
  totalTimeMs: 0,
  tasksCompleted: 0,
  activeDays: 0,
  avgDailyMs: 0,
};

export async function computeMetrics(
  range: DateRange,
  selectedProjectIds: Set<string> | null,
  selectedTagIds: Set<string> | null,
): Promise<DashboardMetrics> {
  const tasks = await db.tasks.toArray();

  const topLevel = tasks.filter((t) => !t.parentId);

  const byProject = selectedProjectIds
    ? topLevel.filter((t) => t.projectId && selectedProjectIds.has(t.projectId))
    : topLevel;

  const byTag = selectedTagIds
    ? byProject.filter((t) => t.tagIds.some((id) => selectedTagIds.has(id)))
    : byProject;

  let totalTimeMs = 0;
  const activeDaySet = new Set<string>();

  for (const task of byTag) {
    for (const [dateStr, timeMs] of Object.entries(task.timeSpentOnDay)) {
      if (timeMs === 0) continue;
      if (!isDateInRange(dateStr, range)) continue;
      totalTimeMs += timeMs;
      activeDaySet.add(dateStr);
    }
  }

  const activeDays = activeDaySet.size;

  const tasksCompleted = byTag.filter(
    (t) =>
      t.isDone &&
      t.doneOn !== null &&
      isDateInRange(toDbDateStr(new Date(t.doneOn)), range),
  ).length;

  const avgDailyMs = activeDays > 0 ? totalTimeMs / activeDays : 0;

  return { totalTimeMs, tasksCompleted, activeDays, avgDailyMs };
}

export { EMPTY_METRICS };

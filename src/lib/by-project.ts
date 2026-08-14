import { db } from '../db/db';
import type { DateRange } from './date-range';
import { isDateInRange } from './date-range';

export interface ProjectAggregation {
  projectId: string;
  title: string;
  color: string;
  totalTimeMs: number;
  percentage: number;
}

const NO_PROJECT_COLOR = '#64748b';
const OTHER_COLOR = '#475569';
const OTHER_THRESHOLD = 2;

export async function aggregateByProject(
  range: DateRange,
  selectedProjectIds: Set<string> | null,
  selectedTagIds: Set<string> | null,
): Promise<ProjectAggregation[]> {
  const tasks = await db.tasks.toArray();
  const projects = await db.projects.toArray();
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const topLevel = tasks.filter((t) => !t.parentId);

  const byProject = selectedProjectIds
    ? topLevel.filter((t) => t.projectId && selectedProjectIds.has(t.projectId))
    : topLevel;

  const byTag = selectedTagIds
    ? byProject.filter((t) => t.tagIds.some((id) => selectedTagIds.has(id)))
    : byProject;

  const timeByProject = new Map<string, number>();

  for (const task of byTag) {
    for (const [dateStr, timeMs] of Object.entries(task.timeSpentOnDay)) {
      if (timeMs === 0) continue;
      if (!isDateInRange(dateStr, range)) continue;
      const key = task.projectId ?? '__no_project__';
      timeByProject.set(key, (timeByProject.get(key) ?? 0) + timeMs);
    }
  }

  const grandTotal = Array.from(timeByProject.values()).reduce(
    (sum, v) => sum + v,
    0,
  );
  if (grandTotal === 0) return [];

  const entries: ProjectAggregation[] = [];
  let otherTimeMs = 0;

  for (const [projectId, totalTimeMs] of timeByProject) {
    const percentage = (totalTimeMs / grandTotal) * 100;

    if (percentage < OTHER_THRESHOLD) {
      otherTimeMs += totalTimeMs;
      continue;
    }

    if (projectId === '__no_project__') {
      entries.push({
        projectId,
        title: 'No project',
        color: NO_PROJECT_COLOR,
        totalTimeMs,
        percentage,
      });
    } else {
      const project = projectMap.get(projectId);
      entries.push({
        projectId,
        title: project?.title ?? 'Unknown',
        color: project?.color ?? NO_PROJECT_COLOR,
        totalTimeMs,
        percentage,
      });
    }
  }

  if (otherTimeMs > 0) {
    entries.push({
      projectId: '__other__',
      title: 'Other',
      color: OTHER_COLOR,
      totalTimeMs: otherTimeMs,
      percentage: (otherTimeMs / grandTotal) * 100,
    });
  }

  return entries.sort((a, b) => b.totalTimeMs - a.totalTimeMs);
}

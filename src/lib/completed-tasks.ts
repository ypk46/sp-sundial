import { db } from '../db/db';
import type { DateRange } from './date-range';
import { isDateInRange, toDbDateStr } from './date-range';

export interface CompletedTaskRow {
  id: string;
  title: string;
  projectTitle: string;
  projectColor: string;
  tagTitles: string[];
  timeSpentMs: number;
  doneOn: number;
}

const NO_PROJECT_COLOR = '#64748b';

export async function getCompletedTasks(
  range: DateRange,
  selectedProjectIds: Set<string> | null,
  selectedTagIds: Set<string> | null,
): Promise<CompletedTaskRow[]> {
  const tasks = await db.tasks.toArray();
  const projects = await db.projects.toArray();
  const tags = await db.tags.toArray();
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  const done = tasks.filter(
    (t) =>
      t.isDone &&
      t.doneOn !== null &&
      isDateInRange(toDbDateStr(new Date(t.doneOn)), range),
  );

  const byProject = selectedProjectIds
    ? done.filter((t) => t.projectId && selectedProjectIds.has(t.projectId))
    : done;

  const byTag = selectedTagIds
    ? byProject.filter((t) => t.tagIds.some((id) => selectedTagIds.has(id)))
    : byProject;

  const rows: CompletedTaskRow[] = byTag.map((task) => {
    const project = task.projectId ? projectMap.get(task.projectId) : undefined;
    const tagTitles = task.tagIds
      .map((id) => tagMap.get(id)?.title)
      .filter((t): t is string => t !== undefined);

    return {
      id: task.id,
      title: task.title,
      projectTitle: project?.title ?? 'No project',
      projectColor: project?.color ?? NO_PROJECT_COLOR,
      tagTitles,
      timeSpentMs: task.timeSpent,
      doneOn: task.doneOn!,
    };
  });

  return rows.sort((a, b) => b.doneOn - a.doneOn);
}

import { invoke } from '@tauri-apps/api/core';
import { db } from '../db/db';
import type { SyncedTask, SyncedProject, SyncedTag } from '../types/sync';
import type { SyncPayload, RawTask, RawProject, RawTag } from '../types/raw';

export class SyncError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'SyncError';
  }
}

export interface SyncOutcome {
  tasksSynced: number;
  projectsSynced: number;
  lastSyncedAt: number;
}

function normalizeTask(t: RawTask): SyncedTask {
  return {
    id: t.id,
    title: t.title,
    projectId: t.projectId,
    tagIds: t.tagIds ?? [],
    parentId: t.parentId ?? null,
    timeSpent: t.timeSpent ?? 0,
    timeSpentOnDay: t.timeSpentOnDay ?? {},
    isDone: t.isDone ?? false,
    doneOn: t.doneOn ?? null,
    created: t.created,
    dueDay: t.dueDay ?? null,
    dueWithTime: t.dueWithTime ?? null,
  };
}

function normalizeProject(p: RawProject): SyncedProject {
  return {
    id: p.id,
    title: p.title,
    color: p.theme?.primary ?? '#6c8ebf',
    isArchived: p.isArchived ?? false,
  };
}

function normalizeTag(t: RawTag): SyncedTag {
  return {
    id: t.id,
    title: t.title,
    color: t.color ?? '#999999',
  };
}

export async function syncFromSuperProductivity(): Promise<SyncOutcome> {
  let payload: SyncPayload;
  try {
    payload = await invoke<SyncPayload>('sync_from_sp');
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'message' in e) {
      const err = e as { code?: string; message?: string };
      throw new SyncError(err.code ?? 'UNKNOWN', err.message ?? 'Sync failed');
    }
    throw new SyncError('UNKNOWN', String(e));
  }

  const tasks = payload.tasks.map(normalizeTask);
  const projects = payload.projects.map(normalizeProject);
  const tags = (payload.tags ?? []).map(normalizeTag);
  const lastSyncedAt = Date.now();

  await db.transaction(
    'rw',
    db.tasks,
    db.projects,
    db.tags,
    db.meta,
    async () => {
      await db.tasks.clear();
      await db.tasks.bulkPut(tasks);
      await db.projects.clear();
      await db.projects.bulkPut(projects);
      await db.tags.clear();
      await db.tags.bulkPut(tags);
      await db.meta.put({
        id: 'singleton',
        lastSyncedAt,
        taskCount: tasks.length,
        projectCount: projects.length,
      });
    },
  );

  return {
    tasksSynced: tasks.length,
    projectsSynced: projects.length,
    lastSyncedAt,
  };
}

export async function clearDb(): Promise<void> {
  await db.transaction(
    'rw',
    db.tasks,
    db.projects,
    db.tags,
    db.meta,
    async () => {
      await db.tasks.clear();
      await db.projects.clear();
      await db.tags.clear();
      await db.meta.clear();
    },
  );
}

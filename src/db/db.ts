import Dexie, { type Table } from 'dexie';
import type {
  SyncedTask,
  SyncedProject,
  SyncedTag,
  SyncMeta,
} from '../types/sync';

export class DashboardDB extends Dexie {
  tasks!: Table<SyncedTask, string>;
  projects!: Table<SyncedProject, string>;
  tags!: Table<SyncedTag, string>;
  meta!: Table<SyncMeta, string>;

  constructor() {
    super('TimeAnalyticsDashboard');
    this.version(1).stores({
      tasks: 'id, projectId, isDone, created',
      projects: 'id, isArchived',
      tags: 'id',
      meta: 'id',
    });
  }
}

export const db = new DashboardDB();

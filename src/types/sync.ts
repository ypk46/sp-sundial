export interface SyncedTask {
  id: string;
  title: string;
  projectId: string | null;
  tagIds: string[];
  parentId: string | null;
  timeSpent: number;
  timeSpentOnDay: Record<string, number>;
  isDone: boolean;
  doneOn: number | null;
  created: number;
  dueDay: string | null;
  dueWithTime: number | null;
}

export interface SyncedProject {
  id: string;
  title: string;
  color: string;
  isArchived: boolean;
}

export interface SyncedTag {
  id: string;
  title: string;
  color: string;
}

export interface SyncMeta {
  id: string;
  lastSyncedAt: number;
  taskCount: number;
  projectCount: number;
}

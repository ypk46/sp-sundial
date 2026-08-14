export interface RawTask {
  id: string;
  title: string;
  projectId: string | null;
  tagIds: string[];
  parentId?: string | null;
  timeSpent: number;
  timeSpentOnDay?: Record<string, number>;
  isDone: boolean;
  doneOn?: number | null;
  created: number;
  dueDay?: string | null;
  dueWithTime?: number | null;
}

export interface RawProject {
  id: string;
  title: string;
  theme?: { primary?: string };
  isArchived?: boolean;
}

export interface RawTag {
  id: string;
  title: string;
  color?: string | null;
}

export interface SyncResult {
  tasks_synced: number;
  projects_synced: number;
  tags_synced: number;
  last_synced_at: number;
}

export interface SyncPayload {
  result: SyncResult;
  tasks: RawTask[];
  projects: RawProject[];
  tags: RawTag[];
}

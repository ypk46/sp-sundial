import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  getCompletedTasks,
  type CompletedTaskRow,
} from '../lib/completed-tasks';
import { formatMs } from '../lib/format';
import type { DateRange } from '../lib/date-range';

interface CompletedTasksTableProps {
  range: DateRange;
  selectedProjectIds: Set<string> | null;
  selectedTagIds: Set<string> | null;
  refreshKey?: number;
}

function TagBadges({ tagTitles }: { tagTitles: string[] }) {
  if (tagTitles.length === 0) {
    return <span className="text-slate-600">—</span>;
  }
  const visible = tagTitles.slice(0, 3);
  const extra = tagTitles.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <span
          key={tag}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400"
        >
          {tag}
        </span>
      ))}
      {extra > 0 && <span className="text-xs text-slate-500">+{extra}</span>}
    </div>
  );
}

export function CompletedTasksTable({
  range,
  selectedProjectIds,
  selectedTagIds,
  refreshKey,
}: CompletedTasksTableProps) {
  const [rows, setRows] = useState<CompletedTaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCompletedTasks(range, selectedProjectIds, selectedTagIds).then(
      (result) => {
        if (!cancelled) {
          setRows(result);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [range, selectedProjectIds, selectedTagIds, refreshKey]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-600">
        No completed tasks in this time range
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-900">
          <tr className="border-b border-slate-800">
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Task
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Project
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Tags
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
              Time spent
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Completed
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-800/50 transition hover:bg-slate-800/30"
            >
              <td className="max-w-xs truncate px-3 py-2 text-sm text-slate-300">
                {row.title}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.projectColor }}
                  />
                  <span className="whitespace-nowrap text-sm text-slate-400">
                    {row.projectTitle}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2">
                <TagBadges tagTitles={row.tagTitles} />
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm text-emerald-400">
                {formatMs(row.timeSpentMs)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-400">
                {format(new Date(row.doneOn), 'dd MMM, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompletedTasksTable;

import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { ContextMenu } from '../components/ContextMenu';
import { TimeFrameFilter } from '../components/TimeFrameFilter';
import { TaxonomyFilter } from '../components/TaxonomyFilter';
import {
  getPresetRange,
  type DateRange,
  type RangeSelection,
} from '../lib/date-range';
import type { FilterState } from '../types/filters';

interface DashboardProps {
  onClear: () => void;
}

export function Dashboard({ onClear }: DashboardProps) {
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    rangeSelection: 'thisWeek',
    dateRange: getPresetRange('thisWeek'),
    selectedProjectIds: null,
    selectedTagIds: null,
  });

  useEffect(() => {
    db.meta.get('singleton').then((meta) => {
      if (meta) setLastSyncedAt(meta.lastSyncedAt);
    });
  }, []);

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString()
    : 'Never synced';

  const handleTimeFrameChange = (
    selection: RangeSelection,
    range: DateRange,
  ) => {
    setFilters((prev) => ({
      ...prev,
      rangeSelection: selection,
      dateRange: range,
    }));
  };

  const handleTaxonomyChange = (
    projectIds: Set<string> | null,
    tagIds: Set<string> | null,
  ) => {
    setFilters((prev) => ({
      ...prev,
      selectedProjectIds: projectIds,
      selectedTagIds: tagIds,
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <TimeFrameFilter
            rangeSelection={filters.rangeSelection}
            dateRange={filters.dateRange}
            onChange={handleTimeFrameChange}
          />
          <TaxonomyFilter
            selectedProjectIds={filters.selectedProjectIds}
            selectedTagIds={filters.selectedTagIds}
            onChange={handleTaxonomyChange}
          />
        </div>
        <ContextMenu onSynced={setLastSyncedAt} onClearToken={onClear} />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-sky-300">Sundial</h1>
        <p className="text-sm text-slate-400">Dashboard coming soon.</p>
      </main>

      <footer className="flex justify-end px-6 py-3">
        <span className="text-xs text-slate-500">
          Last synced: {formattedSyncTime}
        </span>
      </footer>
    </div>
  );
}

export default Dashboard;

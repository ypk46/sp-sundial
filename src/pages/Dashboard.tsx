import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { ContextMenu } from '../components/ContextMenu';
import { TimeFrameFilter } from '../components/TimeFrameFilter';
import { TaxonomyFilter } from '../components/TaxonomyFilter';
import { MetricsRow } from '../components/MetricsRow';
import { ChartCard } from '../components/ChartCard';
import { ProjectDistributionChart } from '../components/ProjectDistributionChart';
import { TimeByPeriodChart } from '../components/TimeByPeriodChart';
import { CompletedTasksTable } from '../components/CompletedTasksTable';
import {
  getPresetRange,
  type DateRange,
  type RangeSelection,
} from '../lib/date-range';
import { getGranularity } from '../lib/by-period';
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

      <MetricsRow
        range={filters.dateRange}
        selectedProjectIds={filters.selectedProjectIds}
        selectedTagIds={filters.selectedTagIds}
      />

      <div className="px-6 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Project distribution" className="lg:col-span-1">
            <ProjectDistributionChart
              range={filters.dateRange}
              selectedProjectIds={filters.selectedProjectIds}
              selectedTagIds={filters.selectedTagIds}
            />
          </ChartCard>
          <ChartCard
            title={`Time per ${getGranularity(filters.dateRange)}`}
            className="lg:col-span-2"
          >
            <TimeByPeriodChart
              range={filters.dateRange}
              selectedProjectIds={filters.selectedProjectIds}
              selectedTagIds={filters.selectedTagIds}
            />
          </ChartCard>
        </div>
      </div>

      <div className="px-6 pb-4">
        <ChartCard title="Completed tasks">
          <CompletedTasksTable
            range={filters.dateRange}
            selectedProjectIds={filters.selectedProjectIds}
            selectedTagIds={filters.selectedTagIds}
          />
        </ChartCard>
      </div>

      <footer className="flex justify-end px-6 py-3">
        <span className="text-xs text-slate-500">
          Last synced: {formattedSyncTime}
        </span>
      </footer>
    </div>
  );
}

export default Dashboard;

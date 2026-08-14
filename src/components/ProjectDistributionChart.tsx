import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateByProject, type ProjectAggregation } from '../lib/by-project';
import { formatMs } from '../lib/format';
import type { DateRange } from '../lib/date-range';

interface ProjectDistributionChartProps {
  range: DateRange;
  selectedProjectIds: Set<string> | null;
  selectedTagIds: Set<string> | null;
}

interface TooltipEntry {
  title: string;
  totalTimeMs: number;
  percentage: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TooltipEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-sm font-medium text-slate-200">
          {entry.title}
        </span>
      </div>
      <div className="mt-1 flex gap-4 text-xs text-slate-400">
        <span>{formatMs(entry.totalTimeMs)}</span>
        <span>{entry.percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function CustomLegend({ data }: { data: ProjectAggregation[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((entry) => (
        <div key={entry.projectId} className="flex items-center gap-2 text-xs">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="flex-1 truncate text-slate-300">{entry.title}</span>
          <span className="font-mono text-slate-400">
            {entry.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProjectDistributionChart({
  range,
  selectedProjectIds,
  selectedTagIds,
}: ProjectDistributionChartProps) {
  const [data, setData] = useState<ProjectAggregation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    aggregateByProject(range, selectedProjectIds, selectedTagIds).then(
      (result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [range, selectedProjectIds, selectedTagIds]);

  if (loading) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-600">
        No data for this time range
      </div>
    );
  }

  return (
    <div className="flex h-[280px] flex-col items-center gap-4 sm:flex-row">
      <div className="h-[200px] w-full sm:h-full sm:flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalTimeMs"
              nameKey="title"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.projectId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full shrink-0 sm:w-40">
        <CustomLegend data={data} />
      </div>
    </div>
  );
}

export default ProjectDistributionChart;

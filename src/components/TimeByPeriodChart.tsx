import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { aggregateByPeriod, type PeriodBucket } from '../lib/by-period';
import { formatMs, formatHours, formatMinutes } from '../lib/format';
import type { DateRange } from '../lib/date-range';

interface TimeByPeriodChartProps {
  range: DateRange;
  selectedProjectIds: Set<string> | null;
  selectedTagIds: Set<string> | null;
  refreshKey?: number;
}

interface TooltipEntry {
  label: string;
  totalTimeMs: number;
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
      <p className="text-sm font-medium text-slate-200">{entry.label}</p>
      <p className="mt-0.5 text-xs text-slate-400">
        {formatMs(entry.totalTimeMs)}
      </p>
    </div>
  );
}

const BAR_COLOR = '#0ea5e9';
const HOUR_MS = 3600000;

export function TimeByPeriodChart({
  range,
  selectedProjectIds,
  selectedTagIds,
  refreshKey,
}: TimeByPeriodChartProps) {
  const [buckets, setBuckets] = useState<PeriodBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    aggregateByPeriod(range, selectedProjectIds, selectedTagIds).then(
      (result) => {
        if (!cancelled) {
          setBuckets(result.buckets);
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
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (buckets.length === 0 || buckets.every((b) => b.totalTimeMs === 0)) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-600">
        No data for this time range
      </div>
    );
  }

  const maxMs = Math.max(...buckets.map((b) => b.totalTimeMs));
  const useMinutes = maxMs < HOUR_MS;
  const tickFormatter = useMinutes ? formatMinutes : formatHours;

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={buckets}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tickFormatter={tickFormatter}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          />
          <Bar
            dataKey="totalTimeMs"
            fill={BAR_COLOR}
            radius={[3, 3, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TimeByPeriodChart;

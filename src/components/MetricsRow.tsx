import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import {
  computeMetrics,
  EMPTY_METRICS,
  type DashboardMetrics,
} from '../lib/metrics';
import { formatMs } from '../lib/format';
import type { DateRange } from '../lib/date-range';

interface MetricsRowProps {
  range: DateRange;
  selectedProjectIds: Set<string> | null;
  selectedTagIds: Set<string> | null;
  refreshKey?: number;
}

export function MetricsRow({
  range,
  selectedProjectIds,
  selectedTagIds,
  refreshKey,
}: MetricsRowProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    computeMetrics(range, selectedProjectIds, selectedTagIds).then((result) => {
      if (!cancelled) {
        setMetrics(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [range, selectedProjectIds, selectedTagIds, refreshKey]);

  return (
    <div className="flex gap-4 px-6 py-4">
      <MetricCard
        value={loading ? '—' : formatMs(metrics.totalTimeMs)}
        label="Total hours"
        icon={<Clock className="h-5 w-5" />}
      />
      <MetricCard
        value={loading ? '—' : String(metrics.tasksCompleted)}
        label="Tasks completed"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <MetricCard
        value={loading ? '—' : formatMs(metrics.avgDailyMs)}
        label="Avg daily hours"
        icon={<TrendingUp className="h-5 w-5" />}
      />
    </div>
  );
}

export default MetricsRow;

import type { ReactNode } from 'react';

interface MetricCardProps {
  value: string;
  label: string;
  icon: ReactNode;
}

export function MetricCard({ value, label, icon }: MetricCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-4">
      <div className="flex items-start justify-between">
        <span className="text-3xl font-semibold text-slate-100">{value}</span>
        <span className="text-slate-600">{icon}</span>
      </div>
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

export default MetricCard;

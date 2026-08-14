import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-4 ${className ?? ''}`}
    >
      <span className="text-sm font-medium text-slate-400">{title}</span>
      {children}
    </div>
  );
}

export default ChartCard;

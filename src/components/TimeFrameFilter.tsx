import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import {
  type DateRange,
  type PresetRange,
  type RangeSelection,
  PRESET_LABELS,
  getPresetRange,
  formatDateRange,
  parseDateInput,
} from '../lib/date-range';

interface TimeFrameFilterProps {
  rangeSelection: RangeSelection;
  dateRange: DateRange;
  onChange: (selection: RangeSelection, range: DateRange) => void;
}

const PRESET_ORDER: PresetRange[] = [
  'today',
  'thisWeek',
  'thisMonth',
  'thisYear',
];

function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function TimeFrameFilter({
  rangeSelection,
  dateRange,
  onChange,
}: TimeFrameFilterProps) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(rangeSelection === 'custom');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handlePreset = (preset: PresetRange) => {
    onChange(preset, getPresetRange(preset));
    setShowCustom(false);
    setOpen(false);
  };

  const handleCustomToggle = () => {
    setShowCustom(true);
  };

  const handleCustomStart = (value: string) => {
    if (!value) return;
    const start = parseDateInput(value, false);
    onChange('custom', { start, end: dateRange.end });
  };

  const handleCustomEnd = (value: string) => {
    if (!value) return;
    const end = parseDateInput(value, true);
    onChange('custom', { start: dateRange.start, end });
  };

  const label =
    rangeSelection === 'custom'
      ? formatDateRange(dateRange)
      : PRESET_LABELS[rangeSelection];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
          {PRESET_ORDER.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePreset(preset)}
              className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              {PRESET_LABELS[preset]}
              {rangeSelection === preset && (
                <Check className="h-4 w-4 text-sky-400" />
              )}
            </button>
          ))}

          <div className="my-1 border-t border-slate-700" />

          <button
            type="button"
            onClick={handleCustomToggle}
            className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Custom range
            {rangeSelection === 'custom' && (
              <Check className="h-4 w-4 text-sky-400" />
            )}
          </button>

          {showCustom && (
            <div className="flex flex-col gap-2 px-3 py-2">
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                Start date
                <input
                  type="date"
                  value={toInputValue(dateRange.start)}
                  onChange={(e) => handleCustomStart(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200 [color-scheme:dark]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                End date
                <input
                  type="date"
                  value={toInputValue(dateRange.end)}
                  onChange={(e) => handleCustomEnd(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200 [color-scheme:dark]"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimeFrameFilter;

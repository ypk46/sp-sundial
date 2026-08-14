import type { DateRange, RangeSelection } from '../lib/date-range';

export interface FilterState {
  rangeSelection: RangeSelection;
  dateRange: DateRange;
  selectedProjectIds: Set<string> | null;
  selectedTagIds: Set<string> | null;
}

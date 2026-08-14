export function formatMs(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export function formatHours(ms: number): string {
  const hours = ms / 3600000;
  return `${hours.toFixed(1)}h`;
}

export function formatMinutes(ms: number): string {
  const minutes = ms / 60000;
  return `${Math.round(minutes)}m`;
}

import { useEffect, useState } from 'react';
import { setSetting, SETTINGS_KEYS } from '../lib/settings';
import { db } from '../db/db';
import { SyncButton } from '../components/SyncButton';

interface DashboardProps {
  onClear: () => void;
}

export function Dashboard({ onClear }: DashboardProps) {
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const handleClear = async () => {
    await setSetting(SETTINGS_KEYS.apiToken, null);
    onClear();
  };

  useEffect(() => {
    db.meta.get('singleton').then((meta) => {
      if (meta) setLastSyncedAt(meta.lastSyncedAt);
    });
  }, []);

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString()
    : 'Never synced';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          Clear token
        </button>
        <SyncButton onSynced={setLastSyncedAt} />
      </header>

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

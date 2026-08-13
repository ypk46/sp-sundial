import { setSetting, SETTINGS_KEYS } from '../lib/settings';

interface DashboardProps {
  onClear: () => void;
}

export function Dashboard({ onClear }: DashboardProps) {
  const handleClear = async () => {
    await setSetting(SETTINGS_KEYS.apiToken, null);
    onClear();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-sky-300">Token saved</h1>
      <p className="text-sm text-slate-400">Dashboard coming soon.</p>
      <button
        type="button"
        onClick={handleClear}
        className="mt-4 rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
      >
        Clear token
      </button>
    </div>
  );
}

export default Dashboard;

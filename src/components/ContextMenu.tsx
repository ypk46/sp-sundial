import { useEffect, useRef, useState } from 'react';
import { MoreVertical, RefreshCw } from 'lucide-react';
import { syncFromSuperProductivity, SyncError } from '../lib/sync';
import { setSetting, SETTINGS_KEYS } from '../lib/settings';

interface ContextMenuProps {
  onSynced: (lastSyncedAt: number) => void;
  onClearToken: () => void;
}

export function ContextMenu({ onSynced, onClearToken }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState('');
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

  const handleSync = async () => {
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      const outcome = await syncFromSuperProductivity();
      setSyncStatus('idle');
      setOpen(false);
      onSynced(outcome.lastSyncedAt);
    } catch (e) {
      const message =
        e instanceof SyncError ? e.message : 'Sync failed unexpectedly';
      setErrorMessage(message);
      setSyncStatus('error');
    }
  };

  const handleClearToken = async () => {
    setOpen(false);
    await setSetting(SETTINGS_KEYS.apiToken, null);
    onClearToken();
  };

  return (
    <div ref={ref} className="relative flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        aria-label="More actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
            />
            {syncStatus === 'syncing' ? 'Syncing…' : 'Sync now'}
          </button>
          <div className="my-1 border-t border-slate-700" />
          <button
            type="button"
            onClick={handleClearToken}
            className="flex w-full items-center rounded px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Clear token
          </button>
        </div>
      )}

      {syncStatus === 'error' && errorMessage && (
        <span className="max-w-xs text-right text-xs text-red-400">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export default ContextMenu;

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { syncFromSuperProductivity, SyncError } from '../lib/sync';

interface SyncButtonProps {
  onSynced: (lastSyncedAt: number) => void;
}

export function SyncButton({ onSynced }: SyncButtonProps) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSync = async () => {
    setStatus('syncing');
    setErrorMessage('');
    try {
      const outcome = await syncFromSuperProductivity();
      setStatus('idle');
      onSynced(outcome.lastSyncedAt);
    } catch (e) {
      const message =
        e instanceof SyncError ? e.message : 'Sync failed unexpectedly';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={status === 'syncing'}
        className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
      >
        <RefreshCw
          className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin' : ''}`}
        />
        {status === 'syncing' ? 'Syncing…' : 'Sync'}
      </button>
      {status === 'error' && errorMessage && (
        <span className="max-w-xs text-right text-xs text-red-400">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export default SyncButton;

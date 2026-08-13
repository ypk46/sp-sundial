import { useState } from 'react';
import { PasswordField } from '../components/PasswordField';
import { setSetting, validateToken, SETTINGS_KEYS } from '../lib/settings';

interface TokenEntryPageProps {
  onSaved: () => void;
}

type Status = 'idle' | 'validating' | 'error';

export function TokenEntryPage({ onSaved }: TokenEntryPageProps) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed || status === 'validating') return;

    setStatus('validating');
    setErrorMsg('');

    try {
      await validateToken(trimmed);
      await setSetting(SETTINGS_KEYS.apiToken, trimmed);
      onSaved();
    } catch (err) {
      setStatus('error');
      setErrorMsg(typeof err === 'string' ? err : String(err));
    }
  };

  const isBusy = status === 'validating';

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-sky-300">
          Connect to Super Productivity
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Sundial reads your time-tracking data from Super Productivity&apos;s
          local REST API. Enable it in{' '}
          <span className="text-slate-200">
            Super Productivity → Settings → Miscellaneous → Enable local REST
            API
          </span>
          , then copy the displayed token below.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="api-token"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              API token
            </label>
            <PasswordField
              id="api-token"
              value={token}
              onChange={setToken}
              placeholder="Paste your REST API token"
              disabled={isBusy}
              aria-label="Super Productivity REST API token"
            />
          </div>

          {status === 'error' && (
            <p className="rounded-md border border-red-800/60 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy || !token.trim()}
            className="w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isBusy ? 'Validating…' : 'Save token'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TokenEntryPage;

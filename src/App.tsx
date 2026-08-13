import { useEffect, useState } from 'react';
import { TokenEntryPage } from './pages/TokenEntryPage';
import { Dashboard } from './pages/Dashboard';
import { getSetting, SETTINGS_KEYS } from './lib/settings';

type TokenState = 'loading' | 'present' | 'absent';

export default function App() {
  const [tokenState, setTokenState] = useState<TokenState>('loading');

  const checkToken = async () => {
    setTokenState('loading');
    try {
      const token = await getSetting<string>(SETTINGS_KEYS.apiToken);
      setTokenState(token ? 'present' : 'absent');
    } catch {
      setTokenState('absent');
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (tokenState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (tokenState === 'absent') {
    return <TokenEntryPage onSaved={() => setTokenState('present')} />;
  }

  return <Dashboard onClear={() => setTokenState('absent')} />;
}

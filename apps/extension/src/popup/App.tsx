import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupportedCardUrl } from '../card-page';
import { ensureCardContentScript } from '../runtime/ensure-card-content-script';

const DEFAULT_API = 'http://localhost:4001/api/v1';

type StatusMessage = { kind: 'ok' | 'err' | 'info'; text: string };

export function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [pairCode, setPairCode] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    void chrome.storage.local.get(['extensionToken', 'apiBaseUrl', 'lastSyncAt']).then((state) => {
      if (typeof state.extensionToken === 'string') setToken(state.extensionToken);
      if (typeof state.apiBaseUrl === 'string') setApiBase(state.apiBaseUrl);
      if (typeof state.lastSyncAt === 'string') setLastSync(state.lastSyncAt);
    });
  }, []);

  const lastSyncLabel = useMemo(() => {
    if (!lastSync) return null;

    const date = new Date(lastSync);
    if (Number.isNaN(date.getTime())) return lastSync;

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }, [lastSync]);

  const saveApiBase = useCallback(() => {
    void chrome.storage.local.set({ apiBaseUrl: apiBase.trim() || DEFAULT_API });
    setStatus({ kind: 'ok', text: 'API URL saved.' });
  }, [apiBase]);

  const pair = useCallback(async () => {
    setStatus(null);

    const code = pairCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setStatus({ kind: 'err', text: 'Enter the 6-digit code from CryptoTrack Settings.' });
      return;
    }

    const base = (apiBase || DEFAULT_API).replace(/\/$/, '');

    try {
      const response = await fetch(`${base}/auth/extension/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const body = (await response.json().catch(() => null)) as {
        token?: string;
        message?: string;
      };

      if (!response.ok) {
        setStatus({ kind: 'err', text: body?.message ?? `Pair failed (${response.status})` });
        return;
      }

      if (!body.token) {
        setStatus({ kind: 'err', text: 'No token in response.' });
        return;
      }

      await chrome.storage.local.set({ extensionToken: body.token, apiBaseUrl: base });
      setToken(body.token);
      setPairCode('');
      setStatus({ kind: 'ok', text: 'Paired successfully.' });
    } catch (error) {
      setStatus({ kind: 'err', text: error instanceof Error ? error.message : 'Network error' });
    }
  }, [apiBase, pairCode]);

  const signOut = useCallback(async () => {
    await chrome.storage.local.remove(['extensionToken']);
    setToken(null);
    setStatus({ kind: 'info', text: 'Signed out locally.' });
  }, []);

  const syncNow = useCallback(async () => {
    setStatus(null);

    if (!token) {
      setStatus({ kind: 'err', text: 'Pair the extension first.' });
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabUrl = tab?.url;

    if (!tab?.id || !tabUrl || !isSupportedCardUrl(tabUrl)) {
      setStatus({
        kind: 'err',
        text: 'Open the MetaMask Card transactions page in this window, then try again.',
      });
      return;
    }

    const ready = await ensureCardContentScript(tab.id, tabUrl);
    if (!ready) {
      setStatus({
        kind: 'err',
        text: 'Could not attach to this MetaMask Card tab yet. Try once more in a second.',
      });
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_NOW' });
      setStatus({ kind: 'info', text: 'Sync started for the current MetaMask Card tab.' });
    } catch {
      setStatus({
        kind: 'err',
        text: 'The page script did not answer. Try again once the tab is fully settled.',
      });
    }
  }, [token]);

  return (
    <main className="popup-shell">
      <section className="popup-card">
        <div className="popup-hero">
          <div>
            <p className="popup-kicker">MetaMask Card Sync</p>
            <h1 className="popup-title">CryptoTrack</h1>
            <p className="popup-subtitle">
              Pair once, then sync card transactions directly from the current MetaMask Card tab.
            </p>
          </div>
          <div className={`popup-badge ${token ? 'is-connected' : 'is-disconnected'}`}>
            {token ? 'Paired' : 'Not paired'}
          </div>
        </div>

        <section className="popup-panel">
          <div className="popup-panel-header">
            <h2>API</h2>
            <span>Local or deployed</span>
          </div>
          <label className="popup-label" htmlFor="api-base">
            API base
          </label>
          <input
            id="api-base"
            className="popup-input"
            value={apiBase}
            onChange={(event) => setApiBase(event.target.value)}
          />
          <button
            type="button"
            onClick={() => void saveApiBase()}
            className="popup-button popup-button-secondary"
          >
            Save API URL
          </button>
        </section>

        <section className="popup-panel">
          <div className="popup-panel-header">
            <h2>Pairing</h2>
            <span>{token ? 'Token stored locally' : '6-digit code from Settings'}</span>
          </div>

          {token ? (
            <div className="popup-paired-state">
              <div className="popup-paired-dot" />
              <p>Extension is paired and ready to sync.</p>
            </div>
          ) : (
            <>
              <label className="popup-label" htmlFor="pair-code">
                Pairing code
              </label>
              <input
                id="pair-code"
                className="popup-input"
                value={pairCode}
                onChange={(event) => setPairCode(event.target.value)}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => void pair()}
                className="popup-button popup-button-primary"
              >
                Pair extension
              </button>
            </>
          )}
        </section>

        <section className="popup-panel popup-panel-actions">
          <div className="popup-panel-header">
            <h2>Actions</h2>
            <span>Works on `card.metamask.io`</span>
          </div>
          <div className="popup-actions">
            <button
              type="button"
              onClick={() => void syncNow()}
              className="popup-button popup-button-primary"
            >
              Sync now
            </button>
            {token ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="popup-button popup-button-ghost"
              >
                Sign out
              </button>
            ) : null}
          </div>
          {lastSyncLabel ? <p className="popup-meta">Last sync: {lastSyncLabel}</p> : null}
        </section>

        {status ? (
          <p className={`popup-status popup-status-${status.kind}`}>{status.text}</p>
        ) : null}
      </section>
    </main>
  );
}

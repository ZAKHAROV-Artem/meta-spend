import './style.css';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  API_URL,
  disconnectExtension,
  pairExtension,
  syncCardTransactions,
  type CardSyncBodyWire,
} from './src/lib/api';

const STORAGE_API_TOKEN_KEY = 'metaspendApiToken';

type CaptureOutcome =
  | { ok: false; error: string; jobId?: string; scrapeOk?: boolean; detail?: string }
  | {
      ok: true;
      jobId: string;
      scrapeOk: true;
      transactionCount: number;
      /** Null when not paired — push happens from popup after scrape */
      syncPayload: CardSyncBodyWire | null;
      scrapeOnlyMessage: string | null;
    };

const LOG_PREFIX = '[MetaSpend Capture]';

function sendCaptureMessage(): Promise<CaptureOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ ok: false, error: 'Timed out. Keep the MetaMask Card tab open.' });
    }, 45_000);

    chrome.runtime.sendMessage(
      { type: 'CAPTURE_CARD_HTML' },
      (response: CaptureOutcome | undefined) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message ?? 'Extension error' });
          return;
        }
        resolve(response ?? { ok: false, error: 'No response from worker.' });
      },
    );
  });
}

function Fox({ pulse }: { pulse?: boolean }) {
  return (
    <svg
      className={`popup-header-fox${pulse ? ' is-loading' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="28"
      height="28"
      fill="none"
    >
      <path d="M24 3 L40 10 L44 26 L36 40 L24 45 L12 40 L4 26 L8 10 Z" fill="#F6851B" />
      <path d="M8 10 L14 3 L20 12 Z" fill="#E2761B" />
      <path d="M40 10 L34 3 L28 12 Z" fill="#E2761B" />
      <path d="M20 12 L28 12 L32 20 L24 22 L16 20 Z" fill="#CD6116" />
      <ellipse cx="16.5" cy="19" rx="3.5" ry="4" fill="white" />
      <ellipse cx="31.5" cy="19" rx="3.5" ry="4" fill="white" />
      <circle cx="17.5" cy="19.5" r="2" fill="#1D1D1D" />
      <circle cx="32.5" cy="19.5" r="2" fill="#1D1D1D" />
      <ellipse cx="24" cy="32" rx="7" ry="5.5" fill="#FCD0A3" />
      <ellipse cx="24" cy="29.5" rx="2.2" ry="1.4" fill="#1D1D1D" />
      <path
        d="M19 33 Q24 37 29 33"
        stroke="#CD6116"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M12 40 L24 45 L36 40 L31 35 L24 37 L17 35 Z" fill="#E2761B" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      className={spinning ? 'icon-spin' : undefined}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 1-15.3 6.4M3 12a9 9 0 0 1 15.3-6.4" />
      <path d="M3 17v-4h4M21 7v4h-4" />
    </svg>
  );
}

function UnlinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.5 8.5 21 6M5.5 15.5 3 18M9 6 7 4M15 18l2 2" />
      <path d="M14.5 6.5a3 3 0 0 1 0 4.24l-3.76 3.76a3 3 0 0 1-4.24-4.24l1.06-1.06" />
      <path d="M9.5 17.5a3 3 0 0 0 0-4.24l3.76-3.76a3 3 0 0 1 4.24 4.24l-1.06 1.06" />
    </svg>
  );
}

export default function Popup() {
  const [apiToken, setApiTokenState] = useState<string | null>(null);
  const [pairCode, setPairCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_API_TOKEN_KEY, (got) => {
      const t = got[STORAGE_API_TOKEN_KEY];
      setApiTokenState(typeof t === 'string' && t.length > 0 ? t : null);
      setStorageReady(true);
    });
  }, []);

  const apiHint = useMemo(() => API_URL.replace(/\/api\/v1\/?$/u, ''), []);

  const persistToken = useCallback((token: string) => {
    void chrome.storage.local.set({ [STORAGE_API_TOKEN_KEY]: token });
    setApiTokenState(token);
  }, []);

  const clearToken = useCallback(async () => {
    const currentToken = apiToken;
    try {
      if (currentToken) {
        await disconnectExtension(currentToken);
      }
    } catch (error) {
      setStatus({
        kind: 'error',
        text: error instanceof Error ? error.message : String(error),
      });
      return;
    }
    void chrome.storage.local.remove(STORAGE_API_TOKEN_KEY);
    setApiTokenState(null);
    setStatus({ kind: 'ok', text: 'Disconnected.' });
  }, [apiToken]);

  async function onConnect(): Promise<void> {
    setIsPairing(true);
    setStatus(null);
    try {
      const { token } = await pairExtension(pairCode.trim());
      persistToken(token);
      setPairCode('');
      setStatus({ kind: 'ok', text: '✓ Connected — you can now sync card transactions.' });
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsPairing(false);
    }
  }

  async function syncNow(): Promise<void> {
    setIsSyncing(true);
    setStatus(null);
    const outcome = await sendCaptureMessage();
    if (!outcome.ok) {
      setStatus({
        kind: 'error',
        text: outcome.detail ? `${outcome.error}\n${outcome.detail}` : outcome.error,
      });
      setIsSyncing(false);
      return;
    }

    if (!outcome.syncPayload) {
      setStatus({
        kind: 'ok',
        text: outcome.scrapeOnlyMessage ?? `Scraped ${outcome.transactionCount} rows.`,
      });
      setIsSyncing(false);
      return;
    }

    const token = apiToken;
    if (!token) {
      setStatus({ kind: 'error', text: 'Session token missing. Disconnect and pair again.' });
      setIsSyncing(false);
      return;
    }

    try {
      const sync = await syncCardTransactions(token, outcome.syncPayload);
      setStatus({
        kind: 'ok',
        text: `✓ Synced — ${sync.inserted} new, ${sync.updated} updated (${outcome.syncPayload.items.length} of ${outcome.transactionCount} parsed)`,
      });
    } catch (syncErr) {
      const syncMessage = syncErr instanceof Error ? syncErr.message : String(syncErr);
      setStatus({
        kind: 'error',
        text: `Scrape OK; API sync failed: ${syncMessage}`,
      });
    } finally {
      setIsSyncing(false);
    }
  }

  const connected = !!apiToken;

  if (!storageReady) {
    return (
      <main className="popup-root">
        <div className="popup-header">
          <Fox pulse />
          <div>
            <p className="popup-title">MetaSpend</p>
            <p className="popup-subtitle">MetaMask Card</p>
          </div>
        </div>
        <div className="popup-body is-loading">Loading…</div>
      </main>
    );
  }

  return (
    <main className="popup-root">
      <div className="popup-header">
        <Fox />
        <div>
          <p className="popup-title">MetaSpend</p>
        </div>
      </div>

      <div className="popup-body">
        <div key={connected ? 'connected' : 'disconnected'} className="state-block">
          {!connected ? (
            <>
              <label className="field-label" htmlFor="pair-code">
                Pair code
              </label>
              <input
                id="pair-code"
                placeholder="000000"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                value={pairCode}
                className="pair-input"
                disabled={isPairing}
                onChange={(e) => setPairCode(e.target.value.replace(/\D+/gu, '').slice(0, 6))}
              />
              <p className="hint">Copy the pairing code from Settings → Browser extension</p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isPairing || pairCode.trim().length < 6}
                onClick={() => void onConnect()}
              >
                {isPairing ? 'Connecting…' : 'Connect'}
              </button>
            </>
          ) : (
            <>
              <div className="connected-badge">
                <span className="connected-dot" />
                Connected
              </div>
              <p className="hint hint-left">Open the MetaMask Card activity page, then tap Sync.</p>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-half"
                  disabled={isSyncing}
                  onClick={() => void syncNow()}
                >
                  <RefreshIcon spinning={isSyncing} />
                  {isSyncing ? 'Syncing…' : 'Sync now'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={isSyncing}
                  onClick={() => void clearToken()}
                >
                  <UnlinkIcon />
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>

        {status && (
          <div className={`status ${status.kind === 'ok' ? 'status-ok' : 'status-err'}`}>
            {status.text}
          </div>
        )}
      </div>
    </main>
  );
}

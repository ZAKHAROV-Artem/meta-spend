import { useCallback, useEffect, useMemo, useState } from 'react';

import { API_URL, pairExtension, syncCardTransactions, type CardSyncBodyWire } from './src/lib/api';

const STORAGE_API_TOKEN_KEY = 'cryptotrackApiToken';

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

const FOX = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28" height="28" fill="none">
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

const s = {
  root: {
    width: 300,
    background: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  header: {
    background: 'linear-gradient(135deg, #F6851B 0%, #CD6116 100%)',
    padding: '16px 18px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    color: 'white',
  },
  title: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: 'white',
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  body: {
    padding: '16px 18px',
    color: '#111',
  },
  label: {
    display: 'block' as const,
    fontSize: 11,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box' as const,
    border: '1.5px solid #e5e7eb',
    borderRadius: 999,
    padding: '9px 14px',
    fontSize: 18,
    letterSpacing: '0.25em',
    textAlign: 'center' as const,
    outline: 'none',
    color: '#111',
    background: '#fafafa',
    fontFamily: 'monospace',
    transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%',
    border: 0,
    borderRadius: 999,
    background: 'linear-gradient(135deg, #F6851B 0%, #E2761B 100%)',
    color: 'white',
    cursor: 'pointer' as const,
    fontSize: 14,
    fontWeight: 700,
    padding: '11px 0',
    marginTop: 10,
    transition: 'opacity 0.15s',
    boxShadow: '0 4px 12px rgba(246,133,27,0.35)',
  },
  btnDisabled: { opacity: 0.55, cursor: 'wait' as const },
  row: { display: 'flex', gap: 8, marginTop: 0 },
  btnHalf: {
    flex: 1,
    border: 0,
    borderRadius: 999,
    background: 'linear-gradient(135deg, #F6851B 0%, #E2761B 100%)',
    color: 'white',
    cursor: 'pointer' as const,
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 0',
    transition: 'opacity 0.15s',
    boxShadow: '0 4px 12px rgba(246,133,27,0.3)',
  },
  btnGhost: {
    flex: 1,
    borderRadius: 999,
    border: '1.5px solid #e5e7eb',
    background: 'white',
    color: '#6b7280',
    cursor: 'pointer' as const,
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 0',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '10px 0 0',
    lineHeight: 1.4,
  },
  status: {
    marginTop: 12,
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12,
    lineHeight: 1.45,
  },
  ok: { background: '#ecfdf5', color: '#065f46' },
  err: { background: '#fef2f2', color: '#991b1b' },
  divider: { height: 1, background: '#f3f4f6', margin: '0 0 14px' },
  connectedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: '#ecfdf5',
    color: '#065f46',
    borderRadius: 999,
    padding: '3px 10px 3px 7px',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  },
};

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

  const clearToken = useCallback(() => {
    void chrome.storage.local.remove(STORAGE_API_TOKEN_KEY);
    setApiTokenState(null);
    setStatus({ kind: 'ok', text: 'Disconnected.' });
  }, []);

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
        text: `✓ Synced — ${sync.inserted} new, ${sync.updated} updated (${outcome.transactionCount} on page)`,
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
      <main style={s.root}>
        <div style={s.header}>
          {FOX}
          <div style={s.headerText}>
            <p style={s.title}>🦊 MetaSpend</p>
            <p style={s.subtitle}>MetaMask Card</p>
          </div>
        </div>
        <div style={{ ...s.body, color: '#9ca3af', fontSize: 13 }}>Loading…</div>
      </main>
    );
  }

  return (
    <main style={s.root}>
      {/* Header */}
      <div style={s.header}>
        {FOX}
        <div style={s.headerText}>
          <p style={s.title}>🦊 MetaSpend</p>
        </div>
      </div>

      <div style={s.body}>
        {!connected ? (
          <>
            <label style={s.label} htmlFor="pair-code">
              Pair code
            </label>
            <input
              id="pair-code"
              placeholder="000000"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              value={pairCode}
              style={s.input}
              disabled={isPairing}
              onChange={(e) => setPairCode(e.target.value.replace(/\D+/gu, '').slice(0, 6))}
            />
            <p style={s.hint}>Generate a code in Settings → Browser extension</p>
            <button
              type="button"
              style={{ ...s.btn, ...(isPairing ? s.btnDisabled : {}) }}
              disabled={isPairing || pairCode.trim().length < 6}
              onClick={() => void onConnect()}
            >
              {isPairing ? 'Connecting…' : 'Connect'}
            </button>
          </>
        ) : (
          <>
            <div style={s.divider} />
            <p style={{ ...s.hint, margin: '0 0 12px', color: '#6b7280', textAlign: 'left' }}>
              Open the MetaMask Card activity page, then tap Sync.
            </p>
            <div style={s.row}>
              <button
                type="button"
                style={{ ...s.btnHalf, ...(isSyncing ? s.btnDisabled : {}) }}
                disabled={isSyncing}
                onClick={() => void syncNow()}
              >
                {isSyncing ? 'Syncing…' : 'Sync now'}
              </button>
              <button type="button" style={s.btnGhost} disabled={isSyncing} onClick={clearToken}>
                Disconnect
              </button>
            </div>
          </>
        )}

        {status && (
          <div style={{ ...s.status, ...(status.kind === 'ok' ? s.ok : s.err) }}>{status.text}</div>
        )}
      </div>
    </main>
  );
}

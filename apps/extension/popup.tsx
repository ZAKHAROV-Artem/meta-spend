import { useCallback, useEffect, useMemo, useState } from 'react';

import { API_URL, pairExtension } from './src/lib/api';

const STORAGE_API_TOKEN_KEY = 'cryptotrackApiToken';

type CaptureOutcome =
  | {
      ok: false;
      error: string;

      jobId?: string;


      scrapeOk?: boolean;

      detail?: string;

    }


  | {
      ok: true;
      jobId: string;


      scrapeOk: true;



      transactionCount: number;



      parsedItems?: number;


      synced: false;


      message: string;


    }


  | {
      ok: true;
      jobId: string;



      scrapeOk: true;



      transactionCount: number;



      synced: true;



      inserted: number;


      updated: number;


      skippedDuplicateInBatch: number;


    };

const LOG_PREFIX = '[CryptoTrack Card Capture]';

function sendCaptureMessage(): Promise<CaptureOutcome> {
  return new Promise((resolve) => {


    let settled = false;



    const timeout = window.setTimeout(() => {


      if (settled) return;



      settled = true;



      console.error(LOG_PREFIX, 'background worker did not respond before timeout');


      resolve({ ok: false, error: 'Sync timed out. Reload the extension and keep the MetaMask Card tab active.' });


    }, 25_000);



    console.log(LOG_PREFIX, 'popup sending capture request');



    chrome.runtime.sendMessage({ type: 'CAPTURE_CARD_HTML' }, (response: CaptureOutcome | undefined) => {


      if (settled) return;



      settled = true;



      window.clearTimeout(timeout);



      if (chrome.runtime.lastError) {


        console.error(LOG_PREFIX, 'background worker error', chrome.runtime.lastError.message);


        resolve({
          ok: false,

          error: chrome.runtime.lastError.message ?? 'Extension messaging failed',
        });

        return;


      }



      resolve(response ?? { ok: false, error: 'No response from background worker.' });


    });


  });


}

const styles = {
  shell: {
    width: 320,

    padding: 16,

    fontFamily: 'Inter, system-ui, sans-serif',

    color: '#111827',


  },


  title: {
    margin: '0 0 6px',


    fontSize: 18,


    fontWeight: 700,


  },


  muted: {


    margin: '0 0 10px',

    color: '#6b7280',


    fontSize: 11,


    lineHeight: 1.35,

    wordBreak: 'break-all' as const,


  },


  label: {


    fontSize: 11,


    fontWeight: 600,


    color: '#374151',



    margin: '10px 0 4px',


  },

  input: {
    width: '100%',


    boxSizing: 'border-box' as const,


    border: '1px solid #e5e7eb',



    borderRadius: 8,


    padding: '8px 10px',



    fontSize: 14,


    outline: 'none',


    letterSpacing: '0.08em',

  },

  row: {


    display: 'flex',

    gap: 8,

  },

  text: {


    margin: '0 0 14px',


    color: '#4b5563',



    fontSize: 13,


    lineHeight: 1.4,

  },

  button: {

    flex: 1,

    border: 0,

    borderRadius: 8,

    background: '#111827',

    color: 'white',

    cursor: 'pointer',

    fontSize: 14,

    fontWeight: 700,

    padding: '10px 12px',

  },

  ghost: {


    flex: 1,
    borderRadius: 8,

    border: '1px solid #d1d5db',



    background: 'white',

    color: '#111827',

    cursor: 'pointer',

    fontSize: 13,

    fontWeight: 600,

    padding: '9px 10px',

  },

  buttonDisabled: {



    cursor: 'wait',

    opacity: 0.7,

  },

  status: {



    marginTop: 12,


    borderRadius: 8,


    padding: 10,

    fontSize: 12,


    lineHeight: 1.4,

    whiteSpace: 'pre-wrap' as const,

  },


  ok: {


    background: '#ecfdf5',


    color: '#065f46',



  },

  error: {


    background: '#fef2f2',


    color: '#991b1b',

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


    const code = pairCode.trim();

    setIsPairing(true);


    setStatus(null);


    try {


      const { token } = await pairExtension(code);


      persistToken(token);



      setPairCode('');



      setStatus({ kind: 'ok', text: 'Connected. You can sync card transactions.' });



    } catch (error) {


      const msg = error instanceof Error ? error.message : String(error);


      console.warn(LOG_PREFIX, 'pair failed', error);


      setStatus({ kind: 'error', text: msg });



    } finally {


      setIsPairing(false);



    }



  }



  async function syncNow(): Promise<void> {


    console.log(LOG_PREFIX, 'Sync now');


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



    if (outcome.synced) {


      setStatus({


        kind: 'ok',


        text: `Synced to API ✓



Job: ${outcome.jobId}

Rows on page: ${outcome.transactionCount}

Inserted ${outcome.inserted}, updated ${outcome.updated}, dupes skipped in batch: ${outcome.skippedDuplicateInBatch}`,


      });


    } else {


      setStatus({ kind: 'ok', text: outcome.message });


    }


    setIsSyncing(false);



  }



  const connected = !!apiToken;

  if (!storageReady) {
    return (


      <main style={styles.shell}>



        <h1 style={styles.title}>MetaMask Card</h1>



        <p style={styles.text}>Loading…</p>



      </main>


    );


  }

  return (


    <main style={styles.shell}>


      <h1 style={styles.title}>{connected ? 'MetaMask Card sync' : 'Connect CryptoTrack'}</h1>

      <p style={styles.muted}>API base: {apiHint}</p>

      {!connected ? (



        <>


          <p style={styles.text}>


            In the web app (Settings → Browser extension), generate a 6-digit code and enter it below.




          </p>


          <p style={styles.label}>Pair code</p>


          <input


            placeholder="123456"


            autoComplete="one-time-code"

            inputMode="numeric"

            maxLength={6}

            value={pairCode}


            style={styles.input}


            disabled={isPairing}



            onChange={(e) => setPairCode(e.target.value.replace(/\D+/gu, '').slice(0, 6))}




          />



          <div style={{ marginTop: 12 }}>


            <button


              type="button"


              style={{ ...styles.button, width: '100%', ...(isPairing ? styles.buttonDisabled : {}) }}



              disabled={isPairing || pairCode.trim().length < 6}




              onClick={() => void onConnect()}




            >


              {isPairing ? 'Connecting…' : 'Connect'}

            </button>


          </div>


        </>



      ) : (



        <>



          <p style={styles.text}>



            Open the MetaMask Card activity page on this Chrome window. Then tap sync to scrape and POST to CryptoTrack.



          </p>



          <div style={styles.row}>


            <button


              type="button"


              style={{ ...styles.button, ...(isSyncing ? styles.buttonDisabled : {}) }}



              disabled={isSyncing}


              onClick={() => void syncNow()}


            >


              {isSyncing ? 'Syncing…' : 'Sync now'}


            </button>


            <button type="button" style={styles.ghost} disabled={isSyncing} onClick={() => clearToken()}>



              Disconnect


            </button>


          </div>


        </>



      )}


      {status ? (




        <div style={{ ...styles.status, ...(status.kind === 'ok' ? styles.ok : styles.error) }}>




          {status.text}


        </div>


      ) : null}


    </main>


  );


}

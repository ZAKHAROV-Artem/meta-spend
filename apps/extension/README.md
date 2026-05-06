# CryptoTrack MetaMask Card capture extension

This extension scrapes MetaMask Card / Portfolio transaction lists and **`POST`s them to CryptoTrack**.

## Pairing / API URL

1. Sign in at the CryptoTrack web app → **Settings** → generate a **6-digit pairing code**.
2. Open this extension popup, enter the code, **Connect**.
3. Open MetaMask (`card.metamask.io` or `portfolio.metamask.io`), then click **Sync now**.

The popup shows the resolved API prefix. Override the REST base URL with Plasmo:

```bash
# default: http://localhost:4001/api/v1
PLASMO_PUBLIC_API_URL=http://localhost:4001/api/v1 pnpm --filter @crypto-tracker/extension dev
```

Ensure `host_permissions` in `package.json` includes your deployed API origin (HTTPS) if not using localhost.

## Local persistence

Successful scrapes remain in `chrome.storage.local` under `cardCaptures` (rolling buffer, newest first).

Legacy `capture-writer.ts` helper is removed; syncing goes through `/api/v1/card-transactions/sync` using the pairing token (`cryptotrackApiToken` in `chrome.storage.local`).

## Source files

- `popup.tsx` — pair/disconnect UI and **Sync now**
- `background.ts` — scrape active tab → normalize → bearer auth sync
- `content.ts` — scrapes rows on MM pages (`SCRAPE_CARD_HTML`)
- `src/lib/normalize.ts` — maps scraped rows → API `ParsedCardTx` (`parserVersion: 2`)
- `src/lib/api.ts` — `pairExtension`, `syncCardTransactions`

All logs use the prefix `[CryptoTrack Card Capture]`.

## Build

```bash
pnpm --filter @crypto-tracker/extension build
```

Load unpacked from:

```text
apps/extension/build/chrome-mv3-prod
```

Development:

```bash
pnpm --filter @crypto-tracker/extension dev
```

Then load:

```text
apps/extension/build/chrome-mv3-dev
```

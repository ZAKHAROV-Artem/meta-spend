# CryptoTrack — MetaMask Card browser extension

Imports MetaMask Card activity from MetaMask card pages into your CryptoTrack account.

## Build

```bash
pnpm install
pnpm --filter @crypto-tracker/shared build
pnpm --filter @crypto-tracker/extension build
```

Load **unpacked** from `apps/extension/build/chrome-mv3-prod` in Chrome (Extensions → Developer mode → Load unpacked).

For local iteration:

```bash
pnpm --filter @crypto-tracker/extension dev
```

## Configure

1. Sign in to the CryptoTrack web app → **Settings** → **Generate pairing code**.
2. Open the extension popup → paste the 6-digit code → **Pair**.
3. Open `https://card.metamask.io/card/transaction` or `https://portfolio.metamask.io`.
4. Parsed rows sync automatically; use **Sync now** to force a scrape.

Set **API base** in the popup if your API is not `http://localhost:3001/api/v1`.

The API allows `chrome-extension://` origins in **development** only (see `apps/api/src/main.ts` CORS).

# Publishing MetaSpend to the Chrome Web Store

This document contains the exact text to paste into the Chrome Web Store Developer Dashboard
when submitting or updating the MetaSpend extension listing.

## Before you submit

1. Build the production package: `pnpm --filter @metaspend/extension package`
2. Confirm `apps/extension/build/chrome-mv3-prod/manifest.json` has the production `key`,
   `name`, `description`, and `host_permissions` (no `localhost` entries).
3. Confirm `https://metaspend.app/privacy` is live and reachable (required for the Privacy
   practices tab below).
4. Upload `apps/extension/build/chrome-mv3-prod.zip`.

**Extension ID** (deterministic — derived from the public key in
`apps/extension/package.json`'s `manifest.key`, generated from the private key at
`apps/extension/keys/extension-key.pem`, which is gitignored and must be backed up separately;
losing it means losing the ability to push updates under this same listing once published):

```
pgakfgaialdikngmhnjdpgehfiddmook
```

## Store listing

**Extension name**: MetaSpend - MetaMask Card sync

**Short description** (≤132 characters):
`Sync your MetaMask Card transactions into MetaSpend for automatic spending tracking.`
(85 characters.)

**Full description**:

```
MetaSpend turns your MetaMask Card transaction history into a real expense tracker.

HOW IT WORKS
1. Create a free MetaSpend account at metaspend.app
2. Install this extension and pair it with a one-time 6-digit code from your MetaSpend Settings page
3. Open your MetaMask Card or Portfolio activity page and click "Sync now"
4. Your transactions appear instantly in your MetaSpend dashboard — categorized, searchable, and
   broken down by merchant, time period, and spending category

WHAT IT DOES
- Reads the transaction list already visible to you on card.metamask.io and
  portfolio.metamask.io
- Sends that transaction data securely to your MetaSpend account
- Categorizes spending automatically (with AI-assisted merchant matching you can always
  override)
- Nothing else — no browsing history, no other websites, no tracking

WHY METASPEND
The MetaMask Card portal shows you a transaction list, but no spending breakdown, no
categories, no trends, and no way to group expenses for a trip or budget. MetaSpend fills that
gap with the kind of expense-tracking experience you'd expect from a normal banking app — built
specifically for MetaMask Card spending.

MetaSpend is an independent project and is not affiliated with, endorsed by, or operated by
MetaMask or Consensys.

Privacy policy: https://metaspend.app/privacy
```

## Single purpose description

```
This extension's single purpose is to read MetaMask Card and MetaMask Portfolio transaction
data from pages the user has open in their own browser, and securely send that data to the
user's own MetaSpend account so it can be displayed as categorized spending analytics in the
MetaSpend web dashboard.
```

## Permission justifications

**storage**
```
Used to store the user's MetaSpend pairing token locally (chrome.storage.local) so the
extension stays connected to their account between browser sessions, and to keep a small
rolling local cache of the most recent scrape results for troubleshooting sync issues. No data
is stored that isn't already sent to the user's own MetaSpend account.
```

**tabs**
```
Used only to identify the currently active tab and confirm it is a MetaMask Card or Portfolio
page (card.metamask.io / portfolio.metamask.io) before attempting to read transaction data from
it. The extension does not read tab URLs or content for any other site.
```

**scripting**
```
Used as a fallback to inject a self-contained read-only script into the active MetaMask Card or
Portfolio tab to extract transaction rows, only when the extension's content script has not yet
loaded on that page (e.g. immediately after a page refresh). This script only reads visible
transaction data already rendered on the page; it does not modify the page or inject any
persistent code.
```

## Host permission justification

```
https://portfolio.metamask.io/* and https://card.metamask.io/* — required because these are the
only two pages the extension reads transaction data from; the extension's content script and
fallback scraper only operate on these domains.

https://metaspend.app/* — required so the extension can send transaction data to the user's own
MetaSpend account over HTTPS; this is the API origin the synced data is delivered to.
```

## Remote code

**Remote code: No**

```
This extension does not download, evaluate, or execute any remote code. All extension logic
(popup, background worker, content script, and fallback scraper) is bundled at build time and
included in the submitted package. The extension only sends and receives JSON data over HTTPS
to/from the user's own MetaSpend account — it never fetches or runs executable code from a
remote source.
```

## Data usage disclosure

**Categories of data collected** (check these in the CWS dashboard):
- ✅ **Financial and payment information** — transaction amounts, merchant names, masked card
  details, and crypto/gas-fee amounts read from the user's MetaMask Card activity.
- ✅ **Authentication information** — the MetaSpend pairing token used to authenticate sync
  requests (stored locally in chrome.storage.local; not a password).
- ✅ **Website content** — the extension reads transaction-row content from
  card.metamask.io / portfolio.metamask.io pages to extract the data above.

**NOT collected** (leave unchecked):
- ❌ Personally identifiable information beyond what's needed for the account/transactions
  above (no name, no address, no phone number is collected by the extension itself)
- ❌ Health information
- ❌ Location
- ❌ Web history (only the two specific MetaMask domains are read; general browsing history is
  never accessed)
- ❌ User activity (no clicks/keystrokes/mouse tracking)
- ❌ Personal communications

**Justification text for the disclosure form**:
```
MetaSpend's browser extension reads MetaMask Card transaction details (merchant, amount, date,
masked card info) directly from pages the user has open, and transmits this data — along with
an authentication token proving the user's MetaSpend account — to the user's own MetaSpend
account over HTTPS. No other category of personal data is collected. The extension does not
access any site other than card.metamask.io, portfolio.metamask.io, and the MetaSpend API
itself.
```

## Required certifications

All three of the following are true for MetaSpend and should be checked:

1. **I do not sell or transfer user data to third parties outside the approved use cases** —
   true: MetaSpend does not sell, rent, or share user data. The only third party that receives
   any data is OpenAI, and only merchant names (not full transaction data) for the limited
   purpose of suggesting a spending category — this is a service MetaSpend uses on the user's
   behalf, not a data sale or transfer for an unrelated purpose.
2. **I do not use or transfer user data for purposes unrelated to my item's single purpose** —
   true: all data collected is used exclusively to sync, categorize, and display the user's own
   spending in their own MetaSpend dashboard.
3. **I do not use or transfer user data to determine creditworthiness or for lending purposes** —
   true: MetaSpend has no lending, credit-scoring, or underwriting functionality of any kind.

## Privacy policy URL

```
https://metaspend.app/privacy
```
Confirm this resolves with a 200 status and renders the policy before submitting.

## Known placeholders to fix before going live

- `privacy@metaspend.app` / `support@metaspend.app` (used in the Privacy Policy and Terms of
  Service pages) are placeholder addresses — replace with real, monitored inboxes before
  publishing.

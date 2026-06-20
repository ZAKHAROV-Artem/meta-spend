# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CryptoTrack / "MetaSpend" — turns MetaMask Card transactions into a normal expense-tracking
experience (categories, analytics, multi-currency trips). See `docs/project-description.md` for
the original product brief (multi-chain wallet tracking is the long-term vision; today the only
live data source is the MetaMask Card, synced via a browser extension that scrapes the Card
portal HTML).

## Monorepo layout

pnpm workspaces + Turborepo. `turbo.json` wires `build`/`lint`/`typecheck` to run dependencies
first (`^build` etc.), so always go through the root scripts or `pnpm --filter` rather than
running tools inside a package directly.

- `apps/api` — NestJS (Fastify adapter), REST API under `/api/v1`.
- `apps/web` — Next.js 15 App Router, the user-facing dashboard.
- `apps/extension` — Plasmo Chrome extension (MV3) that scrapes MetaMask Card pages and syncs to the API.
- `packages/db` — Prisma schema/client. Other packages import generated types from `@crypto-tracker/db` (it re-exports `@prisma/client`), not from `@prisma/client` directly.
- `packages/shared` — zod schemas, shared TS types, and merchant-categorization rule matching used by both `api` and `web`.

`apps/web` and `apps/api` both depend on `@crypto-tracker/shared`/`@crypto-tracker/db` as built
artifacts (`dist/`), not source — after editing `packages/shared` or `packages/db`, rebuild that
package (or run the consumer's `dev` script, which does it for you) before the change is visible
elsewhere.

## Common commands

Run from repo root unless noted.

```bash
pnpm install                  # install all workspaces
pnpm dev                      # turbo run dev (all apps in parallel)
pnpm build                    # turbo run build
pnpm lint                     # turbo run lint
pnpm typecheck                # turbo run typecheck

pnpm --filter @crypto-tracker/api dev      # Nest with --watch (builds db+shared first)
pnpm --filter @crypto-tracker/web dev      # Next.js on port 4000
pnpm --filter @crypto-tracker/extension dev  # Plasmo dev build (depends on web#build in turbo.json)

pnpm db:generate               # prisma generate (turbo, all packages)
pnpm db:migrate                # prisma migrate dev (uses apps/api/.env)
pnpm db:studio                 # prisma studio
pnpm db:seed                   # run packages/db/prisma/seed.ts
pnpm db:reset                  # prisma migrate reset
```

### Tests (api only — web/extension have none)

There is no Jest config. `apps/api` tests run on Node's built-in test runner against
hand-rolled in-memory fakes for Prisma (no test database). The `test` script in
`apps/api/package.json` lists each `*.spec.ts` file **explicitly** — there is no glob, so a new
spec file is silently skipped unless you add it to that script.

```bash
pnpm --filter @crypto-tracker/api test
# or run one file directly:
node --test --require ts-node/register --require tsconfig-paths/register \
  apps/api/src/trips/trips.service.spec.ts
```

## API architecture (`apps/api`)

- Fastify-based Nest app, global prefix `api/v1`, global `ValidationPipe` (`whitelist`,
  `forbidNonWhitelisted`, `transform`) — every endpoint needs a DTO with `class-validator`
  decorators, even for simple bodies.
- Feature modules under `src/<feature>/` (auth, users, categories, transactions,
  card-transactions, portfolio, trips), each with its own `*.module.ts`, controller, service,
  and `dto/`.
- Two auth guards, used selectively per controller:
  - `JwtAuthGuard` (`src/common/guards/jwt-auth.guard.ts`) — standard web-app JWT only.
  - `JwtOrExtensionAuthGuard` (`src/common/guards/jwt-or-extension-auth.guard.ts`) — accepts
    either a JWT or a hashed extension pairing token (`ExtensionToken` table); used on endpoints
    the browser extension calls directly (e.g. card-transactions sync).
  - Pull the authenticated user in handlers with `@CurrentUser() user: AuthUser`
    (`src/common/decorators/current-user.decorator.ts`), never read `request.user` manually.
- Auth supports three flows: email/password (bcrypt + local strategy), SIWE (Sign-In With
  Ethereum, nonce store in `auth/siwe/`), and extension pairing (6-digit code →
  `ExtensionPairCodeStore` → long-lived hashed token). Access/refresh JWTs are short/long lived
  per `config/configuration.ts` (`JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN`).
- Config is centralized in `src/config/configuration.ts` and read via `ConfigService` —
  add new env vars there, not with raw `process.env` in feature code.
- All uncaught exceptions flow through `AllExceptionsFilter`
  (`src/common/filters/http-exception.filter.ts`); request/response timing is logged via
  Fastify hooks in `main.ts` using `devLogger`.

### Categorization pipeline (the core domain logic)

Transactions arrive from the extension as `CARD` source rows (`TransactionSource.CARD` is
currently the only value). Categorization layers, in order:

1. **Merchant memory** — `CardMerchantMemory` table: a learned `merchantKey → category` mapping
   per user, written either by AI confirmation or manual bulk-assign (`learnedSource`).
2. **Rules matching** — `packages/shared/src/merchant-rules/match.ts`
   (`firstMatchingCategoryId`): simple "merchant name contains X" rules, first match wins.
3. **AI fallback** — `CardMerchantOpenAiService`
   (`src/transactions/card-merchant-openai.service.ts`) batches unmatched merchants to OpenAI
   (chunked, strict JSON-schema response validated against the real category/subcategory IDs).
   Runs are tracked in `CardCategorizationRun` (status, counts, errors) for UI progress/history
   — see `CardCategorizationRunService` and `transactions.controller.ts`'s
   `categorization-runs` endpoint.

Merchant key normalization (`normalizeMerchantKey`, in `packages/shared`) is the join key across
memory, rules, and AI — keep it in sync if you touch any of these three layers.

## Web app architecture (`apps/web`)

- App Router with two route groups: `app/(app)/*` (authenticated dashboard — dashboard,
  transactions, categories, analytics, trips, settings) and `app/auth/*` (login/SIWE).
- **Data fetching**: there's no generic REST client to extend. `src/hooks/api/useApi.ts` exports
  `useApiQuery`/`useApiMutation`, thin wrappers around TanStack Query that attach the bearer
  token, retry once after a transparent refresh-token exchange on 401, and redirect to
  `/auth/login` if refresh fails. Every resource hook (`useTransactions.ts`, `useTrips.ts`, etc.)
  is built on these two — follow that pattern for new endpoints rather than calling `fetch`
  directly. (`lib/api-client.ts` only covers the auth bootstrap calls used outside React Query.)
- Auth tokens/session live in `localStorage` + a `ms_authed` cookie, managed by
  `src/lib/auth.ts` (`setSession`/`clearSession`/`getAccessToken`); cross-tab token sync uses the
  `storage` event (see `useAccessToken`).
- Wallet connection (SIWE login) uses `wagmi`/`viem`, configured in `src/lib/wagmi-config.ts` and
  `src/providers/WagmiProvider.tsx`. Server-state lives in TanStack Query
  (`providers/QueryProvider.tsx`); cross-cutting UI-only state (not server data) lives in the
  Zustand store `src/store/ui.store.ts`.
- UI is Tailwind v4 + Radix primitives wrapped in `src/components/ui/` (shadcn-style), with
  feature components grouped by domain under `src/components/<feature>/`.

## Extension (`apps/extension`)

Plasmo MV3 extension, source under `src/` (root-level `background.ts`/`content.ts`/`popup.tsx`
are stale — Plasmo builds from `src/`). Flow: `content.ts` scrapes transaction rows from
`card.metamask.io`/`portfolio.metamask.io`, `src/lib/normalize.ts` maps them to the
`ParsedCardTx` shape (shared schema, `parserVersion: 2`), `background.ts` posts them to
`POST /api/v1/card-transactions/sync` using the pairing token stored in
`chrome.storage.local.cryptotrackApiToken`. Pairing itself happens via a 6-digit code generated
in the web app's Settings page. Override the API origin with `PLASMO_PUBLIC_API_URL` (see
`apps/extension/README.md`).

## Database (`packages/db`)

Single Postgres schema (`packages/db/prisma/schema.prisma`). Notable shape:
`User` → `Transaction` (source `CARD` only today) ↔ `Category`/`Category` (parent/sub via
self-relation `parentId`) ↔ `CardMerchantMemory`, plus `Trip` ↔ `TripTransaction` (join table) for
grouping transactions into multi-currency trips, and `ExtensionToken`/`Session` for the two auth
token types. Decimal columns use explicit precision (`@db.Decimal(24, 8)` for fiat,
`@db.Decimal(36, 18)` for crypto amounts) — preserve that when adding money fields.

Migrations live in `prisma/migrations/`; run `pnpm db:migrate` (dev) from the repo root, not
`prisma migrate dev` directly, since it injects `apps/api/.env` via `dotenv-cli`.

## Deployment

`docker-compose.yml` runs three services (`postgres`, a one-shot `migrate` job, `api`, `web`)
behind the nginx config in `deploy/nginx.conf`. See `docs/deployment-guide.md` for the full VPS
setup (Ubuntu-based) and the GitHub Actions auto-deploy workflow. `.env.example` documents
the handful of env vars docker-compose itself needs (`NEXT_PUBLIC_API_URL`, `ALLOWED_ORIGINS`,
`POSTGRES_PASSWORD`); app-specific secrets (JWT, OpenAI, etc.) go in `apps/api/.env`.

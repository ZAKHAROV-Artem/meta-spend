-- Card-only: remove holdings, wallets, rules; slim transactions; add merchant memory + categorization runs.

-- Self-referential link on card rows
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_holdingsRefId_fkey";
DROP INDEX IF EXISTS "transactions_holdingsRefId_idx";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "holdingsRefId";

DELETE FROM "transactions" WHERE "source" = 'HOLDINGS';

ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_walletId_fkey";
DROP INDEX IF EXISTS "transactions_walletId_idx";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "walletId";

DROP TABLE IF EXISTS "wallets" CASCADE;
DROP TABLE IF EXISTS "rules" CASCADE;

DROP INDEX IF EXISTS "transactions_hash_chainId_key";

ALTER TABLE "transactions" DROP COLUMN IF EXISTS "hash";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "chainId";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "blockNumber";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "fromAddress";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "toAddress";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "value";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "valueUsd";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "gasUsed";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "gasPriceGwei";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "gasCostUsd";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "txType";

ALTER TABLE "transactions" ALTER COLUMN "source" DROP DEFAULT;

CREATE TYPE "TransactionSource_new" AS ENUM ('CARD');
ALTER TABLE "transactions"
  ALTER COLUMN "source" TYPE "TransactionSource_new"
  USING ('CARD'::"TransactionSource_new");
DROP TYPE "TransactionSource";
ALTER TYPE "TransactionSource_new" RENAME TO "TransactionSource";
ALTER TABLE "transactions" ALTER COLUMN "source" SET DEFAULT 'CARD'::"TransactionSource";

DROP TYPE IF EXISTS "TxType";
DROP TYPE IF EXISTS "SyncStatus";

UPDATE "transactions" SET "externalId" = id WHERE "externalId" IS NULL;
ALTER TABLE "transactions" ALTER COLUMN "externalId" SET NOT NULL;

CREATE TYPE "CategorizationRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

CREATE TABLE "card_merchant_memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantKey" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "learnedSource" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_merchant_memory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "card_merchant_memory_userId_merchantKey_key" ON "card_merchant_memory" ("userId", "merchantKey");
CREATE INDEX "card_merchant_memory_userId_idx" ON "card_merchant_memory" ("userId");

ALTER TABLE "card_merchant_memory" ADD CONSTRAINT "card_merchant_memory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "card_merchant_memory" ADD CONSTRAINT "card_merchant_memory_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "card_categorization_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CategorizationRunStatus" NOT NULL DEFAULT 'QUEUED',
    "trigger" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "scannedTxCount" INTEGER NOT NULL DEFAULT 0,
    "scannedMerchantCount" INTEGER NOT NULL DEFAULT 0,
    "memoryMatchedCount" INTEGER NOT NULL DEFAULT 0,
    "aiUpdatedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "meta" JSONB,

    CONSTRAINT "card_categorization_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "card_categorization_runs_userId_startedAt_idx"
  ON "card_categorization_runs" ("userId", "startedAt" DESC);

ALTER TABLE "card_categorization_runs" ADD CONSTRAINT "card_categorization_runs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

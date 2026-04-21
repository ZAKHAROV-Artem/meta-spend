-- CreateEnum
CREATE TYPE "CardTxStatus" AS ENUM ('PENDING', 'SETTLED', 'DECLINED', 'REFUNDED');

-- CreateTable
CREATE TABLE "card_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "merchantName" TEXT NOT NULL,
    "merchantRaw" TEXT,
    "fiatAmount" DECIMAL(18,2) NOT NULL,
    "fiatCurrency" TEXT NOT NULL,
    "cryptoAmount" DECIMAL(36,18),
    "cryptoSymbol" TEXT,
    "status" "CardTxStatus" NOT NULL DEFAULT 'SETTLED',
    "categoryId" TEXT,
    "notes" TEXT,
    "parserVersion" INTEGER NOT NULL,
    "rawHtml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extension_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extension_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_transactions_userId_externalId_key" ON "card_transactions"("userId", "externalId");

CREATE INDEX "card_transactions_userId_occurredAt_idx" ON "card_transactions"("userId", "occurredAt");

CREATE INDEX "card_transactions_categoryId_idx" ON "card_transactions"("categoryId");

CREATE UNIQUE INDEX "extension_tokens_tokenHash_key" ON "extension_tokens"("tokenHash");

CREATE INDEX "extension_tokens_userId_idx" ON "extension_tokens"("userId");

-- AddForeignKey
ALTER TABLE "card_transactions" ADD CONSTRAINT "card_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "card_transactions" ADD CONSTRAINT "card_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "extension_tokens" ADD CONSTRAINT "extension_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

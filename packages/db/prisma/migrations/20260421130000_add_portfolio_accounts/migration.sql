CREATE TABLE "portfolio_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lastRefreshRequestedAt" TIMESTAMP(3),
    "lastSuccessfulSyncAt" TIMESTAMP(3),
    "lastSyncState" TEXT DEFAULT 'IDLE',
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "portfolio_accounts_userId_key" ON "portfolio_accounts"("userId");
CREATE INDEX "portfolio_accounts_address_idx" ON "portfolio_accounts"("address");

ALTER TABLE "portfolio_accounts"
ADD CONSTRAINT "portfolio_accounts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

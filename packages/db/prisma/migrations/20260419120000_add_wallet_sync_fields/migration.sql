CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'SYNCING', 'FAILED');

ALTER TABLE "wallets"
ADD COLUMN "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN "lastSyncedBlock" BIGINT,
ADD COLUMN "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE';

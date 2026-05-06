-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "holdingsRefId" TEXT;

-- CreateIndex
CREATE INDEX "transactions_holdingsRefId_idx" ON "transactions"("holdingsRefId");

-- AddForeignKey
ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_holdingsRefId_fkey"
  FOREIGN KEY ("holdingsRefId") REFERENCES "transactions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "card_merchant_memory" ADD COLUMN     "subcategoryId" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "subcategoryId" TEXT;

-- CreateIndex
CREATE INDEX "transactions_subcategoryId_idx" ON "transactions"("subcategoryId");

-- Re-scope category name uniqueness from all user categories to siblings.
DROP INDEX IF EXISTS "categories_userId_name_key";
CREATE INDEX "categories_userId_parentId_idx" ON "categories"("userId", "parentId");
CREATE UNIQUE INDEX "categories_user_root_name_key" ON "categories"("userId", "name") WHERE "parentId" IS NULL;
CREATE UNIQUE INDEX "categories_user_parent_name_key" ON "categories"("userId", "parentId", "name") WHERE "parentId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_merchant_memory" ADD CONSTRAINT "card_merchant_memory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

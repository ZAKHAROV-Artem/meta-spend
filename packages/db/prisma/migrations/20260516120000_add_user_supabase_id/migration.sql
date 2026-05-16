-- AlterTable
ALTER TABLE "users" ADD COLUMN "supabaseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

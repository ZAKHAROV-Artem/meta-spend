-- AlterTable
ALTER TABLE "users" ADD COLUMN     "displayName" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

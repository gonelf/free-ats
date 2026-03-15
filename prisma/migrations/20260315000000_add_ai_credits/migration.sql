-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "aiCreditsBalance" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "aiCreditsResetAt" TIMESTAMP(3);

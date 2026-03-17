-- CreateEnum
CREATE TYPE "ClaimedStatus" AS ENUM ('UNCLAIMED', 'CLAIMED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "claimedStatus" "ClaimedStatus" NOT NULL DEFAULT 'CLAIMED';

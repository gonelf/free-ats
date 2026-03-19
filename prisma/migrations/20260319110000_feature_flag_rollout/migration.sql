-- CreateEnum
CREATE TYPE "FlagRollout" AS ENUM ('DISABLED', 'ADMINS', 'EVERYONE');

-- AlterTable: drop enabled, add rollout
ALTER TABLE "FeatureFlag" DROP COLUMN "enabled";
ALTER TABLE "FeatureFlag" ADD COLUMN "rollout" "FlagRollout" NOT NULL DEFAULT 'DISABLED';

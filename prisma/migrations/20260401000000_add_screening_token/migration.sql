-- AlterTable: add screeningToken fields to Screening
ALTER TABLE "Screening"
  ADD COLUMN "screeningToken" TEXT,
  ADD COLUMN "screeningTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex: unique constraint on screeningToken
CREATE UNIQUE INDEX "Screening_screeningToken_key" ON "Screening"("screeningToken");

-- CreateIndex: index for token lookups
CREATE INDEX "Screening_screeningToken_idx" ON "Screening"("screeningToken");

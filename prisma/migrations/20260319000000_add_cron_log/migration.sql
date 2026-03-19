-- CreateTable
CREATE TABLE "CronLog" (
    "id" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "details" JSONB,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CronLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CronLog_job_idx" ON "CronLog"("job");

-- CreateIndex
CREATE INDEX "CronLog_createdAt_idx" ON "CronLog"("createdAt");

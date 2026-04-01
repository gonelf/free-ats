-- AlterTable: Add aiScoreSummary to Application
ALTER TABLE "Application" ADD COLUMN "aiScoreSummary" JSONB;

-- CreateEnum: InterviewStatus
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum: HireRecommendation
CREATE TYPE "HireRecommendation" AS ENUM ('STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO');

-- CreateTable: Interview
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Interview',
    "scheduledAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 60,
    "meetingLink" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InterviewFeedback
CREATE TABLE "InterviewFeedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rubricScores" JSONB NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "recommendation" "HireRecommendation" NOT NULL,
    "notes" TEXT,
    "aiDrafted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Screening
CREATE TABLE "Screening" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "responses" JSONB,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "InterviewFeedback_interviewId_idx" ON "InterviewFeedback"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Screening_applicationId_key" ON "Screening"("applicationId");

-- CreateIndex
CREATE INDEX "Screening_applicationId_idx" ON "Screening"("applicationId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screening" ADD CONSTRAINT "Screening_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "aiGapAnalysis" JSONB,
ADD COLUMN "aiInterviewQuestions" JSONB,
ADD COLUMN "aiReferenceQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

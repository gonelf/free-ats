ALTER TABLE "Candidate" ADD COLUMN "summary" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "workExperience" JSONB;
ALTER TABLE "Candidate" ADD COLUMN "achievements" TEXT[] NOT NULL DEFAULT '{}';

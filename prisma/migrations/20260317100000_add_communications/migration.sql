-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('OUTREACH', 'INTERVIEW_INVITE', 'FOLLOW_UP', 'OFFER', 'REJECTION');

-- CreateTable
CREATE TABLE "Communication" (
    "id"             TEXT NOT NULL,
    "candidateId"    TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId"          TEXT,
    "type"           "EmailType" NOT NULL,
    "subject"        TEXT NOT NULL,
    "body"           TEXT NOT NULL,
    "authorId"       TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Communication_candidateId_idx" ON "Communication"("candidateId");

-- CreateIndex
CREATE INDEX "Communication_organizationId_idx" ON "Communication"("organizationId");

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

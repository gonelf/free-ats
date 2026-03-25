-- Add claim token fields to Organization
ALTER TABLE "Organization" ADD COLUMN "claimToken" TEXT UNIQUE;
ALTER TABLE "Organization" ADD COLUMN "claimTokenExpiresAt" TIMESTAMP(3);

-- Create OutreachLead table
CREATE TABLE "OutreachLead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "hiringFor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachLead_pkey" PRIMARY KEY ("id")
);

-- Create OutreachEmail table
CREATE TABLE "OutreachEmail" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "resendId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachEmail_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "OutreachLead_status_idx" ON "OutreachLead"("status");
CREATE INDEX "OutreachLead_source_idx" ON "OutreachLead"("source");
CREATE INDEX "OutreachLead_createdAt_idx" ON "OutreachLead"("createdAt");
CREATE INDEX "OutreachEmail_leadId_idx" ON "OutreachEmail"("leadId");

-- Add foreign key
ALTER TABLE "OutreachEmail" ADD CONSTRAINT "OutreachEmail_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "OutreachLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add claim token fields to OutreachLead (for /claim links in outreach emails)
ALTER TABLE "OutreachLead" ADD COLUMN "claimToken" TEXT UNIQUE;
ALTER TABLE "OutreachLead" ADD COLUMN "claimTokenExpiresAt" TIMESTAMP(3);

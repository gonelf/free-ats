import "dotenv/config";
import { db } from "../src/lib/db";

async function backfillTemplates() {
  console.log("Starting backfill of email templates...");

  const orgs = await db.organization.findMany({
    include: {
      emailTemplates: {
        where: { type: "CONFIRMATION" }
      }
    }
  });

  console.log(`Found ${orgs.length} organizations.`);

  for (const org of orgs) {
    if (org.emailTemplates.length === 0) {
      console.log(`Adding confirmation template to ${org.name} (${org.id})...`);
      await db.emailTemplate.create({
        data: {
          organizationId: org.id,
          name: "Application Confirmation",
          type: "CONFIRMATION",
          subject: "Application Received: {{jobTitle}}",
          body: `
            <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 16px;">Application Received!</h1>
            <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 16px;">
              Hi {{candidateName}},
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 16px;">
              Thank you for applying for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>. We've received your application and will review it shortly.
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 24px;">
              If your qualifications match our requirements, we'll reach out to schedule an initial conversation.
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0;">
              Best regards,<br>
              The {{companyName}} Team
            </p>
          `,
        },
      });
    } else {
      console.log(`Organization ${org.name} already has a confirmation template. Skipping.`);
    }
  }

  console.log("Backfill completed successfully.");
}

backfillTemplates()
  .catch((e) => {
    console.error("Error during backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

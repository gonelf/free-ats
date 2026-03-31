import { db } from "./src/lib/db";

async function test() {
  console.log("Checking environment variables...");
  console.log("SERPER_API_KEY:", process.env.SERPER_API_KEY ? "Present" : "Missing");
  console.log("CRON_SECRET:", process.env.CRON_SECRET ? "Present" : "Missing");
  
  try {
    console.log("Testing database connection...");
    const count = await db.outreachLead.count();
    console.log("Success! OutreachLead count:", count);
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    process.exit();
  }
}

test();

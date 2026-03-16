import { db } from "./src/lib/db";

async function main() {
  console.log("Checking db.feedback...");
  if (db.feedback) {
    console.log("db.feedback is defined");
    try {
      const feedbacks = await db.feedback.findMany();
      console.log("Feedbacks count:", feedbacks.length);
    } catch (e) {
      console.error("Error calling findMany:", e);
    }
  } else {
    console.error("db.feedback is UNDEFINED");
  }
}

main();

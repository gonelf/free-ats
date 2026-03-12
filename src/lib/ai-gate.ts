import { db } from "@/lib/db";

export class PaymentRequiredError extends Error {
  constructor() {
    super("Upgrade to Pro to use AI features");
    this.name = "PaymentRequiredError";
  }
}

export async function requireProPlan(orgId: string): Promise<void> {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { plan: true },
  });
  if (org.plan !== "PRO") {
    throw new PaymentRequiredError();
  }
}

import { db } from "@/lib/db";
import { FlagRollout } from "@prisma/client";

export const FLAGS = {
  JOB_DISTRIBUTION: "job_distribution",
} as const;

export type FlagKey = (typeof FLAGS)[keyof typeof FLAGS];

/**
 * Check whether a feature flag is enabled for the given context.
 * - DISABLED: always false
 * - ADMINS: only true for app admins (pass isAdmin: true)
 * - EVERYONE: always true
 *
 * Unknown flags default to false.
 */
export async function isFlagEnabled(key: FlagKey, isAdmin = false): Promise<boolean> {
  const flag = await db.featureFlag.findUnique({ where: { key } });
  if (!flag) return false;
  if (flag.rollout === FlagRollout.EVERYONE) return true;
  if (flag.rollout === FlagRollout.ADMINS) return isAdmin;
  return false;
}

/**
 * Seed default flags if they don't exist. Call this from admin setup or
 * a migration helper — not on every request.
 */
export async function seedDefaultFlags() {
  const defaults: Array<{ key: string; name: string; description: string }> = [
    {
      key: FLAGS.JOB_DISTRIBUTION,
      name: "Job Distribution",
      description:
        "Automatically distribute job postings to LinkedIn and expose an Indeed XML feed.",
    },
  ];

  for (const flag of defaults) {
    await db.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { ...flag, rollout: FlagRollout.DISABLED },
    });
  }
}

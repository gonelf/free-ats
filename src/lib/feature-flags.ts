import { db } from "@/lib/db";

export const FLAGS = {
  JOB_DISTRIBUTION: "job_distribution",
} as const;

export type FlagKey = (typeof FLAGS)[keyof typeof FLAGS];

/**
 * Check whether a feature flag is enabled. Returns false if the flag
 * doesn't exist yet (unknown flags are off by default).
 */
export async function isFlagEnabled(key: FlagKey): Promise<boolean> {
  const flag = await db.featureFlag.findUnique({ where: { key } });
  return flag?.enabled ?? false;
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
      create: { ...flag, enabled: false },
    });
  }
}

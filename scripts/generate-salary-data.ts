/**
 * KiteHR Salary Directory — Seed Script
 *
 * Generates salary data for all city × role combinations using:
 *   1. Gemini Flash (batch requests) as the primary source
 *   2. Category-based remote ratios from salary-data.ts
 *   3. Cost-of-living index adjustments per city
 *
 * Usage:
 *   npx tsx scripts/generate-salary-data.ts              # seed all cities
 *   npx tsx scripts/generate-salary-data.ts --city san-francisco
 *   npx tsx scripts/generate-salary-data.ts --tier 1     # seed tier-1 cities only
 *   npx tsx scripts/generate-salary-data.ts --dry-run    # preview without DB writes
 *
 * Prerequisites:
 *   - Run `npx prisma migrate dev --name add-salary-entry` first
 *   - GOOGLE_GENERATIVE_AI_API_KEY in .env
 *   - DATABASE_URL in .env
 *
 * Data sourcing transparency:
 *   Local salaries → Gemini calibrated to BLS/H-1B LCA benchmark ranges
 *   Remote salaries → local median × category ratio (salary-data.ts CATEGORY_REMOTE_RATIOS)
 *   Disclose on pages: "Data sourced from BLS OES, DOL H-1B LCA disclosures, and KiteHR market research"
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SALARY_CITIES,
  SALARY_ROLES,
  getCitiesByTier,
  calcRemoteSalary,
  calcSavings,
  type SalaryCity,
  type SalaryRole,
} from "../src/app/salaries/salary-data";

// Mirror src/lib/db.ts — wasm Prisma requires the pg adapter
const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
if (!rawUrl) {
  console.error("No database URL found. Set DATABASE_URL in your .env file.");
  process.exit(1);
}
const connectionString = rawUrl.replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const db = new PrismaClient({ adapter });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── CLI args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const cityFlag = args.find((_, i) => args[i - 1] === "--city");
const tierFlag = args.find((_, i) => args[i - 1] === "--tier");

// ─── Batch size & rate limiting ──────────────────────────────────
const BATCH_SIZE = 10; // roles per Gemini request
const BATCH_DELAY_MS = 2000; // 2 seconds between batches

interface GeminiBatchItem {
  roleSlug: string;
  localSalaryLow: number;
  localSalaryMedian: number;
  localSalaryHigh: number;
  demandLevel: "high" | "medium" | "low";
}

async function fetchSalariesFromGemini(
  city: SalaryCity,
  roles: SalaryRole[]
): Promise<GeminiBatchItem[]> {
  const roleList = roles
    .map((r) => `- ${r.slug}: ${r.title} (${r.category})`)
    .join("\n");

  const currencyLabel = city.currency === "GBP" ? "GBP (£)" : "USD ($)";
  const prompt = `You are a compensation data expert. Generate realistic annual salary ranges for the following roles in ${city.name}, ${city.state}, ${city.country === "UK" ? "UK" : "USA"}.

Use current market data (2025) calibrated to BLS OES and LinkedIn Salary data.
Currency: ${currencyLabel}
City cost-of-living index: ${city.costOfLivingIndex} (US average = 100)

Roles to price:
${roleList}

Return a JSON array. Each item must have:
- roleSlug (string, exactly as listed above)
- localSalaryLow (integer, annual ${currencyLabel}, P25 — entry/junior level)
- localSalaryMedian (integer, annual ${currencyLabel}, P50 — mid-level, most common)
- localSalaryHigh (integer, annual ${currencyLabel}, P75 — senior/lead level)
- demandLevel (string: "high" | "medium" | "low" — how hard is this role to fill locally)

Rules:
- Round all salaries to nearest 1000
- Salaries must reflect the ${city.name} market specifically (not a national average)
- High COL cities like SF/NYC should pay 30-50% more than national median
- Be realistic — don't inflate or deflate unreasonably

Respond with valid JSON array only.`;

  const result = await model.generateContent(
    `${prompt}\n\nRespond with valid JSON only, no markdown, no explanation.`
  );
  const text = result.response.text().trim();

  // Parse JSON, handle code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text;
  const objectMatch = jsonStr.match(/(\[[\s\S]*\])/);
  return JSON.parse(objectMatch ? objectMatch[1] : jsonStr) as GeminiBatchItem[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedCity(city: SalaryCity, roles: SalaryRole[]) {
  console.log(`\n🏙  Seeding ${city.name} (${roles.length} roles)...`);

  // In dry-run mode skip the DB check entirely — the table may not exist yet.
  let missingRoles = roles;
  if (!dryRun) {
    const existing = await db.salaryEntry.findMany({
      where: { citySlug: city.slug },
      select: { roleSlug: true },
    });
    const existingSlugs = new Set(existing.map((e) => e.roleSlug));
    missingRoles = roles.filter((r) => !existingSlugs.has(r.slug));

    if (missingRoles.length === 0) {
      console.log(`  ✓ All ${roles.length} roles already seeded — skipping`);
      return;
    }
    console.log(`  ${existing.length} existing, ${missingRoles.length} to generate`);
  } else {
    console.log(`  [DRY RUN] Will generate ${missingRoles.length} roles`);
  }

  // Process in batches
  for (let i = 0; i < missingRoles.length; i += BATCH_SIZE) {
    const batch = missingRoles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(missingRoles.length / BATCH_SIZE);
    console.log(`  Batch ${batchNum}/${totalBatches}: ${batch.map((r) => r.slug).join(", ")}`);

    let geminiData: GeminiBatchItem[] = [];
    try {
      geminiData = await fetchSalariesFromGemini(city, batch);
    } catch (err) {
      console.error(`  ✗ Gemini error for batch ${batchNum}:`, err);
      console.log("  Retrying in 5s...");
      await sleep(5000);
      try {
        geminiData = await fetchSalariesFromGemini(city, batch);
      } catch (retryErr) {
        console.error(`  ✗ Retry failed — skipping batch:`, retryErr);
        continue;
      }
    }

    // Build DB records for this batch
    const records = [];
    for (const item of geminiData) {
      const role = batch.find((r) => r.slug === item.roleSlug);
      if (!role) {
        console.warn(`  ⚠ Unexpected roleSlug from Gemini: ${item.roleSlug}`);
        continue;
      }

      const remote = calcRemoteSalary(item.localSalaryMedian, role.category);
      const { savingsPercent, annualSavings } = calcSavings(
        item.localSalaryMedian,
        remote.median
      );

      records.push({
        citySlug: city.slug,
        roleSlug: role.slug,
        cityName: city.name,
        stateName: city.state,
        country: city.country,
        roleName: role.title,
        category: role.category,
        localSalaryLow: item.localSalaryLow,
        localSalaryMedian: item.localSalaryMedian,
        localSalaryHigh: item.localSalaryHigh,
        remoteSalaryLow: remote.low,
        remoteSalaryMedian: remote.median,
        remoteSalaryHigh: remote.high,
        savingsPercent,
        annualSavings,
        currency: city.currency,
        dataYear: 2025,
        demandLevel: item.demandLevel ?? "medium",
        publishedAt: null, // Always null — cron sets this later
      });
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would upsert ${records.length} records`);
      records.slice(0, 2).forEach((r) =>
        console.log(
          `    ${r.roleSlug}: local $${r.localSalaryMedian} → remote $${r.remoteSalaryMedian} (save ${r.savingsPercent}%)`
        )
      );
    } else {
      // Upsert all records in this batch
      await db.$transaction(
        records.map((record) =>
          db.salaryEntry.upsert({
            where: {
              citySlug_roleSlug: {
                citySlug: record.citySlug,
                roleSlug: record.roleSlug,
              },
            },
            create: record,
            update: {
              localSalaryLow: record.localSalaryLow,
              localSalaryMedian: record.localSalaryMedian,
              localSalaryHigh: record.localSalaryHigh,
              remoteSalaryLow: record.remoteSalaryLow,
              remoteSalaryMedian: record.remoteSalaryMedian,
              remoteSalaryHigh: record.remoteSalaryHigh,
              savingsPercent: record.savingsPercent,
              annualSavings: record.annualSavings,
              demandLevel: record.demandLevel,
            },
          })
        )
      );
      console.log(`  ✓ Upserted ${records.length} records`);
    }

    // Rate limit — wait between batches (except the last one)
    if (i + BATCH_SIZE < missingRoles.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }
}

async function main() {
  console.log("🚀 KiteHR Salary Seed Script");
  console.log(`   Mode: ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);

  // Determine which cities to seed
  let citiesToSeed = SALARY_CITIES;
  if (cityFlag) {
    citiesToSeed = SALARY_CITIES.filter((c) => c.slug === cityFlag);
    if (citiesToSeed.length === 0) {
      console.error(`✗ City "${cityFlag}" not found in salary-data.ts`);
      process.exit(1);
    }
  } else if (tierFlag) {
    const tier = parseInt(tierFlag) as 1 | 2 | 3;
    citiesToSeed = getCitiesByTier(tier);
    console.log(`   Tier: ${tier} (${citiesToSeed.length} cities)`);
  }

  console.log(`   Cities: ${citiesToSeed.length}`);
  console.log(`   Roles: ${SALARY_ROLES.length}`);
  console.log(`   Total combinations: ${citiesToSeed.length * SALARY_ROLES.length}`);
  console.log(`   Batch size: ${BATCH_SIZE} roles/request, ${BATCH_DELAY_MS}ms delay\n`);

  for (const city of citiesToSeed) {
    await seedCity(city, SALARY_ROLES);
  }

  const count = await db.salaryEntry.count();
  console.log(`\n✅ Done. Total SalaryEntry rows in DB: ${count}`);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});

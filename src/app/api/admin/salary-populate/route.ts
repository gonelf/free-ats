import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SALARY_CITIES,
  SALARY_ROLES,
  getCitiesByTier,
  calcRemoteSalary,
  calcSavings,
  type SalaryCity,
  type SalaryRole,
} from "@/app/salaries/salary-data";

export const maxDuration = 300;

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 2000;

interface GeminiBatchItem {
  roleSlug: string;
  localSalaryLow: number;
  localSalaryMedian: number;
  localSalaryHigh: number;
  demandLevel: "high" | "medium" | "low";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSalariesFromGemini(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  city: SalaryCity,
  roles: SalaryRole[]
): Promise<GeminiBatchItem[]> {
  const roleList = roles.map((r) => `- ${r.slug}: ${r.title} (${r.category})`).join("\n");
  const currencyLabel = city.currency === "GBP" ? "GBP (£)" : "USD ($)";
  const prompt = `You are a compensation data expert. Generate realistic annual salary ranges for the following roles in ${city.name}, ${city.state}, ${city.country === "UK" ? "UK" : "USA"}.

Use current market data (2025) calibrated to BLS OES and LinkedIn Salary data.
Currency: ${currencyLabel}
City cost-of-living index: ${city.costOfLivingIndex} (US average = 100)

Roles to price:
${roleList}

Return a JSON array. Each item must have:
- roleSlug (string, exactly as listed above)
- localSalaryLow (integer, annual ${currencyLabel}, P25)
- localSalaryMedian (integer, annual ${currencyLabel}, P50)
- localSalaryHigh (integer, annual ${currencyLabel}, P75)
- demandLevel (string: "high" | "medium" | "low")

Rules:
- Round all salaries to nearest 1000
- Salaries must reflect the ${city.name} market specifically
- High COL cities like SF/NYC should pay 30-50% more than national median

Respond with valid JSON array only, no markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text;
  const objectMatch = jsonStr.match(/(\[[\s\S]*\])/);
  return JSON.parse(objectMatch ? objectMatch[1] : jsonStr) as GeminiBatchItem[];
}

function buildRecords(city: SalaryCity, batch: SalaryRole[], geminiData: GeminiBatchItem[]) {
  const records = [];
  for (const item of geminiData) {
    const role = batch.find((r) => r.slug === item.roleSlug);
    if (!role) continue;
    const remote = calcRemoteSalary(item.localSalaryMedian, role.category);
    const { savingsPercent, annualSavings } = calcSavings(item.localSalaryMedian, remote.median);
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
      publishedAt: null,
    });
  }
  return records;
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get("city");
  const tierParam = searchParams.get("tier");
  const dryRun = searchParams.get("dryRun") === "true";

  let citiesToSeed = SALARY_CITIES;
  if (cityParam && cityParam !== "all") {
    citiesToSeed = SALARY_CITIES.filter((c) => c.slug === cityParam);
    if (citiesToSeed.length === 0) {
      return new Response(`City "${cityParam}" not found`, { status: 400 });
    }
  } else if (tierParam && tierParam !== "all") {
    citiesToSeed = getCitiesByTier(parseInt(tierParam) as 1 | 2 | 3);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(msg: string) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ msg })}\n\n`));
      }

      try {
        send(`Mode: ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
        send(`Cities: ${citiesToSeed.length} | Roles: ${SALARY_ROLES.length} | Total: ${citiesToSeed.length * SALARY_ROLES.length} combinations`);

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let totalUpserted = 0;

        for (const city of citiesToSeed) {
          send(`\n--- ${city.name} (Tier ${city.tier}) ---`);

          let missingRoles = SALARY_ROLES;
          if (!dryRun) {
            const existing = await db.salaryEntry.findMany({
              where: { citySlug: city.slug },
              select: { roleSlug: true },
            });
            const existingSlugs = new Set(existing.map((e) => e.roleSlug));
            missingRoles = SALARY_ROLES.filter((r) => !existingSlugs.has(r.slug));
            if (missingRoles.length === 0) {
              send(`  ✓ All ${SALARY_ROLES.length} roles already seeded — skipping`);
              continue;
            }
            send(`  ${existing.length} existing, ${missingRoles.length} to generate`);
          }

          for (let i = 0; i < missingRoles.length; i += BATCH_SIZE) {
            const batch = missingRoles.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(missingRoles.length / BATCH_SIZE);
            send(`  Batch ${batchNum}/${totalBatches}: fetching from Gemini...`);

            let geminiData: GeminiBatchItem[] = [];
            try {
              geminiData = await fetchSalariesFromGemini(model, city, batch);
            } catch (err) {
              send(`  ✗ Gemini error: ${String(err)}. Retrying in 5s...`);
              await sleep(5000);
              try {
                geminiData = await fetchSalariesFromGemini(model, city, batch);
              } catch {
                send(`  ✗ Retry failed — skipping batch`);
                continue;
              }
            }

            const records = buildRecords(city, batch, geminiData);

            if (dryRun) {
              send(`  [DRY RUN] Would upsert ${records.length} records`);
              if (records[0]) {
                send(`  Sample: ${records[0].roleSlug} → local $${records[0].localSalaryMedian} / remote $${records[0].remoteSalaryMedian}`);
              }
            } else {
              await db.$transaction(
                records.map((record) =>
                  db.salaryEntry.upsert({
                    where: {
                      citySlug_roleSlug: { citySlug: record.citySlug, roleSlug: record.roleSlug },
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
              totalUpserted += records.length;
              send(`  ✓ Upserted ${records.length} records`);
            }

            if (i + BATCH_SIZE < missingRoles.length) {
              await sleep(BATCH_DELAY_MS);
            }
          }
        }

        const totalInDb = dryRun ? null : await db.salaryEntry.count();
        send(`\n✅ Done! Upserted ${totalUpserted} entries.${totalInDb !== null ? ` Total in DB: ${totalInDb}` : ""}`);
        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({ totalUpserted, totalInDb })}\n\n`
          )
        );
      } catch (err) {
        send(`\n✗ Fatal error: ${String(err)}`);
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

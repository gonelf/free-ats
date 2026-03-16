import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Strip ?pgbouncer=true — it's a Prisma CLI hint only, not a valid pg startup param.
// Passing it through causes PostgreSQL to reject the connection (auth failure / circuit breaker).
// Using URL API to correctly handle cases where pgbouncer=true is not the last query param
// (e.g. ?pgbouncer=true&sslmode=require → naive regex leaves &sslmode=require without a leading ?).
function stripPgbouncerParam(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.delete("pgbouncer");
    return parsed.toString();
  } catch {
    // Fallback for URLs that can't be parsed by the URL API
    return rawUrl
      .replace(/([?&])pgbouncer=true(&?)/gi, (_, prefix, suffix) =>
        prefix === "?" && suffix ? "?" : ""
      )
      .replace(/\?$/, "");
  }
}

function createPrismaClient(): PrismaClient {
  const connectionString = stripPgbouncerParam(process.env.DATABASE_URL ?? "");
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Store singleton globally in all environments to prevent multiple Pool instances
// (previously only stored in non-production, causing a new Pool per module load in prod)
globalForPrisma.prisma = db;

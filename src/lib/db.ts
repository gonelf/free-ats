import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel's Supabase integration sets POSTGRES_URL; manual setup uses DATABASE_URL.
// Strip ?pgbouncer=true — it's a Prisma CLI hint only, not a valid pg startup param.
const rawUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";
if (!rawUrl) {
  throw new Error(
    "No database URL found. Set DATABASE_URL (or POSTGRES_URL) in your environment."
  );
}
const connectionString = rawUrl.replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}


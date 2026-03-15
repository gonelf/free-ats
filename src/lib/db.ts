import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Strip ?pgbouncer=true — it's a Prisma CLI hint only, not a valid pg startup param.
// Passing it through causes PostgreSQL to reject the connection (auth failure / circuit breaker).
const rawUrl = process.env.DATABASE_URL ?? "";
const connectionString = rawUrl.replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

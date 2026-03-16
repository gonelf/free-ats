import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations to bypass pgBouncer.
    // Fall back through all known Vercel/Supabase env var names.
    url:
      process.env["DIRECT_URL"] ||
      process.env["POSTGRES_URL_NON_POOLING"] ||
      process.env["DATABASE_URL"] ||
      process.env["POSTGRES_URL"] ||
      "",
  },
});

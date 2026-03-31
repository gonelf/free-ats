import { createHash } from "crypto";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export function sha256hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function getExtensionMember(
  request: NextRequest
): Promise<{ organizationId: string; userId: string } | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const raw = auth.slice(7);
  if (!raw) return null;

  const hash = sha256hex(raw);
  const token = await db.extensionToken.findUnique({ where: { tokenHash: hash } });
  if (!token) return null;

  // fire-and-forget lastUsedAt update
  db.extensionToken
    .update({ where: { id: token.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return { organizationId: token.organizationId, userId: token.userId };
}

export const EXTENSION_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

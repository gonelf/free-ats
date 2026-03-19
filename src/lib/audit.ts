import { db } from "@/lib/db";

type LogAuditParams = {
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  metadata?: Record<string, string | number | boolean | null>;
  orgId?: string;
};

export async function logAudit(params: LogAuditParams) {
  await db.auditLog.create({ data: params });
}

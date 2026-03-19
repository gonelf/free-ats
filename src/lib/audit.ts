import { db } from "@/lib/db";

type LogAuditParams = {
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  orgId?: string;
};

export async function logAudit(params: LogAuditParams) {
  await db.auditLog.create({ data: params });
}

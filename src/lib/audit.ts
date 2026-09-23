import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// AuditLog has existed in the schema since Aug 13 but nothing ever wrote to
// it — this is the first real write path, added alongside Sprint 6's admin
// review actions (payment verification, safety review clearance, parent-link
// verification). One call per admin write action; never blocks the action
// it's logging (a logging failure shouldn't undo a real approval), so
// callers fire this after their own write succeeds and don't await-fail on it.
export async function logAdminAction(
  actorUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: { actorUserId, action, targetType, targetId, metadata: metadata as Prisma.InputJsonValue | undefined },
  });
}

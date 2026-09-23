-- A reject on the admin parent-links queue used to delete the StudentParent
-- row outright, which meant the queue could show a pending list but never a
-- rejected history (there was nothing left to query). This adds the same
-- reviewed/rejected shape Payment already has, so a reject is a normal
-- status change instead of a deletion.
ALTER TABLE "StudentParent" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "StudentParent" ADD COLUMN "rejectedByAdminId" TEXT;
ALTER TABLE "StudentParent" ADD COLUMN "rejectionReason" TEXT;

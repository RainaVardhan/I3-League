-- Sprint 3: Participant Registration / Team joining / manual Payment contact info.
-- Hand-written, not `prisma migrate dev --create-only` generated: the shadow database
-- used to diff migrations doesn't have the `auth` schema referenced by the two trigger
-- migrations before this one, so `--create-only` fails with P3006 on replay. Same
-- workaround as the Aug 16 trigger-hardening migrations — write the SQL by hand, apply
-- with `prisma migrate deploy` (no shadow db involved).

-- Student.guardianEmail: required going forward, but existing seeded rows need a value
-- first — add with a temporary default, backfill, then drop the default so the Prisma
-- schema (no @default) matches reality for new rows.
ALTER TABLE "Student" ADD COLUMN "guardianEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Student" ALTER COLUMN "guardianEmail" DROP DEFAULT;

-- Team.joinCode: required + unique going forward. Backfill existing teams with a random
-- 6-character code before enforcing NOT NULL/UNIQUE.
ALTER TABLE "Team" ADD COLUMN "joinCode" TEXT;
UPDATE "Team" SET "joinCode" = UPPER(SUBSTRING(MD5(id || clock_timestamp()::text) FOR 6));
ALTER TABLE "Team" ALTER COLUMN "joinCode" SET NOT NULL;
CREATE UNIQUE INDEX "Team_joinCode_key" ON "Team"("joinCode");

-- Season static manual-payment contact info — nullable, admin-configurable later.
ALTER TABLE "Season" ADD COLUMN "paypalLink" TEXT;
ALTER TABLE "Season" ADD COLUMN "venmoHandle" TEXT;
ALTER TABLE "Season" ADD COLUMN "zelleInfo" TEXT;

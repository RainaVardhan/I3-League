-- Security fix: StudentParent links were previously granted purely on a
-- self-reported email string match, with no independent check that the
-- matched Parent account actually belongs to the student's real guardian —
-- a student could register a second "parent" account with an email they
-- also control and self-approve their own required consent. See the
-- StudentParent model comment in schema.prisma for the full threat model.
--
-- Adds a nullable verifiedAt/verifiedByAdminId pair, same pattern as
-- Payment's existing verification fields. Existing rows land as NULL
-- (pending) by default — correct: any pre-existing link in a real
-- database was formed under the old, unverified logic and should not be
-- silently grandfathered in as verified.
--
-- Hand-written, not `prisma migrate dev --create-only` generated — same
-- P3006 shadow-database issue as every migration after
-- 20260815071853_add_auth_user_sync_trigger (the shadow DB has no `auth`
-- schema to replay that migration against). Apply with `prisma migrate
-- deploy`, not `migrate dev`.

ALTER TABLE "StudentParent" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "StudentParent" ADD COLUMN "verifiedByAdminId" TEXT;

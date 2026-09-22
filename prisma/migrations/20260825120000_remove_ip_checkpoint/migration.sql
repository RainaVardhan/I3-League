-- Remove the IP Checkpoint gate (site owner decision, Aug 25 2026 — see
-- CLAUDE.md). Projects stay CONFIDENTIAL-only from now on: there is no
-- remaining flow that ever sets PUBLIC, so Project.visibility keeps its
-- CONFIDENTIAL default as a fail-safe, but the audit columns that existed
-- only to prove a student explicitly requested PUBLIC at the checkpoint
-- (visibilitySetAt/visibilitySetByStudent) and the never-wired IPReview
-- Phase-2 stub are dropped along with the stage itself.
--
-- Hand-written, not `prisma migrate dev`-generated: this repo's shadow
-- database can't replay the earlier auth.* trigger migrations (no `auth`
-- schema there), so `migrate dev --create-only` P3006s on any migration.
-- Apply with `prisma migrate deploy`, same as every other migration since
-- Aug 15 — see CLAUDE.md status log.

-- 1. Drop rows that reference the stage before narrowing the enum (Postgres
--    enum values can't be dropped while any row still uses them). Both
--    tables' rows here are seed/dev data only — IP_CHECKPOINT never had a
--    real Submission, since no UI was ever built for it.
DELETE FROM "StageProgress" WHERE "stageName" = 'IP_CHECKPOINT';
DELETE FROM "CurriculumModule" WHERE "stageName" = 'IP_CHECKPOINT';

-- 2. Drop the IPReview table (Phase-2 stub, never wired to any UI or app code).
DROP TABLE IF EXISTS "IPReview";

-- 3. Drop the visibility-audit columns on Project. Project.visibility itself
--    is untouched and keeps its CONFIDENTIAL default.
ALTER TABLE "Project" DROP COLUMN "visibilitySetAt";
ALTER TABLE "Project" DROP COLUMN "visibilitySetByStudent";

-- 4. Narrow the StageName enum — Postgres can't drop an enum value directly,
--    so recreate the type without IP_CHECKPOINT and swap every column over.
ALTER TYPE "StageName" RENAME TO "StageName_old";
CREATE TYPE "StageName" AS ENUM ('INSIGHT', 'INVESTIGATE', 'IMAGINE', 'ITERATE', 'IMPACT', 'INFLUENCE');
ALTER TABLE "CurriculumModule" ALTER COLUMN "stageName" TYPE "StageName" USING ("stageName"::text::"StageName");
ALTER TABLE "StageProgress" ALTER COLUMN "stageName" TYPE "StageName" USING ("stageName"::text::"StageName");
ALTER TABLE "Submission" ALTER COLUMN "stageName" TYPE "StageName" USING ("stageName"::text::"StageName");
DROP TYPE "StageName_old";

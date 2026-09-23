-- Evidence/result of a team contribution: what was found, produced, or
-- observed. Nullable: a contribution can be logged before there's a result
-- yet, and existing rows have no value to backfill.
ALTER TABLE "TeamContribution" ADD COLUMN "result" TEXT;

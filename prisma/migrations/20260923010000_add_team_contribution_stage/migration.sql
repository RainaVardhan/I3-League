-- Which of the six stages a team contribution is about. Nullable: a
-- contribution can stay untagged, and existing rows have no value to
-- backfill. Same pattern as JournalEntry.stage.
ALTER TABLE "TeamContribution" ADD COLUMN "stage" "StageName";

-- Which of the six stages a journal entry is about. Nullable: an entry can
-- stay untagged, and existing rows have no value to backfill.
ALTER TABLE "JournalEntry" ADD COLUMN "stage" "StageName";

-- Optional, student-written entry title on the Innovation Journal.
-- Nullable, no backfill needed (an entry with no title is valid, same as
-- an entry with no text as long as it has a photo).
ALTER TABLE "JournalEntry" ADD COLUMN "title" TEXT;

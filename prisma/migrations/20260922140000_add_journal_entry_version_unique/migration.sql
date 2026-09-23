-- Prevents two rows of the same journal entry from ever landing on the same
-- version number (a double-click or a second tab both revising the same
-- entry at once could otherwise read the same "current max version" and
-- both insert version + 1). reviseJournalEntryAction retries once on the
-- resulting unique-violation with a freshly read version, rather than
-- surfacing it as an error.
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_entryGroupId_version_key" UNIQUE ("entryGroupId", "version");

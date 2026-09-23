-- Team names must be unique per season, case-insensitively. Prisma's
-- @@unique is case-sensitive and can't express a functional index, so this
-- is hand-written directly (see the Team model comment in schema.prisma) —
-- same fail-safe pattern as Project's exactly-one-owner CHECK constraint.
-- Re-add this by hand if a migration is ever reset/regenerated.
CREATE UNIQUE INDEX "team_name_season_unique_ci" ON "Team" (lower(name), "seasonId");

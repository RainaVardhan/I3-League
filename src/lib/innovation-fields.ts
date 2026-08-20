// The fixed list of innovation fields a student can pick as interests at
// registration. Kept in one place because Project.category (Sprint 5) will
// read from this same list — a student's stated interests and the category
// they eventually file a project under should stay in sync, not be two
// independently-typed free-text lists.
export const INNOVATION_FIELDS = [
  "Technology",
  "Environment",
  "Healthcare",
  "Education",
  "Business",
  "Arts & Design",
  "Community & Social Impact",
  "Science",
  "Other",
] as const;

export type InnovationField = (typeof INNOVATION_FIELDS)[number];

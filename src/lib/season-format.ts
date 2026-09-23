// Browser-safe date formatting for Season values (no database code). Client
// components import from here; src/lib/season.ts re-exports it.

export function formatSeasonDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Month + year only, no day — for the homepage FinalCta's eyebrow
// ("ENROLLMENT OPENS SEPTEMBER 2026"), which never needed day-level
// precision even before it read from Season.
export function formatSeasonMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

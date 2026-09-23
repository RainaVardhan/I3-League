// Shared between the Season settings form's server action (which builds the
// diff a save writes to AuditLog) and the Season page (which renders that
// history back) — one field-key -> label map and one value formatter, so
// the two can't drift into showing different names for the same field.
export type SeasonFieldKey =
  | "springQualifyDeadline"
  | "summerQualifyDeadline"
  | "nationalFinalsDate"
  | "perParticipantPriceUsd"
  | "maxTeamSize"
  | "curriculumVersion"
  | "paypalLink"
  | "venmoHandle"
  | "zelleInfo";

export const SEASON_FIELD_LABELS: Record<SeasonFieldKey, string> = {
  springQualifyDeadline: "Spring qualification deadline",
  summerQualifyDeadline: "Summer qualification deadline",
  nationalFinalsDate: "National Finals date",
  perParticipantPriceUsd: "Price per participant",
  maxTeamSize: "Max team size",
  curriculumVersion: "Curriculum version",
  paypalLink: "PayPal.me link",
  venmoHandle: "Venmo handle",
  zelleInfo: "Zelle info",
};

const DATE_FIELDS = new Set<SeasonFieldKey>(["springQualifyDeadline", "summerQualifyDeadline", "nationalFinalsDate"]);

export type SeasonFieldValue = string | number | null;

export function formatSeasonHistoryValue(field: SeasonFieldKey, value: SeasonFieldValue): string {
  if (value === null || value === "") return "(empty)";
  if (DATE_FIELDS.has(field)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
      date,
    );
  }
  if (field === "perParticipantPriceUsd") return `$${value}`;
  return String(value);
}

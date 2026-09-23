// The exact category list from CLAUDE.md "Safety screening": any checked
// box (or non-empty "other") sets the project to high-risk / PENDING_REVIEW.
// Lives in a plain lib module (not the "use client" SafetyScreeningForm)
// because a server component importing a named export from a "use client"
// module gets a broken client-reference proxy for anything that isn't a
// component — SAFETY_ITEMS.filter() threw "not a function" at runtime when
// the admin safety-review queue (a server component) tried to import it
// straight from the form.
export const SAFETY_ITEMS = [
  { key: "humans", label: "Involves other people (surveys, interviews, testing on them)" },
  { key: "animals", label: "Involves animals" },
  { key: "healthInfo", label: "Involves health information" },
  { key: "chemicals", label: "Involves chemicals" },
  { key: "biologicalMaterials", label: "Involves biological materials" },
  { key: "electricity", label: "Involves electricity above a low-voltage battery" },
  { key: "machinery", label: "Involves machinery or power tools" },
  { key: "pii", label: "Involves other people's personal data" },
  { key: "environmentalSampling", label: "Involves environmental sampling (water, soil, air)" },
  { key: "drones", label: "Involves drones" },
  { key: "ai", label: "Involves AI making decisions about people" },
] as const;

export type SafetyItemKey = (typeof SAFETY_ITEMS)[number]["key"];

// The form field name for a flagged category's required detail box, e.g.
// "humans" -> "humansDetail". One place so the form, the server action, and
// the admin detail page all agree on the naming convention.
export function safetyDetailKey(key: SafetyItemKey) {
  return `${key}Detail` as const;
}

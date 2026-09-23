// Normalizes free-typed place names (school names, cities, states,
// countries) to Title Case wherever they're written — registration
// (src/app/register/actions.ts) and the admin "add a school" form
// (src/app/admin/schools/actions.ts) both call this before saving, so a
// school or address is stored the same way regardless of how an admin or
// student happened to type it (all caps, all lowercase, "nEw YoRk", ...).
//
// Not a real address/geocoding lookup (CLAUDE.md tech stack has none wired
// in) — just casing: the first letter of every word capitalized, the rest
// lowercased, the same plain definition any word processor's "Capitalize
// Each Word" uses. Deliberately no special-casing for short all-caps words
// ("USA" -> "Usa", "NY" -> "Ny") — an earlier version tried to preserve
// those as likely abbreviations, but the same rule then also preserved an
// accidentally-caps-locked ordinary word ("OF" typed as "OF" stayed "OF"
// instead of becoming "Of"), which is a worse, less predictable outcome
// than a real abbreviation losing its stylized casing.
export function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map(titleCaseWord)
    .join(" ");
}

function titleCaseWord(word: string): string {
  // Hyphens and apostrophes start a new capitalized segment (Mary-Jane,
  // O'Brien) rather than being swallowed into the previous word's casing.
  return word
    .split(/([-'])/)
    .map((part) => (part === "-" || part === "'" ? part : capitalize(part)))
    .join("");
}

function capitalize(part: string): string {
  if (!part) return part;
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

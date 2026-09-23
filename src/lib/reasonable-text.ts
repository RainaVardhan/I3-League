// Sanity checks for registration free-text fields (names, cities, schools).
// There's no geocoding/school-directory API wired into this project
// (deliberately — see CLAUDE.md tech stack, solo 2-week MVP, no paid API
// dependency), so this approximates "is this a real answer" with format and
// plausibility checks rather than a true lookup: reasonable length, real
// letters, no keyboard-mash/repeated-character garbage. It will not catch a
// confident fake ("Springfield High School" when no such school exists) —
// only obvious junk ("a", "asdf", "1111"). Revisit with a real address/school
// API if that gap matters later.

const NAME_PATTERN = /^[A-Za-z][A-Za-z'\-. ]*$/;
const PLACE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9'\-.,& ]*$/;

// No real person's name or place name is anywhere near this long — these
// exist purely to reject a pasted wall of text (or a direct POST) before it
// reaches the database, not to second-guess a long-but-real name. Exported
// so the forms can set a matching HTML maxLength.
export const NAME_MAX_LENGTH = 100;
export const PLACE_MAX_LENGTH = 150;

function isRepeatedCharacterOnly(value: string): boolean {
  const stripped = value.replace(/[\s.,'&-]/g, "");
  // A single real character (e.g. a one-letter last name) isn't "repeated"
  // garbage — only flag two or more of the same character in a row.
  if (stripped.length <= 1) return false;
  return /^(.)\1*$/.test(stripped);
}

/** A person's first/last name: letters (plus common name punctuation) only,
 *  not just one letter repeated. `minLength` defaults to 2, but a single
 *  letter is a real last name in some cultures/legal names, so callers for
 *  those fields can pass 1. */
export function isReasonableName(value: string, minLength = 2): boolean {
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > NAME_MAX_LENGTH) return false;
  if (!NAME_PATTERN.test(trimmed)) return false;
  if (isRepeatedCharacterOnly(trimmed)) return false;
  return true;
}

/** A city, state, or school name: letters/numbers plus common place
 *  punctuation, at least `minLength` characters, contains a real letter. */
export function isReasonablePlace(value: string, minLength = 2): boolean {
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > PLACE_MAX_LENGTH) return false;
  if (!PLACE_PATTERN.test(trimmed)) return false;
  if (!/[A-Za-z]/.test(trimmed)) return false;
  if (isRepeatedCharacterOnly(trimmed)) return false;
  return true;
}

// Grade-related helpers for the registration form. Student.grade stays a
// free-text field on the schema (other code, e.g. isHighSchoolGrade in
// investigate-requirements.ts, already parses whatever's in it), but the
// registration form itself is where a bad value first gets typed, so it's
// validated tightly right here: a plain integer for the program's actual
// range (middle school 6-8, high school 9-12 — see CLAUDE.md).
export const MIN_GRADE = 6;
export const MAX_GRADE = 12;

export function parseGradeNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (n < MIN_GRADE || n > MAX_GRADE) return null;
  return n;
}

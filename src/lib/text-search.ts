// Shared client-side "fuzzy enough" search used by every small, personal
// dataset list on the dashboard (the Innovation Journal's timeline, the
// Team Contribution log) — a student's own entries or a team's own log are
// small enough that filtering happens instantly against the full list the
// server already fetched, no round trip needed. Originally built inline in
// JournalList.tsx; pulled out here once a second list (ContributionList)
// needed the exact same matching behavior, rather than keeping two copies
// of the same algorithm in sync by hand.

// A light stem, not a real one: strips a trailing "s"/"es" so "observations"
// matches a search for "observation" and vice versa. Cheap and safe (no
// library, no false "related" matches from real stemming rules like
// -ing/-ed), just enough to stop a plural/singular mismatch from reading as
// "the search doesn't work."
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

// Classic edit-distance: how many single-character insert/delete/swap steps
// turn `a` into `b`. Used below to tolerate a typo or near-miss spelling,
// not just an exact substring.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
}

// How many edits a word is allowed to be off by and still count as a match
// — tighter for short words (a 1-letter slip on a 3-letter word changes its
// meaning) and looser for longer ones (a typo in a long word is still
// obviously "that word").
function typoBudget(word: string): number {
  if (word.length <= 4) return 1;
  if (word.length <= 8) return 2;
  return 3;
}

/** Lowercases and splits a haystack string into its individual words, for
 *  the per-word typo-tolerant fallback in matchesQuery below. */
export function toSearchWords(haystack: string): string[] {
  return haystack.split(/[^a-z0-9]+/).filter(Boolean);
}

// For each query word: first try a fast exact/stemmed substring check
// against the whole haystack (so multi-word queries match regardless of
// word order — "cause root" matches "root cause"); if that fails, fall back
// to comparing it against every real word in the haystack by edit distance,
// so a typo or a near-spelling ("cafateria" for "cafeteria") still finds a
// match.
export function matchesQuery(haystack: string, haystackWords: string[], query: string): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((token) => {
    if (haystack.includes(token) || haystack.includes(stem(token))) return true;
    const budget = typoBudget(token);
    const stemmed = stem(token);
    return haystackWords.some((word) => levenshtein(token, word) <= budget || levenshtein(stemmed, word) <= budget);
  });
}

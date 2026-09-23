// Content-moderation gate for free-text fields students type into shared or
// reviewer-visible surfaces: Team Contribution entries (visible to every
// teammate), Innovation Journal entries (a student's own record, but still
// real student-authored text worth holding to the same bar), and every
// stage submission field (Insight/Investigate/the guided stages, seen by an
// admin reviewer). i3League serves middle/high schoolers, so this exists to
// keep that content appropriate without a human moderator in the loop.
//
// A blunt, maintainable word-list filter, not an ML/API-based classifier —
// right-sized for a solo MVP, same "good enough for now, one file to swap
// later" spirit as src/lib/rate-limit.ts's in-memory bucket. It only ever
// matches a WHOLE word (after normalizing common leetspeak substitutions and
// collapsing repeated letters), never a substring, so it can't fire on
// words like "class", "assessment", "scrap", or "assistant" that happen to
// contain a blocked word inside them. It also can't catch every bypass (a
// word split across separators like "f u c k" won't match) — that's a known
// limitation of a word-list filter, not something to chase further without
// real evidence it's being exploited.

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i",
};

// A moderate, non-exhaustive list of profanity and slurs inappropriate for
// a K-12 platform. No word list catches everything — this stops the
// obvious, common cases rather than aiming for exhaustive coverage.
const BLOCKED_WORDS = [
  "fuck", "fucking", "fucker", "motherfucker",
  "shit", "bullshit", "shitty",
  "ass", "asshole", "asswipe",
  "bitch", "bitchy",
  "bastard",
  "dick", "dickhead",
  "piss", "pissed",
  "cock", "cocksucker",
  "pussy",
  "cunt",
  "slut", "whore",
  "fag", "faggot",
  "retard", "retarded",
  "nigger", "nigga",
  "spic", "chink", "kike", "tranny",
  "rape", "rapist",
] as const;

// Normalizes a single token for matching: lowercase, leetspeak substitutions
// mapped back to letters, then any run of 3+ identical characters collapsed
// to 1 ("fuuuck" -> "fuck", "shiiiit" -> "shit") — elongated typing is
// generally 3+ repeats, not just a doubled letter. Threshold is 3+, not 2+:
// collapsing an ordinary doubled letter (2 repeats) breaks real blocked
// words that themselves contain one, e.g. "ass" -> "as" once collapsed,
// which is a common English word — every legitimate use of "as" was
// silently flagging as inappropriate language until this was caught.
// Applied identically to both the blocked-word list (once, at module load)
// and every token pulled out of a student's submitted text, so the two stay
// comparable.
function normalizeToken(token: string): string {
  let mapped = "";
  for (const ch of token.toLowerCase()) mapped += LEET_MAP[ch] ?? ch;
  return mapped.replace(/(.)\1{2,}/g, "$1");
}

const NORMALIZED_BLOCKED = new Set(BLOCKED_WORDS.map(normalizeToken));

/**
 * True if `text` contains a blocked word as a whole token. Never matches a
 * substring inside an unrelated word (see file comment).
 */
export function containsInappropriateLanguage(text: string): boolean {
  if (!text) return false;
  const tokens = text.toLowerCase().match(/[a-z0-9@$!]+/g) ?? [];
  return tokens.some((token) => NORMALIZED_BLOCKED.has(normalizeToken(token)));
}

export const INAPPROPRIATE_LANGUAGE_ERROR =
  "Please remove inappropriate language before saving.";

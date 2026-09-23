// A minimal in-memory rate limiter — a fixed window per key, held in module
// state for the lifetime of this server process. Deliberately not backed by
// Redis/Upstash: this is a solo 2-week MVP running on a single Next.js
// process (see CLAUDE.md — Cloudflare Workers deployment, where in-memory
// state wouldn't survive across isolates, is explicitly deferred), so this
// is the same kind of stopgap as storage.ts's local-disk file uploads:
// correct for now, and every call site should go through this function so
// swapping in a real shared store later is a one-file change.
//
// Not a defense against a truly determined attacker (a restart clears it,
// and it doesn't coordinate across processes) — it exists to stop a script
// or a stuck retry loop from hammering a write action, not to replace the
// real validation each action already does.
const buckets = new Map<string, number[]>();

/**
 * Returns true if `key` is still within `limit` calls per `windowMs`,
 * recording this call. Returns false (and does NOT record the call) once
 * the key is over its limit for the current window.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);
  return true;
}

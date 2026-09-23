import { getCloudflareContext } from "@opennextjs/cloudflare";

// Rate limiter with two backends, chosen automatically:
//
// 1. On Cloudflare: the Workers Rate Limiting binding named by `binding`
//    (declared in wrangler.jsonc). It is shared across every instance of the
//    Worker, so it actually holds. Its limit and window (10 or 60 seconds) are
//    fixed in wrangler.jsonc; the `limit`/`windowMs` arguments below are only
//    used by the fallback, and should match what wrangler.jsonc says.
// 2. Everywhere else (local development): an in-memory fixed window per key.
//    Per process only, so it is a stopgap for local use, not a defense.
//
// If a binding is missing on Cloudflare, we fall back to the in-memory limiter
// rather than failing open with no limit at all.
type RateLimitBinding = { limit(options: { key: string }): Promise<{ success: boolean }> };

const buckets = new Map<string, number[]>();

function checkInMemory(key: string, limit: number, windowMs: number): boolean {
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

function findBinding(name: string): RateLimitBinding | null {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, RateLimitBinding | undefined>;
    return env[name] ?? null;
  } catch {
    return null; // not running on Cloudflare
  }
}

/**
 * Returns true if `key` is still within its limit, recording this call.
 * Returns false once the key is over its limit for the current window.
 */
export async function checkRateLimit(
  binding: string,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const limiter = findBinding(binding);
  if (limiter) {
    const { success } = await limiter.limit({ key });
    return success;
  }
  return checkInMemory(`${binding}:${key}`, limit, windowMs);
}

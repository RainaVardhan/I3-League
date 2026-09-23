import { PrismaClient } from "@prisma/client";
// The default entry point loads Prisma's query engine from disk, which Workers
// do not have. This entry point loads it as a WebAssembly module instead.
import { PrismaClient as WorkersPrismaClient } from ".prisma/client/wasm";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// The rest of the app just does `import { prisma } from "@/lib/prisma"`. Two
// very different runtimes sit behind that one export:
//
// 1. Node (local dev, `next build`): ONE shared client, reused across
//    hot-reloads. Without that, every reload opens a brand-new pool of
//    Postgres connections against the pooled DATABASE_URL and exhausts
//    Supabase's PgBouncer limit after a few file saves.
//
// 2. Cloudflare Workers (the live site): a database connection is an I/O
//    object that belongs to the single request that opened it. Reusing one
//    client across requests fails with "Cannot perform I/O on behalf of a
//    different request". So each request gets its own client, kept in a
//    WeakMap keyed by that request's execution context (the entry is freed
//    when the request ends).
//
// The client talks to Postgres through a driver adapter (schema.prisma sets
// engineType = "client"), because Workers cannot load Prisma's native engine.

// On Workers, read the connection string from the Worker's own bindings (what
// you set under Settings > Variables and Secrets), and only then from
// process.env, which is what local development uses.
export function databaseUrl(): string | undefined {
  try {
    const bound = (getCloudflareContext().env as unknown as Record<string, unknown>).DATABASE_URL;
    if (typeof bound === "string" && bound) return bound;
  } catch {
    // not running on Cloudflare
  }
  return process.env.DATABASE_URL || undefined;
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: databaseUrl(),
    // A request only ever needs a few connections at once; keep it small so a
    // burst of visitors cannot exhaust Supabase's pooler.
    max: 3,
  });
  const Client = isWorkers() ? (WorkersPrismaClient as unknown as typeof PrismaClient) : PrismaClient;
  return new Client({ adapter });
}

function isWorkers(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const perRequest = new WeakMap<object, PrismaClient>();

function currentClient(): PrismaClient {
  if (isWorkers()) {
    const { ctx } = getCloudflareContext();
    let client = perRequest.get(ctx);
    if (!client) {
      client = createClient();
      perRequest.set(ctx, client);
    }
    return client;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

// A Proxy so existing call sites (`prisma.user.findMany(...)`,
// `prisma.$transaction(...)`, `prisma.$queryRaw`...) keep working unchanged:
// every property access is forwarded to the client for the current request.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = currentClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

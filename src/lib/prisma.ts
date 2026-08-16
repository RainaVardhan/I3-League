import { PrismaClient } from "@prisma/client";

// Without this, every hot-reload in dev creates a brand-new PrismaClient
// (and a brand-new pool of Postgres connections against the pooled
// DATABASE_URL) instead of reusing one — that exhausts Supabase's PgBouncer
// connection limit after a handful of file saves. Reuse a client stashed on
// `globalThis` across reloads; only cache it outside production so a real
// deployment always gets a fresh client per instance.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

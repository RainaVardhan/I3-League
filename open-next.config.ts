import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default OpenNext-for-Cloudflare settings. Caching (ISR) is not configured
// on purpose: every page that reads the database is rendered on demand, so
// season dates, prices and approvals are never frozen at build time.
export default defineCloudflareConfig({});

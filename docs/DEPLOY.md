# Deploying to Cloudflare

Two sites from one repository:

| | Public site | Testing site |
|---|---|---|
| Git branch | `main` | `testing` |
| Worker name | `i3league` | `i3league-testing` |
| Deploy command | `npm run deploy` | `npm run deploy:testing` |
| Supabase project | live | testing |
| R2 bucket | `i3league-uploads` | `i3league-uploads-testing` |
| `PLATFORM_OPEN` | not set | `true` |
| Who can see it | everyone (public pages) | only people allowed by Cloudflare Access |

Configuration lives in `wrangler.jsonc` (both Workers) and `open-next.config.ts`.

## One-time setup in the Cloudflare dashboard

1. **Domain.** Add your domain(s) to Cloudflare (Websites > Add a site) and switch
   the nameservers at your registrar to the two Cloudflare gives you.
2. **Workers Paid plan** ($5/month). The site's compressed bundle is about 3.6 MB
   and the free plan's limit is 3 MB.
3. **R2 buckets.** R2 Object Storage > Create bucket, twice:
   `i3league-uploads` and `i3league-uploads-testing`. (Deploys fail if a bucket
   named in `wrangler.jsonc` does not exist.)
4. **Connect the repository.** Workers & Pages > Create > Import a repository,
   choose this GitHub repo, and create TWO Workers projects:

   | | Public | Testing |
   |---|---|---|
   | Project / Worker name | `i3league` | `i3league-testing` |
   | Production branch | `main` | `testing` |
   | Build command | `npm ci && npx opennextjs-cloudflare build` | same |
   | Deploy command | `npx opennextjs-cloudflare deploy` | `npx opennextjs-cloudflare deploy --env testing` |

   Set the Node version to 22 (build variable `NODE_VERSION` = `22`).

5. **Variables.** Two kinds, set on each project (Settings > Variables and Secrets):

   *Build variables* (needed while building, because `NEXT_PUBLIC_*` values are
   baked into the pages): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

   *Runtime variables and secrets*: `DATABASE_URL`, `DIRECT_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, plus:
   - public site: `ALLOWED_EMAILS` (comma separated). Leave `PLATFORM_OPEN` unset.
   - testing site: `PLATFORM_OPEN` = `true`.

   Use each environment's OWN Supabase values (public = live project,
   testing = testing project).

6. **Domains.** On the `i3league` Worker: Settings > Domains & Routes > add your
   custom domain(s). Forward the secondary domain to the primary with a redirect
   rule.
7. **Keep testing private.** Zero Trust > Access > Applications > Add a
   self-hosted application for the testing Worker's address, with a policy that
   allows only the emails you choose.
8. **Supabase auth settings** (both projects): Authentication > URL
   Configuration. Site URL = that site's address; Redirect URLs = the address
   with `/**`. Add each address to the Turnstile widget's hostnames too.

## Before the first deploy from your own computer

Deploy from Cloudflare's build (steps above), not from your laptop. A local
build copies your local `.env` file into the deployed bundle. If you must deploy
locally, temporarily move `.env` and `.env.testing` out of the project folder.

## Trying the Cloudflare build locally

```
source ~/.nvm/nvm.sh && nvm use 22
cp .env.testing .dev.vars          # runtime values for the local preview (gitignored)
npx opennextjs-cloudflare build
npx opennextjs-cloudflare preview  # http://localhost:8787, real Workers runtime
```

Node 22 is required (Wrangler needs it). The app itself runs on Node 20 or 22
for normal `npm run dev`.

## Known limits

- **Rate limits are per server instance.** The in-memory limiter
  (`src/lib/rate-limit.ts`) works on Cloudflare but each Worker instance keeps
  its own counts, so the cap is looser than on a single server. Replace with
  Cloudflare's Rate Limiting binding if abuse becomes a concern.
- **Bundle size** is about 3.6 MB compressed, of a 10 MB paid-plan limit.
- **Next.js "proxy" on Cloudflare** runs as experimental Node middleware in
  OpenNext. It works in every test so far (redirects, allowlist, admin gate),
  but re-run the full walkthrough after upgrading Next or OpenNext.
- `scripts/fix-pg-cloudflare.mjs` repairs a packaging bug in `pg-cloudflare`
  after every `npm install`. If Postgres stops connecting on Cloudflare after a
  dependency upgrade, check that script first.

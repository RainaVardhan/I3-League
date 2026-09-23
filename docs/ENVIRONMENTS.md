# Environments: public site vs testing site

One codebase, two deployments. Behavior differs only by environment variables,
never by code, so merging `testing` into `main` cannot change what the public
site does.

| | Public site | Testing site |
|---|---|---|
| Git branch | `main` | `testing` |
| Cloudflare | Production, your real domain | Preview/branch deploy, its own address |
| Who can reach it | Everyone (public pages) | Only people you allow (Cloudflare Access) |
| Supabase project | The live one | A SEPARATE testing project |
| `PLATFORM_OPEN` | unset (closed) | `true` |
| `ALLOWED_EMAILS` | the approved emails | not needed |

## Public site behavior (`PLATFORM_OPEN` unset)
- Public pages work: Home, How It Works, Curriculum, Pricing, FAQs, Contact,
  Terms, Privacy, Competition Policies, Login, Signup.
- Anyone can sign up. After signing up they see "Account created. Coming soon."
  They cannot reach registration, payment, consent or the dashboard.
- Only admins and emails in `ALLOWED_EMAILS` get past login. To add a person,
  add their email to `ALLOWED_EMAILS` (comma separated) and redeploy.
- Logic: `src/lib/launch.ts`.

## Testing site behavior (`PLATFORM_OPEN=true`)
- Everything works as intended: register, pay, parent consent, stages.
- It must not be public. Put it behind Cloudflare Access (or a password) and
  give it its own Supabase project so test signups and payments never mix
  with real accounts.

## Workflow
1. Build and test on the `testing` branch against the testing site.
2. When it is right, merge `testing` into `main`.
3. `main` deploys to the public site with its own (closed) settings.

## Setting up the testing Supabase project
1. Create a new Supabase project (Data API off, "Automatically expose new
   tables" off, "Enable automatic RLS" on, same as the live project).
2. In Authentication, set the Site URL and redirect URLs to the testing
   site's address, and enable captcha (Turnstile) for that address.
3. Put its keys in the testing deployment's variables (see `.env.example`).
4. Apply the schema: `npx prisma migrate deploy` with `DATABASE_URL` and
   `DIRECT_URL` pointing at the testing project. (Use `migrate deploy`, not
   `migrate dev`: the auth-trigger migrations reference the `auth` schema.)
5. Seed the season and demo data: `npx prisma db seed`.
6. Create your admin login for testing (Admin accounts are never self-serve;
   see CLAUDE.md, Aug 16 2026 entry).

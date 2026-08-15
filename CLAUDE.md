# CLAUDE.md — i3League Build Notes

This file orients any Claude Code session working in this repo. Read this before making architectural decisions or adding new features — it exists so context isn't lost between sessions.

## What this project is

i3League is a year-round student innovation platform (middle/high school). Students move through a 6-stage journey, submitting work at each stage, and can qualify for a national competition. Full product spec lives in the project's source documents — this file is the *build* context, not the product spec. When in doubt about product behavior, defer to the spec; when in doubt about *how* to build something, follow this file.

**The person building this is solo and non-technical.** They are directing Claude Code to write all the code. Prioritize working, well-commented, conventional code over clever code. Avoid unexplained abstractions. When you make a nontrivial architectural choice, leave a comment saying why.

## Timeline context

This is being built as a 2-week MVP, not the full spec. If a task looks like it belongs to a feature listed under "Deferred (Phase 2)" below, don't build it — note it and move on. Scope creep is the biggest risk to this timeline.

## Tech stack (do not deviate without discussion)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Database | Postgres via Supabase (or Neon) |
| ORM | Prisma |
| Auth | Supabase Auth — role-based: `student`, `parent`, `coach`, `judge`, `admin` |
| File storage | Cloudflare R2 (deferred setup — use local/mock storage until Cloudflare step begins) |
| Deployment target | Cloudflare Workers via `@opennextjs/cloudflare` (deferred — build and run locally for now, do not spend time on Cloudflare config yet) |
| Payments | **Manual** — PayPal / Venmo / Zelle. No Stripe, no payment processor API. See "Payment flow & pricing model" below. |
| Error monitoring | Sentry (add once core flows work, not blocking for early days) |
| Version control | GitHub — this repo |

**Local dev for now:** the app should run fully on `localhost` against a cloud Supabase/Neon Postgres instance. Do not wire up Cloudflare deployment until explicitly asked — it's a later step, not a Day 1 blocker.

## Payment flow & pricing model (important — per-participant, not per-team)

**Pricing is per participant, not per project/team.** A team of N pays $111 × N at checkout, but underneath, billing and access are entirely individual:

| Participation | Registration fee |
|---|---|
| Individual | $111 |
| Team of 2 | $222 total ($111/student) |
| Team of 3 | $333 total ($111/student) |
| Team of 4 | $444 total ($111/student) |

Each student — regardless of team size — gets their own: account, curriculum access, assessments, Innovation Journal, speaking/character/ethics challenges, Innovator Profile, badges, and certificate. **The project can be shared across a team; the learning and certification never are.**

Data model implication: `Enrollment` and `Payment` are **per-student**, not per-team. `Team` is a lightweight grouping entity linking students to a shared `Project` — it has no billing or curriculum logic of its own.

No payment processor integration exists. The flow is:

1. Registration/checkout screen totals `$111 × participant count` and displays the org's PayPal.me link, Venmo handle, and Zelle info as static text (pulled from `Season` config, not hard-coded).
2. Each student/parent pays their individual share externally (or the team pays together and it's reconciled manually — don't build logic assuming a single team-wide transaction reference covers everyone; allow each student's confirmation to be entered separately even if the reference number is shared).
3. Each student submits a **payment confirmation form**: payment method, transaction reference/confirmation number, optional screenshot upload. This creates that student's `Enrollment` with `paymentStatus = SUBMITTED`.
4. An admin manually reviews and sets `paymentStatus = VERIFIED` **per student** — a teammate's unverified payment must never block or unlock another teammate's dashboard.
5. `paymentStatus` values: `PENDING`, `SUBMITTED`, `VERIFIED`, `REJECTED`, `REFUNDED`.

Do not build Stripe/payment-API integration unless explicitly asked to add automated PayPal payments later.

## Season-driven config — do not hard-code

Nothing about the 2026–2027 season should be hard-coded into templates or logic. All of the following live on a `Season` record and are read at render/runtime:

- Per-participant pricing (currently $111)
- Spring qualification deadline (April 30, 2027)
- Summer qualification deadline (July 30, 2027)
- National Finals date
- Curriculum version
- Team size limit (currently supports up to 4)

This is what lets a `2027–2028` season exist later without a rebuild.

## Core business rules (enforce server-side, not just in the UI)

- **Sequential stage unlocking**: INSIGHT → INVESTIGATE → IMAGINE → IP Checkpoint → ITERATE → IMPACT → INFLUENCE. A student cannot access a stage via direct URL before completing the prior one. Admin can override/unlock manually.
- **Safety screening** (in INVESTIGATE): any high-risk answer (humans, animals, health info, chemicals, biological materials, electricity, machinery, PII, environmental sampling, drones, AI, other) sets the project to `ADMIN_REVIEW_REQUIRED` and blocks progression until an admin clears it.
- **IP Checkpoint** (gate between IMAGINE and ITERATE): sets project visibility to `PUBLIC` or `CONFIDENTIAL`. **Every project defaults to `CONFIDENTIAL` at creation** — this is the value from the moment a `Project` record is made, not just the answer selected at the IP Checkpoint gate. A project only becomes `PUBLIC` if the student explicitly requests it, at or after the IP Checkpoint — never as a fallback, never inferred from an unanswered question. If the IP Checkpoint flow is skipped, abandoned, or answered ambiguously, the project stays `CONFIDENTIAL`. **Confidential projects must never appear in any public-facing query** — galleries, marketing, public judge views. Treat this as a hard security requirement, not a UI filter (filter at the query/API layer, not just hide it in the frontend; the database default itself should be `CONFIDENTIAL`, so a code path that forgets to set visibility explicitly still fails safe).
- **Role-based access**: enforce at the database/API layer (Supabase RLS or equivalent), not just by hiding UI elements. A parent should never be able to fetch another family's data even via direct API call. A coach has read-only access to their roster — no write access to submissions, tests, or grades.
- **Team billing/access independence**: one teammate's unpaid or unverified status must never lock another teammate out of their own dashboard, curriculum, or certification track.
- **Innovation Journal is append-only**: edits create a new version; don't overwrite/delete history.
- **AI-use disclosure** is required on every stage's SUBMIT step (major submissions), not optional.
- **Project ownership is exactly one of individual or team**: a `Project` row must have exactly one of `individualStudentId` / `teamId` set, never both, never neither. Prisma can't express this as a native schema constraint, so it's enforced twice: (1) a zod refinement in application code runs before every `Project` creation and rejects a request with both or neither set, with a clear error message; (2) a hand-written raw SQL `CHECK` constraint on the `Project` table (`num_nonnulls("individualStudentId", "teamId") = 1`), added directly in the migration file that creates the table, as a fail-safe in case the app-layer check is ever bypassed or has a bug. Do not rely on the app-layer check alone — that was the whole point of catching this before schema lock. If a migration is ever reset/regenerated, re-add this constraint by hand; Prisma will not recreate it from `schema.prisma`.

## Data model — build all of these now, even Phase 2 ones

Building the full schema up front avoids migrations mid-build. Core entities (see product spec Section 40 for full field-level detail):

`User`, `Student`, `Parent`, `School`, `Team`, `Season`, `Enrollment`, `CurriculumModule`, `Lesson`, `Assignment`, `Submission`, `Assessment`, `Question`, `Attempt`, `Project`, `JournalEntry`, `SafetyReview`, `IPReview`, `AIDisclosure`, `SpeakingSubmission`, `CharacterChallenge`, `EthicsChallenge`, `QualificationRecord`, `JudgeAssignment`, `JudgeScore`, `Certificate`, `Payment`, `Notification`, `MediaConsent`

Don't collapse these into one giant table (the spec explicitly calls this out). Remember: `Enrollment` and `Payment` key off `Student`, not `Team`. `Project.visibility` must default to `CONFIDENTIAL` at the schema level (e.g. Prisma `@default(CONFIDENTIAL)`), not just as an application-layer default — this ensures fail-safe behavior even if a code path creates a `Project` without explicitly setting visibility.

## Build sequence — 14-day sprint plan (2-day sprints)

Follow this order. Each sprint builds on the previous one's infrastructure — don't jump ahead even if a later feature looks quick, because most of them depend on auth, the stage template, or the payment/enrollment model landing first.

**Sprint 1 (Days 1–2):** Login & Authentication · Public Homepage · How It Works

**Sprint 2 (Days 3–4):** Curriculum Overview · Divisions & Eligibility · Pricing (per-participant table) · National Finals (static) · FAQs · Contact Us · Terms/Privacy/Competition Policies

**Sprint 3 (Days 5–6):** Participant Registration · Parent/Guardian Consent · Team Creation & Team Management · Payment Processing (manual) · Payment & Enrollment Records (per-student)

**Sprint 4 (Days 7–8):** Student Dashboard · Six-Stage Learning Path template · Stage Progress Tracking · Sequential Stage Unlocking · Online Learning Materials · Practice Activities · File & Media Uploads · build INSIGHT + INVESTIGATE fully

**Sprint 5 (Days 9–10) — heaviest sprint, budget slack here first if anything slips:** Project Submission Portal · Innovation Journal · Speaking Challenge Submissions · Character Challenges · Ethics Challenges · AI-Use Disclosure · Safety Screening · IP Checkpoint · Public/Confidential Project Controls · Team Contribution Tracking · build IMAGINE, IP Checkpoint, ITERATE, IMPACT, INFLUENCE

**Sprint 6 (Days 11–12):** Online Assessments · Assessment Retakes · Deadline Tracking · Qualification Eligibility Tracker · April 30 / July 30 Qualification Windows · Admin Dashboard core · Submission Review · IP Review Workflow · Safety Review Workflow · User & Role Management · School Management · Season Management

**Sprint 7 (Days 13–14):** Parent Dashboard · Coach/Teacher Dashboard · Email Notifications (welcome/stage-complete/next-stage-unlocked) · Digital Badges · Certified Innovator Credential (basic, no QR yet) · Final Innovation Portfolio (auto-compiled) · Mobile-responsive pass · Accessibility pass · Privacy/consent audit · Search & Filtering · bug bash · deploy to staging

## Deferred (Phase 2) — schema-ready, UI not built yet

Don't build UI/workflow for these yet. The data model should already account for them so no migration is needed later:

- Judge Portal, Judge Assignment, Conflict-of-Interest Declaration, Judging Rubrics & Scoring
- Semifinalist/Finalist Management
- National Finals Management (dynamic, beyond the static info page)
- Public Innovation Gallery
- Winner & Award Pages
- National Qualification Submission (full package form)
- Innovator Competency Transcript (depends on judge-entered ratings)
- Certificate Verification (public QR/link verification page)
- Curriculum Management (admin authoring UI — V1 content is built directly, not admin-editable)
- Assessment Question Bank Management (admin authoring UI — V1 banks are seeded, not admin-editable)
- Reporting & Analytics
- Audit Logs UI (basic action logging still happens in the background)
- Help & Support beyond the FAQ/Contact Us pages
- Full notification automation (deadline countdowns, inactivity nudges)

## Working conventions

- Prefer explicit, readable code over abstraction for its own sake — this codebase needs to be maintainable by a non-technical owner working with AI assistance across many sessions.
- Comment non-obvious business logic (especially unlock rules, confidentiality filtering, per-student payment/enrollment logic, and team-vs-individual boundaries) — these are the places a future session is most likely to accidentally break something.
- When a decision in this file conflicts with something a person asks for in a session, flag the conflict rather than silently overriding this file.
- Update this file when a real architectural decision changes (e.g., "we switched from Neon to Supabase") so it stays a reliable source of truth.

## Status log

Keep a running note here of what's actually done vs. planned, so a new session doesn't have to guess.

- **[Aug 10, 2026]** Repo created. Stack decided. Pricing model corrected to per-participant ($111/student; team of N = $111×N, individual billing/access per student). Full 70-item feature backlog sequenced into 7 two-day sprints. Project visibility rule locked: defaults to `CONFIDENTIAL`, only becomes `PUBLIC` on explicit student request at/after IP Checkpoint. Prisma schema not yet drafted. No code written yet.
- **[Aug 13, 2026]** Prisma schema drafted and finalized (`schema.prisma`, 30+ models). Key decisions locked during review:
  - `StudentProject` join table added — links every student to every project they belong to (one row per student per project), independent of `Team`/`TeamMembership`. This is the correct path for "all of this student's projects," including confidentiality checks, rather than traversing through `Team`.
  - When a student leaves a team mid-project, their `StudentProject` row is **never deleted** — `isActiveMember` is set to `false` instead. Past contributions stay permanently on a student's record (Innovator Profile, journey history) even after they leave. `isActiveMember = false` only gates future edit access, not visibility of past work.
  - `Submission.content` and the `SafetyReview`/`IPReview` `answers` fields are JSON, validated in application code (zod per stage), not typed columns — a deliberate speed tradeoff for a solo 2-week build; revisit if the team grows.
  - `Enrollment`/`Payment` remain hard-keyed to `Student` (never `Team`), with `@@unique([studentId, seasonId])` so a team can't accidentally share a payment record.
  - `Project.visibility` defaults to `CONFIDENTIAL` at the Prisma level, with a separate `visibilitySetByStudent` boolean so the database can prove a project only went public because a student explicitly asked.
  - No update path modeled on `JournalEntry` — edits are new rows sharing `entryGroupId` with an incremented `version`. Must not expose PATCH/PUT on this model at the API layer.
  - **Note:** `i3League_2Week_Build_Plan.md` (the original 2–4 person team, Stripe-based, $149 flat-fee draft) is now superseded by `i3League_Sprint_Plan.md` (solo build, manual PayPal/Venmo/Zelle, $111/participant) and this file. Treat the 2-week plan doc as historical only — don't pull scope or payment details from it.
  - Next up: seed data / migration commands, or start Sprint 1 (auth + public site shell).
- **[Aug 13, 2026, later]** Resolved the "exactly one of individualStudent/team" open item on `Project`: enforced at both the app layer (zod refinement before every `Project.create`) and the DB layer (hand-written raw SQL `CHECK` constraint — `num_nonnulls("individualStudentId", "teamId") = 1` — added to the migration that creates the `Project` table). Same fail-safe philosophy as the `visibility` default. See "Core business rules" above and the `Project` model comment in `schema.prisma`. This constraint must be manually re-added if a migration is ever reset, since Prisma doesn't generate it from `schema.prisma`.
- **[Aug 13, 2026, later still]** Repo initialized: scaffolded with `create-next-app` (App Router, TypeScript, ESLint, `src/` dir, no Tailwind). Installed `prisma`, `@prisma/client`, `ts-node`. Ran `npx prisma init` to generate `prisma/schema.prisma` placeholder and `.env`, then replaced the schema with the finalized version and added `prisma/seed.ts`. `package.json` `prisma.seed` entry added. **Not yet done:** no `DATABASE_URL` configured, so `prisma migrate dev` has not been run — the DB has no tables yet, and the `project_exactly_one_owner_check` CHECK constraint has not been added to any migration. Next session needs a Supabase/Neon connection string before continuing to migration + seed.
  - Two bugs found and fixed while validating the schema: (1) `Project.individualStudent` had no opposite relation field on `Student` — added `individualProject Project?` (singular, since `Project.individualStudentId` is `@unique`) to `Student` in `schema.prisma`. (2) this Prisma version (6.19) generates a `prisma.config.ts` on `prisma init` which is now authoritative over `package.json#prisma.seed` — added a matching `migrations.seed` entry to `prisma.config.ts` so `prisma db seed` actually finds `prisma/seed.ts`; kept the `package.json` entry too since it's harmless (just ignored, with a warning).
  - Also set `turbopack.root` in `next.config.ts` to silence a spurious "ignored package-lock.json" warning caused by an unrelated stray lockfile in the parent home directory — not a project issue, just workspace-root ambiguity for Turbopack.
- **[Aug 13, 2026, even later]** Built the "Blueprint" design system while waiting on a `DATABASE_URL`, using the marketing "coming soon" page as the visual reference: dark navy/grid background, Space Grotesk (display) + Inter (body) + JetBrains Mono (labels/mono), ignition-orange + spark-teal accent pair. This is a committed brand look, not a light/dark user preference — no `prefers-color-scheme` switch.
  - Tokens live in `src/app/globals.css` (`:root` custom properties for color/type/spacing/radius). Fonts are loaded via `next/font/google` in `src/app/layout.tsx`, with the font CSS variables (`--font-display` / `--font-body` / `--font-mono`) doubling as the type tokens — no separate font-name mapping layer.
  - Reusable components under `src/components/design-system/`: `GridBackground`, `Eyebrow` (pill/label variants), `Button` (primary/secondary, polymorphic via `as`), `Panel`, `Cube` (the rotating hero visual, parameterized by `size`/`faces` so it's reusable, not hardcoded to the teaser copy), and `StepGrid` (the dashed-divider 3-column "How It Works" layout pattern — color-cycles paper/accent/accent-2 for exactly 3 steps, matching the source page).
  - `src/app/design-system` is a style-guide page showing every token/component together — not a real app route, just a reference. The actual public homepage (nav, hero, stage overview, etc.) has **not** been built yet; scope for this session was tokens + components only. `src/app/page.tsx` is still the default Next.js starter page.
  - Verified via `tsc --noEmit`, `eslint`, and an actual `next dev` run (fetched `/design-system`, HTTP 200, no console/server errors).
- **[Aug 14, 2026]** The dark "Blueprint" design system above was superseded same-day by a canonical, more complete spec the user handed over directly: **`docs/design-system.md`** ("I³ League — Canonical Design System v1"), sourced from an already-approved reference homepage (`i3-homepage-v20-lower-3-logo.html`). This is now the single source of truth for visual design — treat the "Design tokens"/"Reusable components" notes in the entry above as historical only.
  - New direction: **light** "innovation-lab / competition editorial" look — cool mineral canvas (`#E6ECF5`), warm off-white paper (`#FFFDF8`), ink-navy text/authority color (`#10213D`), collegiate cobalt (`#3158D8`) for progress/navigation, coral (`#E35E49`) reserved for action + the IP Checkpoint only. Depth comes from hard offset shadows/planes, never glow or gradients — see doc Section 19 for explicit anti-patterns to avoid.
  - Fonts swapped: Chakra Petch (display), Hanken Grotesk (body), IBM Plex Mono (mono/metadata) — replacing Space Grotesk/Inter/JetBrains Mono. Loaded via `next/font/google` in `src/app/layout.tsx`; export names are `Chakra_Petch`, `Hanken_Grotesk`, `IBM_Plex_Mono`.
  - `src/app/globals.css` rewritten with the full v1 token set (color/type-scale/spacing/radius/container/header-height), including responsive `--header-h`/`--gutter` overrides at the doc's canonical breakpoints (900px/820px).
  - All prior dark-theme components under `src/components/design-system/` were deleted and rebuilt from the new spec: `Logo` (Section 4 — square ink mark, soft-blue "I", coral superscript "3", LEAGUE wordmark), `Button` (Section 9 — primary/ghost, hard bottom-shadow lift, trailing chevron), `Cube` (Section 11 — the six-faced journey visual, canonical face tones/edges, slow idle yaw with `prefers-reduced-motion` fallback), `Eyebrow` (two mono label sizes), `Panel` (standard/selected variants per Section 17), `GridBackground` (Section 8's faint 72px drafting grid).
  - **Deliberately not built yet:** the homepage's full scroll-jacking cube choreography (Section 11's stage-by-stage scroll sequence, journey rail, journey masthead/watermark/progress bar) and the editorial page sections (proof grid, field band, final CTA, footer) from the reference HTML. Those are homepage-construction work, not design-system primitives — matches the earlier "design system only" scope decision. The static `Cube` component is ready to be wired into that hero once homepage building starts.
  - Verified via `tsc --noEmit`, `eslint`, and an actual `next dev` run (fetched `/design-system`, HTTP 200, correct fonts + all component content present, no console/server errors).

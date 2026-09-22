# I³ League — Canonical Design System v1

Source of truth: the approved `i3-homepage-v20-lower-3-logo.html` homepage, plus the as-built pages (Home, How It Works, Curriculum, Pricing, FAQs, Contact Us, Register, Login).

**How to read this doc.** Sections 1 to 20 are the system rules. Section 21 is the as-built reference: the exact fonts, sizes, buttons, boxes, and colors those eight pages ship with, taken from the code. If a rule in Sections 1 to 20 and Section 21 or 22 ever disagree, Sections 21 and 22 are what the site actually does, and the rule should be updated to match. Section 22 covers the signed-in student stage pages (Insight, Investigate).

## 1. Brand Direction

I³ League should feel like a modern national student innovation league: bold, intelligent, optimistic, structured, competitive, and credible enough for students, parents, schools, judges, sponsors, and partners.

The visual concept is **modern innovation lab / competition editorial** — not cyberpunk, not corporate SaaS, not a children's education site, and not a generic AI-generated tech landing page.

The design gets its personality from:

- warm editorial paper surfaces against a cool mineral canvas
- strong ink-navy typography
- collegiate cobalt blue for innovation, progress, and navigation
- coral for action, urgency, and warnings
- sharp, architectural offset depth rather than glowing gradients
- Chakra Petch display typography paired with highly readable Hanken Grotesk
- IBM Plex Mono for stage numbers, labels, metadata, and system-like readouts
- a signature dimensional six-faced cube
- restrained grid / puzzle-cell motion used only where it supports the innovation metaphor

## 2. Canonical Color Tokens

Use these as the global source of truth.

```css
:root {
  --canvas: #E6ECF5;
  --paper: #FFFDF8;
  --paper-warm: #F5EFE5;

  --ink: #10213D;
  --ink-2: #263B5A;
  --muted: #5F6D80;
  --dim: #8D98A7;

  --line: rgba(16,33,61,.14);
  --line-strong: rgba(16,33,61,.26);

  --blue: #3158D8;
  --blue-dark: #1F43B3;
  --blue-soft: #D8E3FB;
  --blue-pale: #EDF2FC;

  --coral: #E35E49;
  --coral-soft: #FBE6E0;

  --white: #FFFFFF;
}
```

### Color roles

- **Canvas — `#E6ECF5`:** default page background and cool neutral section background.
- **Paper — `#FFFDF8`:** primary content surface; warmer than pure white.
- **Paper warm — `#F5EFE5`:** warm dimensional contrast, especially on cube faces or subtle secondary surfaces.
- **Ink — `#10213D`:** primary text, primary buttons, strong structural bands, final CTA.
- **Ink 2 — `#263B5A`:** ink hover state / secondary dark tone.
- **Muted — `#5F6D80`:** body copy and secondary information.
- **Dim — `#8D98A7`:** tertiary metadata only.
- **Cobalt — `#3158D8`:** progress, active navigation, links, stage numbers, key emphasis, structural accents.
- **Dark cobalt — `#1F43B3`:** stronger blue labels and hover states.
- **Blue soft — `#D8E3FB`:** offset planes, information bands, selected surfaces.
- **Blue pale — `#EDF2FC`:** very subtle hover and selection fills.
- **Coral — `#E35E49`:** primary semantic action accent, enrollment indicator, occasional contrast marker.
- **Coral soft — `#FBE6E0`:** warning support surface.

### Color discipline

Do not introduce purple, neon cyan, electric gradients, rainbow accent systems, or large areas of coral. Blue is the dominant brand accent. Coral is rare and meaningful. Ink is the authority color. Warm paper keeps the product approachable.

## 3. Typography

### Font families

```css
--font-display: 'Chakra Petch', 'Avenir Next', 'Segoe UI', sans-serif;
--font-body: 'Hanken Grotesk', 'Inter', 'Segoe UI', sans-serif;
--font-mono: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
```

Load weights:

- Chakra Petch: 500, 600, 700
- Hanken Grotesk: 400, 500, 600, 700
- IBM Plex Mono: 400, 500, 600

Fonts are loaded in `src/app/layout.tsx` via `next/font/google` and exposed as `--font-display`, `--font-body`, `--font-mono`. Components use `var(--font-body), sans-serif` style stacks. Some CSS asks for weight 650 (Hanken Grotesk is a variable font, so 650 renders as written; IBM Plex Mono only has 400/500/600, so a 650 mono label renders at 600).

### Roles

**Chakra Petch / Display**
Use for page headlines, section headlines, stage names, major card headlines, large numbers, logo letters. Keep strings relatively short.

**Hanken Grotesk / Body**
Use for paragraphs, nav links, buttons, form labels, help text, ordinary UI copy.

**IBM Plex Mono / Mono**
Use for eyebrow labels, section indexes, stage numbers, progress metadata, dates/deadlines, small status readouts. Do not use for normal paragraphs.

### Canonical desktop type scale

- Hero H1: `clamp(52px, 5.5vw, 78px)`, weight 700, line-height `.94`, tracking `-.048em`
- Major editorial H2: `clamp(48px, 5.3vw, 70px)`, weight 700, line-height about `.99`, tracking `-.045em`
- Stage heading: `clamp(29px, 2.8vw, 39px)`, weight 700, line-height `1.08`, tracking `-.032em`
- Final CTA H2: `clamp(38px, 4.3vw, 54px)`, weight 700
- Proof/card heading: `24px`, weight 700, line-height `1.2`, tracking `-.024em`
- Hero lede: `17px`, line-height around `1.65`
- Editorial body: `17px`, line-height `1.75`
- Standard body: `15–16px`, line-height `1.65–1.7`
- Nav: `14.5px`
- Buttons: `14.5px`, semibold
- Eyebrow: `11px`, weight 600, tracking `.16em`, uppercase
- Small mono label: `9–10px`, tracking `.15–.17em`, uppercase

### Typography rules

- Headlines are left-aligned by default.
- Use aggressive but controlled negative tracking only on large Chakra Petch headlines.
- Body copy should generally max out around 410–520px for reading comfort.
- Avoid centered body copy except in a deliberate focused moment.
- Avoid all-caps body copy. All caps are reserved for mono metadata and small labels.

## 4. Logo System

### Primary lockup

The website logo consists of:

1. a square `I³` brand mark
2. the word `LEAGUE` to its right

### Square mark

Desktop size: **38 × 38px**.
Mobile/tablet: **34 × 34px**.

Style:

```css
.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #10213D;
  border: 1px solid rgba(16,33,61,.96);
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 8px 18px rgba(16,33,61,.12);
}
```

Inside the square is a subtle inset frame, 4px from the outside edge, with a 5px radius and `rgba(255,255,255,.16)` stroke.

`I` uses Chakra Petch 700 at 16px and the soft-blue brand color. The superscript `3` uses coral, approximately 68% of the `I` size, positioned `top:-.30em` so it is clearly an exponent without floating too high.

```css
.brand-mark-text {
  color: #D8E3FB;
  font: 700 16px/1 var(--font-display);
  letter-spacing: -.06em;
}
.brand-mark-text sup {
  top: -.30em;
  margin-left: 1px;
  font-size: .68em;
  color: #E35E49;
}
```

### Wordmark

`LEAGUE`: Chakra Petch 700, 19px, `.05em` tracking, uppercase.

Gap between square and wordmark: **11px**.

Do not place the logo inside circles, cubes, hexagons, or decorative badges. The square is the canonical mark.

## 5. Layout System

- Main maximum content width: **1160px**
- Standard desktop page gutter: **24px**
- Mobile page gutter: **20px**; 14–20px in very constrained hero contexts
- Header height: **72px** desktop, **68px** under 900px, **64px** under 820px
- Default full section vertical padding: **92px**
- Large editorial sections: approximately **104–112px** vertical padding
- Tight bridge/band sections: approximately **24–28px** vertical padding

### Primary breakpoints

- `1100px`: large-laptop composition adjustment
- `900px`: navigation collapses, mid-size layouts tighten
- `820px`: major tablet/mobile transformation; hero/stage scene reorganizes
- `460px`: smallest mobile tuning

Do not add breakpoints just because a device size exists. Add them only where the content actually needs to reflow.

## 6. Shape Language

The style is mostly squared and architectural with modest rounding.

- Small radius: **6px** (`--radius-sm`)
- Controls: **8px** (`--radius-md`). Buttons, text inputs, textareas, radio options, the menu toggle, and the logo mark.
- Max radius: **10px** (`--radius-lg`). Do not exceed it.
- **Surfaces are square (0 radius).** Every panel, card, stat box, connected grid, ink band, info band, table wrapper, FAQ list, dropzone, payment method row, and auth panel on the built pages has square corners. Only interactive controls are rounded.
- Avoid 20–30px SaaS-card radii.
- Avoid pill-shaped containers except when the semantics truly call for a pill.

## 7. Depth and Shadow Language

Dimension is a core part of the approved design, but it should look **architectural**, not glossy.

Use three kinds of depth:

### A. Offset color planes
A physical-looking colored plane offset behind a paper plane. The home hero uses cobalt behind warm paper.

Desktop hero plane:

- cobalt back plane offset approximately `28px 30px`
- deep shadow around `0 34px 70px rgba(16,33,61,.16)`
- paper foreground plane shadow around `0 34px 66px rgba(16,33,61,.13)`

### B. Hard offset shadows
Used on high-value surfaces to create a printed/poster/competition identity.

Examples:

- Field band: `15px 16px 0 rgba(49,88,216,.11)` plus a soft grounding shadow
- Proof group: `20px 22px 0 rgba(49,88,216,.10)` plus a deeper soft shadow
- Final CTA: `24px 26px 0 #C8D7F7` plus a soft navy shadow
- Journey rail: `12px 14px 0 rgba(49,88,216,.11)` plus soft depth

### C. Soft structural shadows
Use sparingly for sticky navigation, foreground planes, cube grounding, and overlays.

Never add glow. Never add glassmorphism blur cards everywhere. Never shadow every component.

## 8. Background Treatments

### Global page background

Use `--canvas: #E6ECF5`.

A very faint fixed drafting grid may appear globally:

- 72 × 72px cells
- blue at roughly 5% opacity
- entire layer around 34% opacity
- fades vertically using a mask

This grid should be nearly subconscious.

### Hero / journey checker grid

On desktop only, the left side of the scroll experience uses a more visible **30 × 30px** line grid.

- line color: `rgba(49,88,216,.12)`
- layer opacity: `.68`
- grid extends fully to the left viewport edge
- fades toward the right and at top/bottom using masks
- hidden at `820px` and below

A small number of individual 30 × 30px grid cells intermittently flip in place. They must align exactly with grid cells. These pieces use subtle blue, coral, ink, and pale-blue fills. They animate independently of scroll.

Do not use this puzzle grid as a background for every page. Reserve it for hero moments, innovation diagrams, or other high-concept sections.

## 9. Buttons

### Base button

- minimum height: **46px**
- horizontal padding: **20px**
- radius: **8px**
- gap between label and arrow: **9px**
- font: Hanken Grotesk, `14.5px` (`--text-nav`), weight **650**
- icon: 16px, nudges `translateX(2px)` on hover
- 1px transparent border (so primary and ghost are the same height)
- hover/active transitions: **160ms** ease

### Primary

- background: `#10213D`
- text: warm paper `#FFFDF8`
- hard bottom shadow: `0 5px 0 #07142A`
- hover: background and border `--ink-2`, lift 1px, shadow grows to `0 6px 0`
- active: translate down 3px and reduce hard shadow to `0 2px 0`

### Secondary / ghost

- background `rgba(255,253,248,.72)`, border `rgba(16,33,61,.22)`, ink text
- resting shadow `0 2px 0 rgba(16,33,61,.06)`
- hover: paper background, border `rgba(54,91,214,.55)`, text `--blue-dark`

### Strong ghost (paired with a primary)

When a ghost sits next to a primary CTA and must read as equally weighty (home hero "See How It Works"), add the `ghostStrong` class: shadow `0 5px 0 var(--dim)`, same lift/press behavior as primary.

Hover and press are vertical only: lift 1px (shadow `0 6px 0`), press down 3px (shadow `0 2px 0`). The base button nudges its trailing chevron 2px to the right on hover; that is the only sideways motion in the system. A strong ghost that carries a **leading** chevron (Back) keeps the chevron still on hover, so the button moves up and down only.

### On-ink button

On an ink surface (Final CTA, curriculum bridge, payment panel) the primary flips to light-on-dark: background and border `--paper`, text `--ink`, shadow `0 5px 0 var(--dim)`, hover background `--white`.

### Usage

Prefer one dominant primary action per section or major viewport. Do not create several equally loud buttons.

## 10. Navigation

As built, the site header is **logo on the left, menu button on the right**, at every viewport width. There is no inline desktop link row; links live in a dropdown.

Header bar:

- sticky, `z-index: 100`, height `var(--header-h)` (72px, 68px under 900px, 64px under 820px)
- background `rgba(255,253,247,.94)`, 14px backdrop blur
- bottom border `1px solid var(--line)`, shadow `0 8px 26px rgba(16,33,61,.055)`
- inner grid `1fr auto`, side padding `var(--gutter)` (20px under 820px), full viewport width (not capped at 1160px)

Menu button: **44 × 44px**, paper, `1px solid var(--line-strong)`, 8px radius, three 18 × 2px ink bars that morph to an X when open.

Dropdown:

- opens below the button (`top: 54px`, right-aligned), min-width 220px, padding 8px
- paper, `1px solid var(--line)`, square corners
- shadow `8px 10px 0 rgba(16,33,61,.06), 0 22px 40px rgba(16,33,61,.1)`
- links: 14.5px Hanken Grotesk, padding `13px 14px`, color `#59677b`, hover `--ink`
- current page: ink text on `--blue-pale` fill, plus `aria-current="page"`

Footer: see Section 21.7.

## 11. Hero and Signature Cube

The cube is the main brand spectacle. Other pages do not need to recreate the full scroll experience unless the content benefits from it.

### Cube size

- desktop: **248px**
- <=1100px: **220px**
- <=900px: **200px**
- <=820px: **158px**
- <=460px: **146px**

Perspective: about **1250px** desktop.

Base pose:

- X: `-14deg`
- Y: `24deg`

The cube uses no neon glow. Its depth comes from real CSS 3D transforms, tonal face differences, blue structural borders, and a dark-blue physical drop shadow.

### Cube face tones

- Front: `#FFFDF8`
- Right: `#E2E8F3`
- Back: `#CDD8EA`
- Left: `#EEF1F6`
- Top: `#FAF4E9`
- Bottom: `#C6D2E6`

Edges: approximately `1.7px solid rgba(49,88,216,.62)`.

Stage numbers use IBM Plex Mono, cobalt/dark cobalt. Stage names use Chakra Petch 700.

### Scroll sequence

Canonical sequence:

`01 Insight — 02 Investigate — 03 Imagine — 04 Iterate — 05 Impact — 06 Influence`

The cube should idle-spin only while the visitor is at the top hero. Scrolling takes control of rotation. Each stage gets a readable hold. Scroll upward is fully reversible. Returning to the top restores the original hero layout; the site must never remain visually stuck at Stage 06.

(The IP Checkpoint gate that used to sit between Imagine and Iterate was removed from the product — see CLAUDE.md. There is no longer a "pause" beat in the choreography; the cube proceeds directly from Imagine's rotation to Iterate's.)

## 12. Journey Navigation

Desktop journey rail:

- width about **166px**
- right-side fixed visual layer inside the pinned sequence
- warm-paper surface
- subtle ink border
- strong cobalt offset depth plus soft shadow

Each item:

- minimum height: **41px**
- number column: 27px
- 12.5px body label
- active stage uses pale-blue fill and a 3px cobalt left rule

On tablet/mobile (`<=820px`) the rail becomes a **72px horizontal bottom strip**, horizontally scrollable, with active state indicated by a bottom border rather than a left border.

## 13. Editorial Section Patterns

The design intentionally avoids putting everything into cards.

### Pattern A — Editorial split

Use a large display headline on the left and supporting body copy on the right.

Typical desktop ratio:

`1.18fr / .82fr`

Gap: approximately **86px**.

Use for page introductions, curriculum framing, judging philosophy, impact explanation, etc.

### Pattern B — Information band

Use a horizontal tinted band with a strong left rule, rather than individual pills/cards.

Current field band:

- background: blue soft
- 6px cobalt left border
- 24 × 28px padding
- hard cobalt offset shadow + small soft shadow

Good for categories, eligibility, included features, deadlines, requirements, and structured summaries.

### Pattern C — Connected proof group

Use one shared paper plane subdivided by hairline borders rather than separate floating cards.

Current proof group:

- 3 equal columns desktop
- one shared border and shadow
- 46px top padding / roughly 35px side padding
- thin accent rule near the bottom of each item

Use for 3–4 closely related concepts.

### Pattern D — Dark structural bridge

A full-width ink band can connect major sections.

Use for curriculum bridges, qualification milestones, section transitions, or high-confidence program statements.

### Pattern E — Final CTA

Use one major ink surface near the end of a page, with warm-paper text/button contrast and a large pale-blue offset plane. This should be the strongest dark area on most light pages.

## 14. Icons

Use clean outline SVG icons with rounded caps/joins.

- normal stroke: approximately **1.6–1.8px**
- typical inline icon: **16px**
- feature/status icon: **24–28px**
- minimum interactive control remains 44px even if the icon itself is small

Default icon color: ink or cobalt.
Coral is reserved for IP, attention, and specific action states.

Do not use emoji as primary UI icons.

## 15. Motion

Motion should explain hierarchy or state, never exist simply because the site can animate.

Canonical timings:

- buttons / simple UI: ~150–180ms
- stage nav states: ~150ms
- scroll cue: 1.7s gentle vertical nudge loop
- grid puzzle pieces: independent intermittent loops, each approximately 1.6–3.2s per flip plus a randomized pause
- hero cube: extremely slow idle yaw; scroll assumes control once the user starts the journey

Puzzle-square flips use a smooth `cubic-bezier(.2,.7,.2,1)` and may rotate on X or Y. They are not synchronized to the cube or scroll timeline.

Do not animate every section on scroll. The cube sequence is the signature orchestrated animation.

## 16. Accessibility

- Every interactive item needs a visible focus state: `3px solid #3158D8`, 3px offset.
- Minimum touch target: **44 × 44px**.
- Navigation must be keyboard operable.
- Active stage needs semantic state (`aria-current="step"`) in addition to color.
- Hidden stage content must not remain interactable.
- Use semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
- Use actual buttons for stage controls and menu toggles.
- Respect `prefers-reduced-motion: reduce`.
- Reduced-motion mode should convert the scroll experience into a static readable layout, not merely make animation duration zero.

## 17. Recommended Components for New Pages

These are extensions of the approved visual system.

### Standard content panel

Use only when grouping is necessary.

- background: paper
- border: 1px solid `--line`
- radius: **0** (square, as built)
- padding: `24px 32px`
- no shadow by default; add the `prominent` treatment (`8px 9px 0 var(--blue-soft)`) only for the one primary surface on a page (the auth card)

### Selected / important panel

- paper or blue-pale background
- cobalt left rule or top rule
- optional hard 6–10px pale-blue offset if it needs real prominence

### Form inputs

Recommended canonical treatment:

- min-height: **47px** (textarea min-height 110px, vertical resize)
- background: paper
- 1px `--line-strong` border
- radius: 8px
- Hanken Grotesk 15px, ink text, `--dim` placeholder
- horizontal padding 16px (textarea `12px 16px`)
- label: above the field, IBM Plex Mono 10px, `.06em` tracking, uppercase, `--muted`, 8px gap to the field
- hint (optional): between label and field, 13px `--muted`, line-height 1.55
- focus: `outline: none`, 2px `--blue` border (padding reduced by 1px so nothing shifts) + `0 0 0 3px var(--blue-pale)` halo
- error: coral border plus explicit 13px coral error text below; never color alone
- keep answer boxes empty: instructions go in the hint, not the placeholder

### Tables

- paper background
- no card per row
- thin horizontal ink-alpha rules
- mono column headers at 9–10px uppercase
- selected/active rows use blue-pale
- numbers/dates may use IBM Plex Mono

### Status colors

Keep the established blue/coral semantic system. If true success/error states are needed, add muted dedicated semantic colors instead of repurposing blue/coral indiscriminately.

## 18. Page Construction Rules

Every new page should feel related even without a cube.

1. Start with canvas or paper, never a dark full-page shell by default.
2. Use one strong display headline and a restrained mono eyebrow.
3. Use warm paper and cool canvas as alternating page planes.
4. Use cobalt to explain progress, activity, and brand structure.
5. Reserve coral for action, warnings, and rare contrast moments.
6. Build depth through offset planes and section layering, not blur/glow.
7. Prefer one large shared surface over many small floating cards.
8. Use whitespace and typography before borders.
9. Keep radii modest.
10. Do not center whole pages; centered composition is a special-purpose tool.
11. Keep body text readable and relatively narrow.
12. Preserve the 1160px container and consistent gutter system.
13. Make mobile layouts intentionally recompose rather than merely scale down.
14. Use mono labels consistently for metadata and sequencing.
15. Keep the full cube-scroll sequence exclusive to places where storytelling warrants it.

## 19. Anti-“AI Slop” Guardrails

Avoid:

- neon-on-black default styling
- cyan/purple gradients
- glowing borders
- glass cards everywhere
- a card for every sentence
- excessive pills
- enormous rounded corners
- floating decorative orbs/shapes without meaning
- generic gradient blobs
- icons inside a badge for every line of text
- centered-everything layouts
- repeated scroll-reveal animations
- random accent colors
- excessive drop shadows
- fake technical labels used only as decoration

Prefer:

- strong editorial hierarchy
- fewer, larger structural surfaces
- real alignment and grid relationships
- purposeful mono metadata
- asymmetry where useful
- consistent color semantics
- architectural depth
- restrained motion
- genuine content-driven hierarchy

## 20. Quick Reference

**Brand personality:** youthful intelligence + national competition + innovation lab + editorial confidence.

**Default background:** `#E6ECF5`.

**Primary surface:** `#FFFDF8`.

**Primary text / authority:** `#10213D`.

**Primary brand accent:** `#3158D8`.

**Secondary action / IP accent:** `#E35E49`.

**Display font:** Chakra Petch.

**Body font:** Hanken Grotesk.

**Metadata font:** IBM Plex Mono.

**Container:** 1160px.

**Default gutter:** 24px desktop / 20px mobile.

**Button radius:** 8px.

**Typical UI radius:** 6–10px for controls; surfaces (panels, cards, bands) are square.

**Built-page reference:** Section 21.

**Depth:** offset planes + restrained soft grounding shadows.

**Signature visual:** six-faced I³ journey cube.

**Signature texture:** subtle drafting grid / selectively animated 30px puzzle grid.

**Signature dark moment:** ink structural bridge/final CTA — not a dark entire site.

## 21. As-Built Reference (Home, How It Works, Curriculum, Pricing, FAQs, Contact Us, Register, Login)

Everything below is read from the shipped CSS modules. Use it when building a new page so it matches these eight.

### 21.1 Page anatomy and section rhythm

Every marketing page is a stack of full-bleed bands. Band backgrounds **alternate** between `--paper` and `--canvas`, so no two neighbors match (the ink band is the exception, used as a bridge or a closer). Each band has an `.inner` capped at `var(--container)` (1160px), centered, with `var(--gutter)` on the sides.

| Page | Band order (background) |
|---|---|
| Home | Hero (canvas) / Curriculum bridge (ink) / Problem (paper) / Proof (canvas) / Final CTA (paper) |
| How It Works | Hero (canvas) / Who it's for (paper) / Process (canvas) / Distinction (paper) |
| Curriculum | Hero (canvas) / Three phases (paper) / Stage detail (canvas) / Stage workflow (paper) |
| Pricing | Hero (canvas) / Team pricing (paper) / Included (canvas) / Payment (paper, ink panel) |
| FAQs | Intro (canvas) / Question groups (paper, 780px column) |
| Contact Us | Intro (canvas) / Channels (paper) |

Vertical padding (top / bottom):

| Band | Desktop | Under 820px |
|---|---|---|
| Hero (How It Works, Pricing) | 88 / 82px | 66 / 74px (top 52px under 460px) |
| Hero (Curriculum) | 88 / 96px | 60 / 56px |
| Hero (FAQs, Contact) | 88 / 132px | 66 / 88px (top 52px under 460px) |
| Content band, standard | 104 / 112px, or 108 / 116px | 68 / 72px |
| Content band, tall (Home problem) | 112 / 84px | 92 / 72px |
| Final CTA / Payment | 104 to 106 / 116 to 118px | 72 to 82 / 84 to 94px |
| FAQs and Contact content | 92 / 112px (`--space-16` / `--space-20`) | 48 / 92px |

Section edge treatment: paper bands often carry `inset 0 18px 34px rgba(16,33,61,.035)` plus `0 1px 0 rgba(255,255,255,.9)`; canvas bands `inset 0 18px 36px rgba(16,33,61,.035)`. Band bottoms use `1px solid var(--line)`. These are barely visible on purpose.

Band header block (kicker, heading, copy): kicker, then heading with `10px` top margin and `16px` to `20px` bottom margin, then copy, then `48px` (sometimes `42px`) before the content. Mobile 38 to 48px.

### 21.2 Hero band (all pages but Home)

Built by the shared `SplitHero`:

- background `--canvas`, `isolation: isolate`, overflow hidden
- the 30px checker grid (Section 8) fills the whole hero: lines `rgba(49,88,216,.12)`, layer opacity `.4`
- two columns `minmax(0,1.18fr) / minmax(300px,.82fr)`, gap **84px**; at 900px the right column is 330px with a 50px gap; at 820px it collapses to one column with a 40px gap
- copy column max-width 670px; lede max-width 570px (both uncapped once single-column)
- content order: mono eyebrow, H1, lede, buttons
- H1: Chakra Petch 700, `--text-hero`, line-height `.94`, tracking `-.045em`, margin `18px 0 20px`. Mobile: `clamp(48px,14vw,64px)`; under 460px `clamp(44px,15vw,58px)`
- lede: `--text-lede` (17px), line-height 1.68, `--muted`; 15.5px under 460px
- single-column variant (FAQs, Contact): same type, centered, copy max-width 640px

Home hero is the special scroll-driven version (`JourneyHero`): H1 `clamp(52px,5.8vw,64px)` with tracking `-.048em`, `text-wrap: balance`, subtitle `--text-lede` in `#53627a` at 1.65 line-height (max 485px), two buttons in a 12px-gap row (`0 5px 0 #07142a` primary and `0 5px 0 var(--dim)` ghost), then a mono enroll note (12px, `#68758a`, `.03em`). Stage panels use a mono stage number (11px, 700, `.17em`, cobalt); the faint stage numeral is `clamp(108px,11.5vw,188px)` at `rgba(49,88,216,.125)`.

**Hero right-slot widget ("stat box").** How It Works, Pricing, and Curriculum each put one paper box in the right column:

- paper, `1px solid var(--line)`, square, `8px 9px 0 var(--blue-soft)`, padding `24px 32px`
- big numeral in Chakra Petch 700: How It Works `clamp(72px,8vw,118px)` cobalt, line-height `.8`, tracking `-.07em`; Pricing `clamp(64px,7vw,92px)` ink, line-height `.85`, tracking `-.06em`
- label: Chakra Petch 700 24px / 1.15, tracking `-.025em` (mobile 20px under 460px)
- sub line: 14.5px `--muted`; small caption 11px mono `--dim`
- a `64 x 4px` cobalt rule under the content
- Curriculum uses a square 480px `FrameworkCard` instead: same shadow, faint `--blue-pale` 150px watermark numeral, six rows with mono cobalt number (11px, 700) and Chakra Petch 700 21px name

### 21.3 Typography as built

Font roles (Section 3) hold. Sizes actually used:

| Role | Font | Size / weight / line-height / tracking |
|---|---|---|
| Hero H1 | Chakra Petch | `--text-hero` clamp(52px,5.5vw,78px), 700, .94, -.045em |
| Home problem H2 | Chakra Petch | clamp(48px,5.3vw,70px), 700, .99, -.045em |
| Section H2 (standard) | Chakra Petch | clamp(36px,4.4vw,56px), 700, 1, -.043em (How It Works, Curriculum) |
| Section H2 (medium) | Chakra Petch | clamp(36px,4.2vw,52px), 700, 1, -.042em (Distinction, Team pricing) |
| Section H2 (workflow) | Chakra Petch | clamp(40px,4.4vw,56px), 700, 1.05, -.035em |
| Final CTA H2 | Chakra Petch | `--text-cta` clamp(38px,4.3vw,54px), 700, 1.03, -.033em |
| Payment panel H2 | Chakra Petch | clamp(34px,3.6vw,46px), 700, 1.05, -.034em |
| Process step title | Chakra Petch | clamp(24px,2.2vw,31px), 700, 1.05, -.026em |
| Card H3 (default) | Chakra Petch | 24px, 700, 1.2, -.024em (proof, three phases, workflow) |
| Card H3 (larger) | Chakra Petch | 26px/1.1 (Who it's for), 28px/1.08 (Distinction) |
| Card H3 (smaller) | Chakra Petch | 22px/1.2 (Contact), 18px/1.2 (Included, 5 columns), 20px (info band) |
| FAQ group title | Chakra Petch | 22px, 700, -.02em |
| Stage panel heading | Chakra Petch | clamp(28px,3vw,38px), 700, 1.05, -.03em, cobalt |
| Auth card H1 | Chakra Petch (global h1) | 28px, centered |
| Section copy | Hanken Grotesk | 16px / 1.7 to 1.72, `--muted` (17px / 1.75 on Home and Curriculum workflow) |
| Card body | Hanken Grotesk | 14.5px / 1.67 (14 to 15px range; 13.5px in 5-column cards), `--muted` |
| FAQ question | Hanken Grotesk | 16.5px, 600, ink |
| FAQ answer | Hanken Grotesk | 15px / 1.68, `--muted`, max 66ch |
| List item | Hanken Grotesk | 14px / 1.5, `--ink-2` |
| Table body | Hanken Grotesk | 15.5px, ink; numbers in mono 15px |
| Kicker / eyebrow | IBM Plex Mono | 10px, 650, `.15` to `.17em`, uppercase, cobalt |
| Eyebrow (pill/section) | IBM Plex Mono | 11px, 600, `.16em`, uppercase, cobalt |
| Metadata / status | IBM Plex Mono | 9 to 11px, 600, `.06` to `.18em`, uppercase, `--dim` |
| Form label, section label | IBM Plex Mono | 10px, `.06em`, uppercase, `--muted` |
| Form hint / error | Hanken Grotesk | 13px, `--muted` / coral |
| Auth subheading, footer link | Hanken Grotesk | 14px, `--muted` |
| Nav / dropdown links | Hanken Grotesk | 14.5px |
| Footer links | Hanken Grotesk | 13.5px |
| Footer column heading | IBM Plex Mono | 10px, 650, `.15em`, uppercase, `#818d9d` |
| Footer legal line | IBM Plex Mono | 10.5px, `.04em`, `#8793a3` |

Rules seen across the pages: only Chakra Petch headlines get negative tracking; mono is always uppercase and tracked; body copy is `--muted`, never ink, except list items (`--ink-2`) and links.

### 21.4 Buttons as built

- **Primary:** ink, paper text, `0 5px 0 #07142a`. Used for the one main action per band (Register Today, Continue, Log in, Submit).
- **Ghost / Strong ghost:** paper-tint with ink border; the strong version adds `0 5px 0 var(--dim)` so it balances a primary beside it.
- **Back (student stage pages):** strong ghost, `showArrow` off, with a leading left chevron that stays still on hover. Paired with a primary "Next: {section}" on the right. See Section 22.3.
- **On-ink:** paper fill, ink text, `0 5px 0 var(--dim)`. On mobile the bridge button steps to `min-height: 42px`, 12.5px, and goes full width under 460px.
- **Form submit (Login, Register, Payment):** normal primary button but `align-self: flex-start`. It is left-aligned and sized to its content, never a full-width bar.
- **Text links:**
  - Contact email: `--blue-dark`, 14px, 650, with a 2px `--blue-soft` bottom border that turns `--blue` on hover.
  - Auth footer link: `--blue`, 14px, 600.
  - Login "Forgot password": `--blue`, 13px, 600, underline on hover.
  - Footer and legal links: grey (`#5e6c80`, `#8793a3`), hover `--blue-dark`; the current page is `--blue-dark` at 650.
- **Icon-only buttons:** menu toggle 44 x 44px (Section 10); dropzone remove button 28 x 28px, square, `1px solid var(--line-strong)`, hover coral border, coral text, coral-soft fill.

### 21.5 Boxes and surfaces (the recipes)

All surfaces are square. Depth = a hard offset plane in blue plus a soft grounding shadow. Reuse these exact recipes rather than inventing new ones.

| Surface | Where | Fill / border | Shadow (desktop) | Shadow (under 820px) |
|---|---|---|---|---|
| Stat box | Hero right slot, FAQ accordion list, Curriculum framework card, auth panel (`prominent`) | paper, `1px --line` | `8px 9px 0 --blue-soft` | unchanged |
| Connected grid (Pattern C) | Home proof, How It Works who-it's-for, Curriculum phases and workflow, Pricing included | paper, `1px rgba(16,33,61,.15)` | `20px 22px 0 --blue-soft` (or `rgba(49,88,216,.10)`), `0 38px 68px rgba(16,33,61,.12)` | `9px 11px 0 --blue-soft` (or `rgba(49,88,216,.07)`) |
| Process shell | How It Works 8 steps | paper, `1px --line` | `18px 20px 0 rgba(49,88,216,.10)`, `0 34px 64px rgba(16,33,61,.10)` | `11px 13px 0 ...`, `0 24px 44px rgba(16,33,61,.09)` |
| Tabs + panel | Curriculum stage detail | paper, `1px rgba(16,33,61,.18)` | `16px 18px 0 rgba(49,88,216,.12)`, `0 30px 54px rgba(16,33,61,.14)` | `7px 8px 0 rgba(49,88,216,.08)`, `0 16px 30px rgba(16,33,61,.09)` |
| Table wrapper | Pricing table | paper, `1px --line` | `18px 20px 0 --blue-soft`, `0 34px 64px rgba(16,33,61,.10)` | `11px 13px 0 --blue-soft`, `0 24px 44px rgba(16,33,61,.09)` |
| Channel card | Contact | paper, `1px rgba(16,33,61,.15)`, hover `--blue-pale` | `14px 16px 0 --blue-soft`, `0 28px 50px rgba(16,33,61,.10)` | `8px 9px 0 --blue-soft` |
| Join card | How It Works | `--blue-pale`, `1px rgba(16,33,61,.15)` | `20px 22px 0 rgba(49,88,216,.10)`, `0 38px 68px rgba(16,33,61,.12)` | `9px 11px 0 rgba(49,88,216,.07)` |
| Qualify card | How It Works | `--coral-soft`, `1px rgba(227,94,73,.24)` | `20px 22px 0 rgba(227,94,73,.11)`, `0 38px 68px rgba(16,33,61,.12)` | `9px 11px 0 rgba(227,94,73,.10)` |
| Field line | Home problem | `--coral-soft`, `1px rgba(227,94,73,.18)` | `15px 16px 0 rgba(227,94,73,.11)`, `0 22px 34px rgba(16,33,61,.07)` | `8px 9px 0 rgba(227,94,73,.10)` |
| Ink panel (Pattern E) | Home Final CTA, Pricing payment | `--ink`, no border | `24px 26px 0 #c8d7f7`, `0 38px 70px rgba(16,33,61,.17)` | `10px 12px 0 --blue-soft`, `0 28px 48px rgba(16,33,61,.13)` |
| Payment method chip | Inside the ink panel | paper | `8px 9px 0 --blue-soft` | `5px 6px 0 --blue-soft` |
| Dropdown menu | Header | paper, `1px --line` | `8px 10px 0 rgba(16,33,61,.06)`, `0 22px 40px rgba(16,33,61,.10)` | same |

Connected-grid details (the most reused box):

- equal columns (3, 4, or 5), cells divided by `1px rgba(16,33,61,.12)` (top rules once stacked)
- cell padding about `46px 35px 38px` (3 columns), `40px 32px 34px` (4), `34px 24px 30px` (5); min-height 230 to 250px on 3-column grids; mobile `30px 26px 38 to 48px`
- hover: `--blue-pale` fill over `.16s`
- a cobalt underline accent, absolutely positioned at `left` = cell side padding, `bottom: 28px`, `34 to 42px` wide, `3 to 4px` tall
- inside each cell: mono kicker (cobalt, 10px), Chakra Petch H3, muted 14 to 15px body

Ink panel details:

- padding `58px 60px` (Payment `58px 60px 62px`); mobile `42px 30px`
- decorative `I³` watermark top-right: Chakra Petch 700 92px, `rgba(255,255,255,.055)`, tracking `-.08em`, at `top: 24px; right: 32px` (60px at `top:16; right:20` on mobile)
- heading white; body `#c6d0df` at 16px / 1.65; eyebrow recolored `#b8c8f8`
- Final CTA card max-width 1020px, content left and button right (`gap: 46px`), stacking to a column under 820px

Other bands:

- **Curriculum bridge (Pattern D):** full-width ink, padding `28px var(--gutter)`, shadow `0 14px 30px rgba(16,33,61,.14)`, mono label 10px 600 `.17em` in `#bbc8e9` on the left and an on-ink button on the right. Column under 460px.
- **Information band (Pattern B):** `--blue-soft` fill, `6px solid --blue` left border, padding `24px 32px`, shadow `8px 9px 0 --blue-soft` plus `0 1px 2px rgba(16,33,61,.06)`. Title Chakra Petch 20px; body 15px / 1.65 in `--ink-2`.
- **List with square bullets (Distinction cards):** top and bottom hairlines per row, 14px text, a 7 x 7px square bullet (cobalt, coral in the Qualify card).
- **FAQ accordion:** one paper list with the stat-box shadow, rows divided by `--line`, question row padding `20px 24px`, hover `--blue-pale`, a plus icon drawn from two 14 x 2px cobalt bars that rotates to a minus when open, answer padding `14px 24px 24px`. Uses native `<details>`.
- **Pricing table:** paper wrapper (recipe above), header cells mono 10px `.14em` uppercase `--dim` over a `--line-strong` rule, body cells 15.5px with `--line` rules, row hover `--blue-pale`, min-width 460px with horizontal scroll.
- **Process rail (How It Works):** 3px ink vertical rail behind numbered squares (58 x 58px, `2px solid --ink`, mono 13px 700, shadow `5px 6px 0 --blue-soft`); hover or open flips the square to ink fill with white text and lifts 3px. Rows are a 4-column grid (`120px / .48fr / 1fr / auto`, gap 34px); the row hover fill is `#fbfcff`; detail text opens with a `grid-template-rows: 0fr` to `1fr` transition.

### 21.6 Register and Login

Both pages use the shared `AuthCard`:

- background: `--canvas` with the fixed 72px `GridBackground` (Section 8)
- `<main>` is a centered flex container, `min-height: 100vh`, padding `32px var(--gutter)`
- column stack, `gap: 24px`, centered: **Logo**, then the **Panel**, then a footer link line
- card width: **440px** (Login, Signup, Reset); **680px** (`wide`: Register, Payment, Consent)
- panel = standard Panel (paper, `1px --line`, square, padding `24px 32px`) with `prominent` (`8px 9px 0 --blue-soft`)
- heading: Chakra Petch 28px, centered, 8px below; subheading 14px `--muted`, centered, 24px below
- footer link: 14px `--muted`, with the link itself in `--blue` at 600

Form layout:

- fields stacked with `gap: 20px` (`--space-5`)
- two-up rows (`1fr 1fr`, gap 16px) and the interests grid collapse to one column under 520px
- section dividers inside a long form: the mono 10px label with a `1px --line-strong` top rule and 20px top padding (the first one has no rule)
- conditional sub-fields sit in a `--canvas` box, padding 16px, square, `gap: 16px`
- inline form error: 14px coral text
- radio options: paper, `1px --line-strong`, 8px radius, padding `12px 16px`, 16px text; checked = `--blue` border and `--blue-pale` fill (no custom radio dot)
- checkbox: native 18px, `accent-color: var(--blue)`, 16px label, 12px gap
- login "Forgot password" link right-aligned above the submit button

Payment step (part of Register):

- method rows: paper, `1px --line`, square, padding 16px, 40px method icon, bold ink name, mono 13px detail in `--muted`; linked rows hover to a `--blue` border and `--blue-pale` fill
- rejection notice: `--coral-soft` fill, square, padding 16px, ink text
- join code: mono 22px, `.12em` tracking, `--blue`
- screenshot dropzone: `--canvas` fill, `1px dashed --line-strong`, min-height 96px, centered prompt with cobalt upload icon and 14px ink text (cobalt bold on the action word) and a 12px `--dim` hint; hover or drag = cobalt border, `--blue-pale` fill (solid border while dragging); selected file row shows a cobalt file icon, 14px 600 file name, and mono 12px size

### 21.7 Footer and logo

- **Footer:** background `#dee5f0` (one step darker than canvas), `1px solid var(--line)` top border, inset shadow `0 16px 30px rgba(16,33,61,.035)`, padding `44px var(--gutter) 20px`. Brand column (logo plus a mono 12px tagline in `#677589`), then link columns with `column-gap: 48px` and `row-gap: 24px`, then a `1px rgba(16,33,61,.13)` rule and a legal line. Under 820px the brand column goes full-width and centered; under 460px everything stacks and centers.
- **Logo:** 38px mark (34px under the tablet breakpoint), 8px radius, ink fill, soft-blue Chakra Petch `I` at 16px (14px small) with a coral superscript `3` (`.68em`, `top: -.3em`), then the `LEAGUE` wordmark at 19px, 11px gap.

### 21.8 Colors as built, including recurring literals

Tokens (`globals.css`) cover the brand palette. The built pages also repeat these raw values. If one appears in three or more files, prefer promoting it to a token over adding another copy.

| Value | Role |
|---|---|
| `#07142a` | primary button hard shadow (darker than ink) |
| `#c8d7f7` | offset plane behind ink panels (lighter than `--blue-soft`) |
| `#c6d0df` | body text on ink |
| `#b8c8f8` | eyebrow on ink |
| `#bbc8e9` | mono label on the ink bridge |
| `#53627a` | Home hero lede |
| `#59677b` | header dropdown link |
| `#5e6c80`, `#677589`, `#68758a` | footer and small-print greys |
| `#818d9d`, `#8793a3`, `#8a95a4` | mono metadata greys (close to `--dim`) |
| `#dee5f0` | footer background |
| `#fbfcff` | process row hover |
| `rgba(16,33,61,.12)` / `.15` / `.18` | cell dividers / surface borders / stronger surface borders |
| `rgba(49,88,216,.10)` / `.12` | cobalt offset planes (the tokenless alternative to `--blue-soft`) |
| `rgba(227,94,73,.11)` | coral offset plane |
| `rgba(16,33,61,.10)` to `.17` | soft grounding shadows, rising with the surface's importance |

Color usage on these pages:

- **Cobalt:** kickers, stage numbers, big numerals, accent underlines, focus, links, checked states, progress rules.
- **Ink:** headings, primary buttons, process squares, active tab, the bridge and Final CTA/Payment panels.
- **Coral:** used for the qualification emphasis (Qualify card, the home problem field line and its last item), form errors, and destructive hover. It is tinted (`--coral-soft`) rather than solid on large areas, and never a page background.
- **Blue-pale:** every hover and selected fill (grid cells, table rows, FAQ rows, radio checked, dropzone hover, current menu item).
- **Blue-soft:** offset planes, the info band, and hover-adjacent accents. Never as text color.

### 21.9 Motion as built

- hover fills: `.16s` ease (grid cells, table rows, menu links)
- buttons: `.16s` for transform, shadow, background, border, color
- process rows: reveal on scroll (`translateY(24px)` to 0, `.6s`), number square lifts `translateY(-3px)` on hover, title shifts `translateX(5px)`, chevron rotates `.25s`, detail height animates `.35s cubic-bezier(.16,1,.3,1)`
- Curriculum stage panel: fades in with a 6px rise, `.22s`
- all of the above turn off under `prefers-reduced-motion: reduce`

### 21.10 Responsive behavior as built

Breakpoints used on these pages: **1000px** (5-column grids to 3), **900px** (hero right column narrows; 4-column to 2), **820px** (main mobile transformation: grids to one column, shadows shrink to `~9px 11px`, section padding drops to 68 to 92px), **620px** (remaining multi-column grids to 1), **520px** (form rows to 1), **460px** (smallest tuning), **400px** (framework card watermark hidden).

Pattern when a connected grid stacks: drop each cell's left border, add a top border, reduce the offset shadow to about `9px 11px 0`, and reduce the internal padding.

## 22. As-Built Reference (Student stage pages, /dashboard/[stage])

The signed-in stage pages (Insight, Investigate, and the placeholder stages) use the same surfaces as Section 21, arranged for a working page instead of a marketing page. Read this before building or restyling any stage page. Shared code lives in `src/components/journey/`.

**Insight (`/dashboard/insight`) is the reference implementation.** Every other stage page follows its design and structure. Where this section and the Insight page disagree, the Insight page is correct and this section needs updating. The build checklist for a new stage is in `CLAUDE.md` under "Stage page standard".

### 22.1 Page anatomy

Top to bottom, inside the app shell (sidebar and topbar):

1. **Hero band (canvas).** The shared `SplitHero` with the Section 21.2 stat box in the right slot: eyebrow `Stage 01 of 06 · In progress`, the stage name as the H1, the core question (ink-2, 600) then the description as the lede. The stat box holds the cobalt stage numeral, the required artifact as its label (Chakra Petch 700, 24px), a muted sub line, the 64 x 4 cobalt rule, and a mono caption with the lesson and activity counts. Padding `88 / 82px`, `66 / 74px` under 820px, top `52px` under 460px.
2. **Page bar (navy).** A full-width ink band between the hero and the pages, the Pattern D bridge used as navigation: ink fill, shadow `0 14px 30px rgba(16,33,61,.14)`, padding `18px var(--gutter)`, row spanning the full page width. It lists every page of the stage, each as the shared **white ghost button** (the home hero's "See How It Works": strong ghost, solid `--paper` fill, `0 5px 0 --dim` shadow, vertical-only hover and press) **all on one line**, each sized to its own text and sharing out any spare room so the row ends flush (`flex: 1 1 auto`), tightened to fit (12.5px label, `0 10px` padding, 42px tall, 6px gaps, row spans the full page width rather than the container); on a screen too narrow for the row it scrolls sideways, never wraps. Each holds a mono number (`01`, 10px 650, cobalt) and the **short page name** (the same label the sidebar uses: Observation Skills, Empathy, Problem Scope, Consent, Review). **The open page is marked with a cobalt border and a `--blue-pale` fill.** A locked page (Review, before submit on Investigate) is dimmed with a lock icon and not clickable. Choosing a page scrolls the bar to just under the topbar so the bar and the top of the page stay in view. The open page is kept in the URL (`?page=empathy`, updated without adding history entries), so a reload or a shared link stays on the same page; an unknown or locked page falls back to the first page (or Review once submitted).
3. **Layer bands (alternating, stacked).** Each section is its own page, shown one at a time under the hero, and each of its three layers is a separate full-bleed band: **Learn (paper), Do (canvas), Show (paper)**. A topic with no Do alternates from Learn (Learn paper, Show canvas). A topic with no Show step (Insight's Consent page: Learn paper, Do canvas) ends on its Do band, so its Back / Next row is a **paper** band to keep the alternation. Every band is **stacked, like How It Works**: the heading sits on top, left-aligned, at the full 1160px container, and the content runs the full container width beneath it, `clamp(28px, 4vw, 44px)` below the heading. There is no left rail and nothing is sticky. Heading contents: a mono kicker (10px gap) over a title, and **every title is one size** (Chakra Petch 700 `--text-stage`, line-height 1.08, tracking `-.03em`, ink): Learn = the section title (Observation Skills), Do = the activity name (3-Day Friction Hunt), Show = `Must include` followed by the section's check-marked list (in columns, `minmax(260px, 1fr)`). Review titles use the same size. There is no boxed section number. A band's padding is `clamp(48px, 6vw, 72px) var(--gutter)` top and bottom, with a `1px solid var(--line)` bottom border and the Section 21.1 edge treatment for its tone. The content column is a flex column with `24px` between items.
4. **Pager band (canvas).** The Back / status / Next row sits in its own canvas band under the page (Section 22.3).
5. **Footer band (canvas, optional).** A page-level band under the open page, used for the ink submission checklist card. Paper and canvas alternate, so a footer band is canvas.

Sections never scroll together as one long page. Moving between them is Back / Next or the sidebar list. Every band, on every stage page, is built with the shared `StageBand`; do not put a Learn, Do or Show layer inside another band.

**Pages that group several parts.** A page can hold more than one lesson or activity (Investigate's pages pair each required supporting activity with the topic it works alongside). The band then keeps one heading (the page name for Learn, `Activities` for Do) and each part gets its own heading inside the content (`PartStack`: Chakra Petch 700 `clamp(20px, 2vw, 24px)`, optional mono label above such as `Required supporting activity`, parts `clamp(48px, 5vw, 64px)` apart to clear the offset shadows). With one part, the band heading is that part's name, as on Insight. The Show band groups its fields per activity under the small mono section labels (hairline above each group after the first). A page with no lesson at all (Investigate's Stakeholders & Gap) opens on its Do band, still paper first: Do (paper), Show (canvas), Back / Next row (paper), with the kicker `Do · Required supporting activities`. A lesson with a depth tag adds it to the Learn kicker (`Learn · HS Core`). The Show heading can also hold the page's **The reviewer checks** list (square cobalt bullets, since they are questions) and short notes under mono labels (e.g. `Minimum evidence standard`); when a page has reviewer checks but no Must include list, `The reviewer checks` is the heading. The safety screening's Save button is a ghost, since Next is the page's primary.

### 22.2 Section heading and layers

- **Section headings.** Every band heading (Section 22.1) is the same size, in every band of every stage page. The lesson's own title is not repeated in the content column; the Learn heading is the title. Do not add a boxed section number.
- **Layer kickers.** Each band starts its heading with a mono kicker (10px, 650, `.15em`, uppercase, cobalt): **Learn**, **Do**, **Show**.
- **Lesson layout (Learn content).** One column at the full container width (never split into two columns), set as **one connected plane** in the Section 21.5 format: paper fill, `1px solid rgba(16,33,61,.15)` border, square corners, the hard offset plane `20px 22px 0 --blue-soft` plus `0 38px 68px rgba(16,33,61,.12)` (`9px 11px 0` and a lighter soft shadow under 820px), the same as the Do boxes. Every part of the lesson is a **numbered row** in that plane, in this order: **What is it?** (the highlighted definition, below), **Why does it matter?**, **Example**, **Common mistake**, **Key takeaway**, **Think about it**. Rows are divided by `1px solid rgba(16,33,61,.12)` hairlines, have `30px 34px 32px` padding (`24px 22px 26px` under 820px), and take a `--blue-pale` fill on hover (`.16s`). Each row opens with a mono subheading (10px, 650, `.15em`, uppercase, `--muted`) preceded by its two-digit cobalt number (`01`, `02`, ...), then its text (16px / 1.75). **Every row is styled the same**: no inner boxes, no tinted rows, no extra rules. The **Example** is ordinary row text (16px / 1.75 `--muted`). The only emphasis is on the **Key takeaway** statement, set in Chakra Petch 700 `clamp(22px, 2.4vw, 28px)`, tracking `-.03em`, ink. **Think about it** is italic 15px `--muted`. "Try this" and "Use this in your project" are not shown, because the Do band states the activity and the Show band asks for the answers. The wording is always the curriculum's, unchanged.
- **Highlighted definition.** The lesson's "What is it" sentence is highlighted like a marker pen: a `<mark>` with a solid `--paper-warm` background, the same warm tan as the dashboard "Not ready to submit" badge (no gradient), `3px 6px` padding, ink text, and the defined term in bold. `box-decoration-break: clone` keeps the highlight padding on every wrapped line. Use this treatment for any definition, not a boxed callout.
- **Do band.** The heading is the activity name. Under the boxes sits a one-line **italic footer** (14px, `--muted`, `24px` above) saying which worksheet is not submitted ("Not submitted: keep your Friction Log yourself. It is not uploaded."). What is submitted is not repeated here: the Show page below lists it through its Must include list and its fields. The content column has the activity description (17px / 1.7 `--ink-2`, 720px measure), then the **Worksheet** and **Output** boxes in the Section 21.5 **connected grid** format: two cells, paper fill, `1px solid rgba(16,33,61,.15)` border, hairline dividers, the hard offset plane `20px 22px 0 --blue-soft` plus `0 38px 68px rgba(16,33,61,.12)` (`9px 11px 0` and a lighter soft shadow under 820px), cell padding `28px 28px 56px`, a `--blue-pale` fill on hover (`.16s`), and the 34 x 3px cobalt underline accent at each cell's lower left. Each cell is a cobalt mono kicker (10px, 650, `.15em`) over a Chakra Petch 700 18px ink value. The Review page's required artifact / submission format boxes use the same format. Under 820px the cells stack with a top rule.
- **Must include (Show heading).** The section's own list sits directly under the `Must include` heading, above the fields: a check-marked list in a single column (cobalt check, 14px `--ink-2`, `12px` between items). No box around it.
- **Show pages are one column.** Fields do not sit side by side: text fields and textareas are stacked full width, the confirmation checkboxes are one per line, radio choices (the evidence type, the Problem Scope category) sit side by side in one wrapping row, and the Must include list is a single column. This applies to the Investigate checklist card too.
- **Show fields.** Standard form inputs (Section 17). Answer boxes stay empty; instructions go in the hint above the box, never the placeholder. Field labels are mono 10px uppercase `--muted`; hints are 13px `--muted`.

### 22.3 Pager and autosave

- The Back, Next, Submit and Save draft buttons share one minimum width, `220px`, above 600px. The pager sits in its own full-container canvas band under the page (no rule above it), so Back lines up with the headings' left edge and Next with the content's right edge. Three slots in one row, `space-between`: **Back** on the left, autosave status in the middle, **Next: {section}** on the right. Under 600px the row becomes one column: Back, then Next, each full width, then the status centered underneath.
- **Back** is the strong ghost (Section 9). **Next** is the primary button. The last page has no Next; the first page has no Back.
- **Autosave status:** centered on the row (the pager is a three-column grid, `1fr auto 1fr`, so it stays centered whatever the widths of Back and Next; under 600px Back and Next share one row and the status drops to its own centered line). IBM Plex Mono 11px, 600, `.06em`. It shows whether the page is saved: `Saved` (also the resting state on a freshly opened page) in `--dim`; `Not saved yet` from the first edit until the save starts and `Saving...` while it runs, both in `--ink-2`; `Not saved. Check your connection.` in coral if a save fails. There is **no Save draft button** on an autosaving form. Changes save shortly after typing stops and immediately when a field loses focus.
- All pages of one form stay mounted and are hidden with the `hidden` attribute, never unmounted, so typed answers survive moving between them. A component that sets its own `display` must also set `[hidden] { display: none }`.
- The sidebar lists the sections under the current stage: a mono number and label per row; the open section has the active fill; a locked section shows a lock icon and is not clickable.

### 22.4 Review page and AI-use disclosure

- **Review** is the last page. It shows how the stage is reviewed, then the AI-use disclosure, then the one **primary** Submit button, left-aligned and sized to its content. A muted 13px line under it says what is still missing.
- **Review bands.** The Review page is one stacked band per topic (same layout as 22.1), alternating paper and canvas, starting paper, in this order: **Your answers** (everything the student wrote, in one boxed plane), **How it's reviewed**, **Full rubric**, then **Submit your answers** (live Insight form only; it holds the AI-use disclosure, the closing reflection right above the button, and the button). On a submitted stage there is no Submit band, so the **Closing reflection for Stage N** is its own last band instead. The heading is a mono kicker and the band's title (Chakra Petch 700, the same size as every band heading). **Nothing on this page repeats another page or another band:** the required artifact, format and guiding question are in the hero; the Must include lists are on each Show page; the only fact about what is submitted that the answers box cannot show (worksheets are not uploaded) is one muted footnote under it; "Advances when" / "Sent back for revision when" are in How it's reviewed (side by side), and the short Reviewer checks list shows only for a stage with no full rubric, since the rubric asks the same questions per dimension; the "feedback, revise, resubmit, never penalized" line shows in How it's reviewed unless a Submit band follows, which carries its own reassurance. **Your answers** is a paper plane (`1px --line`, `8px 9px 0 --blue-soft`) of hairline-divided rows: a mono cobalt section title on the left, labeled answers on the right (one column under 720px); yes/no confirmations are a tight check list (cobalt check, dim circle when not confirmed). On the live form it mirrors the fields as typed. **Full rubric** is quiet: a muted "not judging" line, the non-negotiables as one line under a mono label, then the FAQ-style accordion where each dimension opens to plain square-bulleted questions, its note, and a text-link "See the four levels" toggle. **Bands must alternate all the way down, including the Back / Next row:** the row is the opposite tone of the band above it (paper under Review, whose last band is always canvas; paper under Investigate's pages whose last band is a canvas Show or Submit band; canvas under a paper Show band). Set with `pagerTone` on a page. **The Submit button** sits in the Review page's Back / Next row, in Next's slot (in line with Back, on the right), and is a `type="button"` with `aria-disabled` (muted: 55% opacity, `not-allowed` cursor, no lift; see `Button.module.css`) until every required item is done; native `disabled` is not used because it would swallow the click. There is no caption under it; selecting it while unfinished opens a native `<dialog>` (`MissingItemsDialog`): paper panel, square, `12px 14px 0 --blue-soft`, backdrop `rgba(16,33,61,.45)`, a mono kicker, "N things left to finish", and the unfinished items grouped by page under mono labels. Each item is a full-width hairline row with a cobalt `GO`; choosing one closes the dialog, opens that page and focuses the exact field (found by its `name`). The closing reflection is one paragraph set as a lede (`clamp(18px, 2vw, 22px)`, 600) that names the stage's guiding question outright.
- **Rubric disclosures.** One `<details>` per dimension inside a single paper list that uses the FAQ accordion recipe (Section 21.5): stat-box shadow, rows divided by `--line`, question row `20px 24px` at 16.5px 600 ink, hover `--blue-pale`, plus icon of two cobalt bars that turns into a minus, answer `14px 24px 24px`.
- **AI-use disclosure box.** The one warm box on the page, because it is required on every final submit: `--coral-soft` fill, `1px solid rgba(227,94,73,.24)`, square corners, offset plane `8px 9px 0 rgba(227,94,73,.11)`, padding `24px`, `16px` between its parts. Its label is mono 10px uppercase in ink. Radio options inside stay paper. Coral here is a required-attention surface, not decoration.

### 22.5 Ink artifact card

The stage's submission checklist card is the page's one ink panel, the Section 21.5 ink panel recipe scaled for a 900px column: `--ink` fill, no border, padding `48px 48px 32px`, shadow `24px 26px 0 #c8d7f7, 0 38px 70px rgba(16,33,61,.17)`, and the `I³` watermark (Chakra Petch 700 92px, `rgba(255,255,255,.055)`, tracking `-.08em`, top `24px`, right `32px`). Kicker `#b8c8f8`, title Chakra Petch 700 `clamp(24px, 2.6vw, 30px)` white, format line `#c6d0df` 15px / 1.65. Checklist rows are 14px with 18px cobalt-accent checkboxes. Under 820px: padding `32px 24px`, shadow `10px 12px 0 --blue-soft, 0 28px 48px rgba(16,33,61,.13)`, watermark 60px at `top: 16px; right: 20px`.


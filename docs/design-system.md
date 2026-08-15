# I³ League — Canonical Design System v1

Source of truth: the approved `i3-homepage-v20-lower-3-logo.html` homepage.

## 1. Brand Direction

I³ League should feel like a modern national student innovation league: bold, intelligent, optimistic, structured, competitive, and credible enough for students, parents, schools, judges, sponsors, and partners.

The visual concept is **modern innovation lab / competition editorial** — not cyberpunk, not corporate SaaS, not a children's education site, and not a generic AI-generated tech landing page.

The design gets its personality from:

- warm editorial paper surfaces against a cool mineral canvas
- strong ink-navy typography
- collegiate cobalt blue for innovation, progress, and navigation
- coral for action, urgency, and the IP Checkpoint
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
- **Coral — `#E35E49`:** primary semantic action accent, enrollment indicator, IP Checkpoint, occasional contrast marker.
- **Coral soft — `#FBE6E0`:** IP/warning support surface.

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
- Avoid centered body copy except in a deliberate focused moment such as IP Checkpoint.
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

- Small radius: **6px**
- Standard UI radius: **8–10px**
- Buttons: **8px**
- Logo: **8px** outer / **5px** inner frame
- Avoid 20–30px SaaS-card radii.
- Avoid pill-shaped containers except when the semantics truly call for a pill.
- Large editorial surfaces can be completely square.

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
- font: Hanken Grotesk, 14.5px, semibold
- icon: 16px
- hover/active transitions: roughly **160ms**

### Primary

- background: `#10213D`
- text: warm paper `#FFFDF8`
- hard bottom shadow: `0 5px 0 #07142A`
- hover: slightly lighter ink and 1px lift
- active: translate down 3px and reduce hard shadow to 2px

### Secondary / ghost

- translucent warm paper
- subtle ink border
- ink text
- hover border shifts toward blue and text becomes dark cobalt

### Usage

Prefer one dominant primary action per section or major viewport. Do not create several equally loud buttons.

## 10. Navigation

Desktop header:

- sticky
- warm paper at about 94% opacity
- 14px backdrop blur
- subtle bottom border and very soft shadow
- 3-column grid: brand / centered nav / CTA

Nav links:

- 14.5px Hanken Grotesk
- muted navy-gray default
- ink hover
- active page uses a **2px cobalt underline**

Under 900px:

- menu button is 44 × 44px
- dropdown uses warm paper, subtle border, hard offset + soft shadow
- selected mobile item uses a cobalt left rule and pale blue fill

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

`01 Insight — 02 Investigate — 03 Imagine — IP Checkpoint — 04 Iterate — 05 Impact — 06 Influence`

The cube should idle-spin only while the visitor is at the top hero. Scrolling takes control of rotation. Each stage gets a readable hold. Scroll upward is fully reversible. Returning to the top restores the original hero layout; the site must never remain visually stuck at Stage 06.

IP Checkpoint is part of the same choreography: the cube naturally fades/contracts out of its existing anchor, the lock and checkpoint copy occupy the same visual region, then the cube returns and proceeds to 04. Do not switch backgrounds or introduce a new visual style for IP.

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
- IP uses coral number and coral active rule/fill

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
- radius: 8–10px
- padding: 24–32px
- no shadow by default

### Selected / important panel

- paper or blue-pale background
- cobalt left rule or top rule
- optional hard 6–10px pale-blue offset if it needs real prominence

### Form inputs

Recommended canonical treatment:

- height: 46–48px
- background: paper
- 1px `--line-strong` border
- radius: 8px
- Hanken Grotesk 15px
- focus: cobalt 2px border + 3px subtle cobalt focus halo
- error: coral border and explicit error text; never color alone

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
5. Reserve coral for action, IP, warnings, and rare contrast moments.
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

**Typical UI radius:** 6–10px.

**Depth:** offset planes + restrained soft grounding shadows.

**Signature visual:** six-faced I³ journey cube.

**Signature texture:** subtle drafting grid / selectively animated 30px puzzle grid.

**Signature dark moment:** ink structural bridge/final CTA — not a dark entire site.

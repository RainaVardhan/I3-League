"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "@/components/design-system/Button";
import { Cube } from "@/components/design-system/Cube";
import { Eyebrow } from "@/components/design-system/Eyebrow";
import { Checkerboard } from "./Checkerboard";
import styles from "./JourneyHero.module.css";

type RailItem = { num: string; label: string };

// Canonical journey sequence — see docs/design-system.md Section 11.
// Shared between the journey rail, the masthead/watermark readout, and the
// stage-panel content below, so there is exactly one place that defines it.
const RAIL_ITEMS: RailItem[] = [
  { num: "01", label: "Insight" },
  { num: "02", label: "Investigate" },
  { num: "03", label: "Imagine" },
  { num: "04", label: "Iterate" },
  { num: "05", label: "Impact" },
  { num: "06", label: "Influence" },
];

type StagePanel = {
  num: string;
  title: string;
  icant: string;
  body: string;
};

const STAGE_PANELS: StagePanel[] = [
  {
    num: "01 / INSIGHT",
    title: "I Can Think",
    icant: "Critical thinking & problem discovery",
    body: "Every innovation starts with a real problem, not an assignment. Observe, interview the people affected, and write a specific problem statement backed by firsthand evidence, not a hunch.",
  },
  {
    num: "02 / INVESTIGATE",
    title: "I Can Discover Truth",
    icant: "Research & evidence",
    body: "Before you build anything, you dig. Use more than one type of evidence, cross-check your sources, find the root cause, and show the gap in what already exists. Good research can change your mind.",
  },
  {
    num: "03 / IMAGINE",
    title: "I Can Create",
    icant: "Creativity & solution design",
    body: "One idea is a guess. Develop three or more concepts, weigh them in a decision matrix, check for risk, ethics, and originality, then name the one assumption you must test first.",
  },
  {
    num: "04 / ITERATE",
    title: "I Can Test, Fail, Learn & Improve",
    icant: "Build, test & improve",
    body: "Version 1 is never the answer. Build only enough to learn something, run a real test, log what broke and why, revise, then retest the revised version.",
  },
  {
    num: "05 / IMPACT",
    title: "I Can Create Value",
    icant: "Measurable results & honest evidence",
    body: "A working prototype isn't the finish line. Choose a meaningful metric, compare the result to a baseline, and report honestly what changed, what it cost, and what you did not prove.",
  },
  {
    num: "06 / INFLUENCE",
    title: "I Can Communicate & Lead",
    icant: "Communication & leadership",
    body: "An innovation only matters if you can defend it. Tell the story, defend the evidence, answer hard questions, lay out a realistic path forward, and make a clear ask.",
  },
];

// u = "beat" position along the scroll timeline (BEATS[i].u), rx/ry = the
// cube's rotation at that beat — one beat per RAIL_ITEMS/STAGE_PANELS entry.
const BEATS = [
  { u: 1.0, rx: 0, ry: 0 },
  { u: 2.05, rx: 0, ry: -90 },
  { u: 3.1, rx: 0, ry: -180 },
  { u: 4.15, rx: 0, ry: -270 },
  { u: 5.2, rx: -90, ry: -360 },
  { u: 6.25, rx: 90, ry: -360 },
];
const TOTAL = 6.8;
const BASE_RX = -14;
const BASE_RY = 24;

// Below this width, the hero copy moves out of the pinned overlay and into
// normal document flow above the cube card — see the "smaller windows"
// layout note above SMALL_TIER_WIDTH's usage further down.
const SMALL_TIER_WIDTH = 820;

// Gap left between the sticky header and the top of the card once pinned,
// on the small tier — matches JourneyHero.module.css's
// `.stageScrollSticky { top: calc(var(--header-h) + MOBILE_HEADER_GAP) }`
// exactly, so mobileStickyOffsetPx() below (used for both the u/scroll-
// progress math and the progress-bar's click-to-jump math) never drifts
// out of sync with where the card actually locks on screen.
const MOBILE_HEADER_GAP = 20;

// Module-level (not inside a component effect) so both the scroll-jack
// render loop and the progress-bar's scrollToU() can share one
// implementation instead of two copies quietly drifting apart.
function mobileStickyOffsetPx() {
  const headerH = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
  );
  return (Number.isFinite(headerH) ? headerH : 72) + MOBILE_HEADER_GAP;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function smooth(t: number) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

// Position (0-100%) of a given progress-bar stop, matching the journey
// progress fill's own formula below (u=0.35 -> 0%, last beat -> 100%) so a
// stop dot always sits exactly where the fill bar reaches it.
function stopPercent(u: number) {
  const min = 0.35;
  const max = BEATS[BEATS.length - 1].u;
  return clamp(((u - min) / (max - min)) * 100, 0, 100);
}

// The whole bar is clickable, not just a small target at each stop: this
// splits the full 0-100% track into one contiguous range per stop (the
// "back to start" stop at index 0, then one per RAIL_ITEMS entry), split at
// the midpoint between each pair of neighboring stops. Clicking anywhere in
// a range jumps to whichever stop it's closest to. Computed once at module
// load — the stop positions are fixed (derived from the static BEATS
// array), not something that changes per render.
function buildTrackZones() {
  const points = [0, ...RAIL_ITEMS.map((_, i) => stopPercent(BEATS[i].u))];
  const bounds = [0];
  for (let i = 1; i < points.length; i++) {
    bounds.push((points[i - 1] + points[i]) / 2);
  }
  bounds.push(100);
  return points.map((_, i) => ({ left: bounds[i], width: bounds[i + 1] - bounds[i] }));
}
const TRACK_ZONES = buildTrackZones();

// Cube size cascade per docs/design-system.md Section 11 — deliberately
// driven from JS (not CSS) because the Cube primitive sets its --cs custom
// property as an inline style, which a stylesheet media query can't override.
function getCubeSize(width: number) {
  if (width <= 460) return 146;
  if (width <= 820) return 158;
  if (width <= 900) return 200;
  // Widened from 1100 to match JourneyHero.module.css's breakpoint — see
  // the comment on that media query for why.
  if (width <= 1500) return 220;
  return 248;
}

// Shared between the two hero-copy renderings below (the desktop/midsized
// pinned-overlay version and the small-tier normal-flow version) so the
// copy itself only lives in one place.
function HeroCopy({ enrollmentOpenDate }: { enrollmentOpenDate: string }) {
  return (
    <>
      <div className={styles.eyebrowWrap}>
        <Eyebrow>[ Innovate. Impact. Inspire. ]</Eyebrow>
      </div>
      <h1>
        See a problem.
        <br />
        Solve it.
        <br />
        <span className={styles.accent}>Change the world.</span>
      </h1>
      <p className={styles.sub}>
        Choose a real problem. Build evidence. Create, test, and defend a solution that can make a
        measurable difference.
      </p>
      <div className={styles.btnRow}>
        <Button as={Link} href="/login" className={styles.heroBtn}>
          Register Today
        </Button>
        <Button
          as={Link}
          href="/how-it-works"
          variant="ghost"
          className={`${styles.heroBtn} ${styles.heroBtnGhost}`}
        >
          See How It Works
        </Button>
      </div>
      <p className={styles.enrollNote}>Enrollment opens {enrollmentOpenDate}</p>
      <span className={styles.scrollCue}>
        Scroll through the journey
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </span>
    </>
  );
}

export function JourneyHero({ enrollmentOpenDate }: { enrollmentOpenDate: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyElRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const navRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const journeyStartRef = useRef<HTMLButtonElement>(null);
  const journeyCountRef = useRef<HTMLSpanElement>(null);
  const journeyWatermarkRef = useRef<HTMLDivElement>(null);
  const journeyWatermarkNumRef = useRef<HTMLSpanElement>(null);
  const journeyWatermarkNameRef = useRef<HTMLSpanElement>(null);
  const journeyProgressLabelRef = useRef<HTMLSpanElement>(null);
  const journeyProgressFillRef = useRef<HTMLSpanElement>(null);

  const [cubeSize, setCubeSize] = useState(248);

  useEffect(() => {
    const updateSize = () => setCubeSize(getCubeSize(window.innerWidth));
    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stickyEl = stickyElRef.current;
    const cube = cubeRef.current;
    const scene = sceneRef.current;
    const hero = heroRef.current;
    if (!section || !stickyEl || !cube || !scene || !hero) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      // The reduced-motion stylesheet converts the pinned sequence into a
      // static stacked layout — just make sure nothing is left hidden.
      panelRefs.current.forEach((panel) => panel?.removeAttribute("aria-hidden"));
      navRefs.current.forEach((item) => item?.removeAttribute("aria-current"));
      return;
    }

    let idleYaw = 0;
    let visible = true;
    let lastTime = performance.now();
    let rafId = 0;

    // Below SMALL_TIER_WIDTH, the cube card sits in normal flow below a
    // separate (non-pinned) hero intro block, and only locks in place once
    // scrolled up to sit MOBILE_HEADER_GAP below the header — see the two
    // helpers below. Above that width the card behaves exactly as before
    // (pins right under the header, animation starts as soon as it's
    // pinned).
    function heroExtraPx() {
      return window.innerWidth <= SMALL_TIER_WIDTH ? (introRef.current?.offsetHeight ?? 0) : 0;
    }
    function stickyOffsetPx() {
      if (window.innerWidth > SMALL_TIER_WIDTH || !stickyEl) return 0;
      return mobileStickyOffsetPx();
    }

    // Small tier only: the card's height depends on the screen height, but
    // the cube's size does not, so on a short phone a full-size cube would
    // cover the "01 / 06" caption and the watermark/progress row. Measure
    // the free space between them and shrink/center the cube to fit it.
    // CUBE_FOOTPRINT is how tall the rotated cube draws relative to its
    // side length (its corner-on angle plus the 1.08 start scale), with a
    // little breathing room.
    const CUBE_FOOTPRINT = 1.7;
    const fitCube = () => {
      if (window.innerWidth > SMALL_TIER_WIDTH) {
        scene.style.removeProperty("--fit");
        scene.style.removeProperty("--cube-y");
        return;
      }
      const box = stickyEl.getBoundingClientRect();
      const masthead = stickyEl.querySelector<HTMLElement>(`.${styles.journeyMasthead}`);
      const watermark = journeyWatermarkRef.current;
      const progress = stickyEl.querySelector<HTMLElement>(`.${styles.journeyProgress}`);
      if (!masthead || !watermark || !progress) return;
      const top = masthead.getBoundingClientRect().bottom - box.top;
      const bottom =
        Math.min(watermark.getBoundingClientRect().top, progress.getBoundingClientRect().top) -
        box.top;
      const space = bottom - top;
      if (space <= 0) return;
      const size = getCubeSize(window.innerWidth);
      const fit = Math.min(1, space / (size * CUBE_FOOTPRINT));
      scene.style.setProperty("--fit", fit.toFixed(3));
      scene.style.setProperty("--cube-y", `${Math.round(top + space / 2)}px`);
    };

    const setHeight = () => {
      const track = heroExtraPx() + Math.round((TOTAL + 1) * window.innerHeight);
      section.style.height = `${track}px`;
      fitCube();
    };
    setHeight();
    window.addEventListener("resize", setHeight, { passive: true });
    // Web fonts can reflow the small-tier intro block's height after the
    // first measurement — re-measure once they're actually loaded.
    document.fonts?.ready.then(setHeight).catch(() => {});

    function rotationAt(u: number) {
      if (u <= BEATS[0].u) return { rx: BEATS[0].rx, ry: BEATS[0].ry };
      for (let i = 0; i < BEATS.length - 1; i++) {
        const a = BEATS[i];
        const b = BEATS[i + 1];
        if (u >= a.u && u <= b.u) {
          const raw = (u - a.u) / (b.u - a.u);
          const move = smooth(clamp((raw - 0.22) / 0.56, 0, 1));
          return { rx: a.rx + (b.rx - a.rx) * move, ry: a.ry + (b.ry - a.ry) * move };
        }
      }
      return BEATS[BEATS.length - 1];
    }

    function panelOpacity(u: number, index: number) {
      const d = Math.abs(u - BEATS[index].u);
      if (d <= 0.32) return 1;
      if (d >= 0.54) return 0;
      return 1 - smooth((d - 0.32) / 0.22);
    }

    function closestBeat(u: number) {
      let index = 0;
      let dist = Infinity;
      BEATS.forEach((b, i) => {
        const d = Math.abs(u - b.u);
        if (d < dist) {
          dist = d;
          index = i;
        }
      });
      return index;
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { rootMargin: "20% 0%" },
    );
    io.observe(section);

    function render(now: number) {
      if (!section || !cube || !scene || !hero) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const mobile = window.innerWidth <= SMALL_TIER_WIDTH;

      // u=0 (p=0) happens once the card reaches its lock point — right under
      // the header on desktop/midsized (offset ≈ 0), or MOBILE_HEADER_GAP
      // below the header on the small tier (offset = stickyOffsetPx(),
      // minus however much extra scroll the intro block above it adds).
      // Reduces to the original "-rect.top / (TOTAL*vh)" formula when both
      // are 0.
      const animationRange = TOTAL * vh;
      const p =
        animationRange > 0
          ? clamp((stickyOffsetPx() - heroExtraPx() - rect.top) / animationRange, 0, 1)
          : 0;
      const u = p * TOTAL;

      const heroT = smooth(clamp(u / 0.92, 0, 1));
      const dt = Math.min(32, Math.max(0, now - lastTime));
      if (u < 0.045) idleYaw = (idleYaw + dt * 0.0042) % 360;
      const idleContribution = idleYaw * (1 - heroT);

      const heroOffset = mobile ? 0 : Math.min(55, window.innerWidth * 0.04);
      const heroScale = 1.08 - 0.08 * heroT;
      scene.style.setProperty("--heroX", `${Math.round(heroOffset * (1 - heroT))}px`);

      const heroOpacity = 1 - smooth(clamp((u - 0.18) / 0.54, 0, 1));
      hero.style.opacity = String(heroOpacity);
      hero.style.setProperty("--drift", `${Math.round((1 - heroOpacity) * -7)}px`);
      hero.style.pointerEvents = heroOpacity > 0.45 ? "auto" : "none";
      hero.setAttribute("aria-hidden", heroOpacity < 0.05 ? "true" : "false");

      const rot = rotationAt(Math.max(u, BEATS[0].u));
      cube.style.transform = `rotateX(${BASE_RX + rot.rx}deg) rotateY(${BASE_RY + idleContribution + rot.ry}deg)`;

      scene.style.opacity = "1";
      scene.style.setProperty("--sceneScale", heroScale.toFixed(3));
      scene.style.pointerEvents = "auto";
      scene.setAttribute("aria-hidden", "false");

      const active = u < 0.58 ? -1 : closestBeat(u);

      if (journeyProgressFillRef.current) {
        const progress = clamp((u - 0.35) / (BEATS[BEATS.length - 1].u - 0.35), 0, 1);
        journeyProgressFillRef.current.style.width = `${(progress * 100).toFixed(2)}%`;
      }
      if (active < 0) {
        if (journeyCountRef.current) journeyCountRef.current.textContent = "Journey overview";
        if (journeyWatermarkNumRef.current) journeyWatermarkNumRef.current.textContent = "I³";
        if (journeyWatermarkNameRef.current)
          journeyWatermarkNameRef.current.textContent = "Innovation journey";
        if (journeyProgressLabelRef.current)
          journeyProgressLabelRef.current.textContent = "Scroll to begin";
      } else {
        const display = RAIL_ITEMS[active];
        if (journeyCountRef.current) journeyCountRef.current.textContent = `${display.num} / 06`;
        if (journeyWatermarkNumRef.current) journeyWatermarkNumRef.current.textContent = display.num;
        if (journeyWatermarkNameRef.current)
          journeyWatermarkNameRef.current.textContent = display.label;
        if (journeyProgressLabelRef.current)
          journeyProgressLabelRef.current.textContent = `${display.num} · ${display.label}`;
      }

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const opacity = panelOpacity(u, i);
        panel.style.opacity = String(opacity);
        panel.style.pointerEvents = opacity > 0.55 ? "auto" : "none";
        panel.style.setProperty("--slide", `${(1 - opacity) * 10}px`);
        panel.setAttribute("aria-hidden", opacity > 0.55 ? "false" : "true");
      });

      navRefs.current.forEach((item, i) => {
        if (!item) return;
        const activeNow = i === active;
        item.classList.toggle(styles.isActive, activeNow);
        if (activeNow) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });

      if (journeyStartRef.current) {
        const startActive = active < 0;
        journeyStartRef.current.classList.toggle(styles.isActive, startActive);
        if (startActive) journeyStartRef.current.setAttribute("aria-current", "step");
        else journeyStartRef.current.removeAttribute("aria-current");
      }

      lastTime = now;
    }

    function frame(now: number) {
      if (visible) render(now);
      else lastTime = now;
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", setHeight);
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Progress-bar navigation: clicking or arrow-keying a stop jumps the
  // scroll position to that beat. Mirrors the render-loop's progress
  // formula above (see the comment there) so a jump lands exactly where
  // the animation would naturally put you at that beat. u=0 is the very
  // start of the pinned sequence — before BEATS[0] — which is where the
  // hero copy ("See a problem. Solve it. Change the world.") is fully
  // visible, so it doubles as the "back to the original screen" target.
  function scrollToU(u: number) {
    const section = sectionRef.current;
    if (!section) return;
    const vh = window.innerHeight;
    const mobile = window.innerWidth <= SMALL_TIER_WIDTH;
    const heroExtra = mobile ? (introRef.current?.offsetHeight ?? 0) : 0;
    const stickyOffset = mobile ? mobileStickyOffsetPx() : 0;
    const outerDocTop = window.scrollY + section.getBoundingClientRect().top;
    const target = outerDocTop + heroExtra - stickyOffset + u * vh;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  function scrollToBeat(index: number) {
    const beat = BEATS[index];
    if (!beat) return;
    scrollToU(beat.u);
  }

  function scrollToStart() {
    scrollToU(0);
  }

  // The progress bar's stops are always laid out in a single horizontal
  // row (unlike the old vertical/horizontal rail), so arrow-key navigation
  // between them is always left/right. Index -1 means the leading "back to
  // start" stop; 0-6 are the RAIL_ITEMS stops.
  function handleStopKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -1 : 1;
    const stops = [journeyStartRef.current, ...navRefs.current];
    const target = clamp(index + 1 + delta, 0, stops.length - 1);
    stops[target]?.focus();
  }

  return (
    <section ref={sectionRef} className={styles.stageScroll} aria-label="I³ League introduction and the six stages">
      {/* Smaller-window-only: normal-flow hero copy, shown above the cube
          card instead of overlaid on it — see docs/design-system.md and the
          SMALL_TIER_WIDTH comment above. Hidden above 820px, where the
          overlaid .heroText version below is used instead. A second
          <Checkerboard /> instance here (the other lives inside
          .stageScrollSticky below) gives the hero copy the same grid
          background as the card — .mobileIntro is a separate, non-sticky
          block above the card, so the card's own instance can't reach up
          into it. fadeEdge="top"/"bottom" fade only the outer edge of each
          instance (not the edge where they meet) — combined with the
          shared background-attachment:fixed on .checkerboard keeping both
          instances' grid phase aligned to the viewport, the two read as
          one continuous grid instead of two separately-faded blocks with
          a visible seam between them. */}
      <div ref={introRef} className={styles.mobileIntro}>
        <Checkerboard fadeEdge="top" />
        <HeroCopy enrollmentOpenDate={enrollmentOpenDate} />
      </div>

      <div ref={stickyElRef} className={styles.stageScrollSticky}>
        <Checkerboard fadeEdge="bottom" />

        <div className={styles.journeyMasthead} aria-hidden="true">
          <span className={styles.jmLabel}>I³ Journey</span>
          <span />
          <span ref={journeyCountRef} className={styles.jmCount}>
            Journey overview
          </span>
        </div>

        {/* Watermark + progress bar as one flex row (desktop/midsized/900px
            tiers — display:contents at <=820px hands each child back its
            own independent positioning, unchanged from before). Fixes two
            things reported together: the pair needed to sit higher, and
            the gap between the watermark digit and the progress bar was
            inconsistent — the digit's width scales with viewport (a clamp
            font-size) while the progress bar used to start at a fixed
            offset, so at some widths they'd nearly touch and at others
            there'd be a big gap. A shared flex row with `gap` computes the
            spacing from the digit's actual rendered width every time. */}
        <div className={styles.journeyBottomRow}>
          <div ref={journeyWatermarkRef} className={styles.journeyWatermark} aria-hidden="true">
            <span ref={journeyWatermarkNumRef} className={styles.jwNum}>
              I³
            </span>
            <span ref={journeyWatermarkNameRef} className={styles.jwName}>
              Innovation journey
            </span>
          </div>

          <nav className={styles.journeyProgress} aria-label="I³ journey stages">
            <span ref={journeyProgressLabelRef} className={styles.jpLabel}>
              Scroll to begin
            </span>
            <span className={styles.jpTrack}>
              <span ref={journeyProgressFillRef} className={styles.jpFill} />
              <span className={styles.jpStops}>
                <button
                  type="button"
                  ref={journeyStartRef}
                  className={styles.jpStop}
                  style={{ left: `${TRACK_ZONES[0].left}%`, width: `${TRACK_ZONES[0].width}%` }}
                  aria-label="Back to start: See a problem. Solve it. Change the world."
                  onClick={scrollToStart}
                  onKeyDown={(event) => handleStopKeyDown(event, -1)}
                />
                {RAIL_ITEMS.map((item, index) => (
                  <button
                    key={item.num}
                    type="button"
                    ref={(el) => {
                      navRefs.current[index] = el;
                    }}
                    className={styles.jpStop}
                    style={{
                      left: `${TRACK_ZONES[index + 1].left}%`,
                      width: `${TRACK_ZONES[index + 1].width}%`,
                    }}
                    aria-label={`${item.num} ${item.label}`}
                    onClick={() => scrollToBeat(index)}
                    onKeyDown={(event) => handleStopKeyDown(event, index)}
                  />
                ))}
              </span>
            </span>
          </nav>
        </div>

        {/* Desktop/midsized-only: overlaid on the card. Hidden at/below
            820px, where .mobileIntro above is used instead. */}
        <div ref={heroRef} className={styles.heroText}>
          <HeroCopy enrollmentOpenDate={enrollmentOpenDate} />
        </div>

        {/* Clips the cube to the box's exact rectangle (clip-path values
            mirror .stageScrollSticky::before/after at every breakpoint —
            see JourneyHero.module.css). The cube's own scaled/rotated
            visual footprint can extend well past its nominal size — up to
            ~50% further at a corner-on angle during the idle spin — so
            without this it can visually spill into the journey rail or
            past the box's edge. Clipping makes "cube never leaves its box"
            true by construction instead of something to keep re-verifying
            by hand at every breakpoint. */}
        <div className={styles.cubeClip}>
          <div ref={sceneRef} className={styles.cubeSceneWrapper}>
            <Cube ref={cubeRef} size={cubeSize} idleSpin={false} />
          </div>
        </div>

        {STAGE_PANELS.map((panel, i) => (
          <div
            key={panel.num}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={styles.stagePanel}
          >
            <span className={styles.panelNum}>{panel.num}</span>
            <h3>{panel.title}</h3>
            <p className={styles.icant}>{panel.icant}</p>
            <p>{panel.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { StageName } from "@prisma/client";
import type { ReactNode } from "react";
import styles from "./StageCard.module.css";

type CardStage = StageName | "COMPLETE";

// The dashboard hero's right-slot widget: a static "stage card" laid out
// after the company's Stage Icon System cards (01-insight.html …
// 06-influence.html). Deliberately spare: the stage icon is the focus, with
// just the number + tag rule above it and the stage name + keyword line
// below. The stage's core question and description already appear in the
// "Current stage" section directly under the hero, so they are not repeated
// here. Rebuilt on design-system tokens: straight corners, the
// paper/hairline/offset-shadow widget family shared with the marketing hero
// widgets, a flat --blue-pale image panel (no gradients), and Chakra Petch
// (name) + IBM Plex Mono (labels).
export function StageCard({ stage }: { stage: CardStage }) {
  const meta = META[stage];
  return (
    <article className={styles.card} aria-hidden="true">
      <div className={styles.top}>
        <span className={styles.num}>{meta.num}</span>
        <span className={styles.rule} />
        <span className={styles.tag}>{meta.tag}</span>
      </div>
      <div className={styles.panel}>{ICONS[stage]}</div>
      <h2 className={styles.name}>{meta.name}</h2>
      <p className={styles.keywords}>{meta.keywords}</p>
    </article>
  );
}

const META: Record<CardStage, { num: string; tag: string; name: string; keywords: string }> = {
  INSIGHT: { num: "01", tag: "PEOPLE", name: "Insight", keywords: "UNDERSTAND / LISTEN / DEFINE" },
  INVESTIGATE: {
    num: "02",
    tag: "EVIDENCE",
    name: "Investigate",
    keywords: "RESEARCH / ANALYZE / SYNTHESIZE",
  },
  IMAGINE: { num: "03", tag: "IDEAS", name: "Imagine", keywords: "IDEATE / COMPARE / CHOOSE" },
  ITERATE: { num: "04", tag: "PROTOTYPE", name: "Iterate", keywords: "BUILD / LEARN / IMPROVE" },
  IMPACT: { num: "05", tag: "CHANGE", name: "Impact", keywords: "MEASURE / COMPARE / LEARN" },
  INFLUENCE: { num: "06", tag: "ADVOCACY", name: "Influence", keywords: "SHARE / PERSUADE / MOBILIZE" },
  COMPLETE: { num: "06", tag: "COMPLETE", name: "Complete", keywords: "SHOWCASE / DEFEND / QUALIFY" },
};

// Ported from the company's Stage Icon System cards, with design-system
// tokens swapped in for the source hexes that have one (var(--blue) /
// var(--ink) / var(--paper) / var(--coral)); the intermediate blue tints
// (#7697D7, #B8CAE7, #83A4DE, #AFC5E9) have no token, so they stay literal.
// Each source icon draws its content in a different sub-region of the
// original 104×104 canvas, so the `viewBox` on each is tightened to that
// icon's own content box (kept square, with a small even margin) — that is
// what makes all six read at a consistent size and stay centred in the
// panel instead of floating small.
const ICONS: Record<CardStage, ReactNode> = {
  INSIGHT: (
    <svg viewBox="11 10 83 83" fill="none">
      <circle cx="38" cy="31" r="13" fill="var(--blue)" />
      <path d="M19 76c0-16 8-27 19-27s19 11 19 27" fill="var(--blue)" />
      <circle cx="69" cy="68" r="18" fill="var(--paper)" stroke="var(--blue-soft)" strokeWidth="1.5" />
      <path
        d="M61 68l6 6 11-13"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  INVESTIGATE: (
    <svg viewBox="9 9 90 90" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="23" cy="29" r="6" fill="#83A4DE" />
      <circle cx="23" cy="49" r="6" fill="#83A4DE" />
      <circle cx="23" cy="69" r="6" fill="#83A4DE" />
      <path d="M36 29h28M36 49h22M36 69h16" stroke="#AFC5E9" strokeWidth="5" />
      <circle cx="68" cy="63" r="15" stroke="var(--blue)" strokeWidth="5" />
      <path d="M79 74l12 12" stroke="var(--blue)" strokeWidth="5" />
    </svg>
  ),
  IMAGINE: (
    <svg viewBox="-12 -18 138 138" fill="none">
      <circle cx="12" cy="58" r="12" fill="#B8CAE7" />
      <circle cx="42" cy="58" r="12" fill="#B8CAE7" />
      <circle cx="98" cy="58" r="14" fill="var(--blue)" />
      {/* An arrow (shaft + solid triangular head) centered in the gap
          between the second dot and the blue dot, touching neither. */}
      <path
        d="M58 58h13"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M70 50l10 8-10 8z" fill="var(--ink)" />
      {/* Spark above the blue dot, clear of it. */}
      <g stroke="var(--coral)" strokeWidth="3.5" strokeLinecap="round">
        <path d="M98 39v-10" />
        <path d="M88 41l-5-8" />
        <path d="M108 41l5-8" />
      </g>
    </svg>
  ),
  ITERATE: (
    <svg viewBox="18 18 68 68" fill="none">
      <rect x="39" y="39" width="26" height="26" rx="3" fill="var(--blue)" />
      <g fill="none" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 52a28 28 0 0 1 49-18" />
        <path d="M72 24v13H59" />
        <path d="M80 52a28 28 0 0 1-49 18" />
        <path d="M32 80V67h13" />
      </g>
    </svg>
  ),
  IMPACT: (
    <svg viewBox="10 16 84 84" fill="none">
      <rect x="18" y="56" width="24" height="26" rx="2" fill="#B8CAE7" />
      <rect x="63" y="35" width="24" height="47" rx="2" fill="var(--blue)" />
      <path d="M45 57h13" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M53 49l8 8-8 8"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  INFLUENCE: (
    <svg viewBox="10 5 82 82" fill="none">
      <rect x="18" y="28" width="54" height="44" rx="4" fill="none" stroke="#7697D7" strokeWidth="5" />
      <g stroke="#7697D7" strokeWidth="5" strokeLinecap="round">
        <path d="M29 42h31" />
        <path d="M29 53h24" />
        <path d="M29 64h18" />
      </g>
      <path d="M67 38l18-18" stroke="var(--blue)" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M75 20h10v10"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  COMPLETE: (
    <svg viewBox="10 10 83 83" fill="none">
      <circle cx="52" cy="52" r="34" fill="var(--blue)" />
      <path
        d="M38 53l10 10 20-23"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

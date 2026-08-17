"use client";

import { useEffect, useRef } from "react";
import styles from "./Checkerboard.module.css";

const CELL = 30;
const PIECE_COUNT = 12;
const COLORS = [
  "rgba(49,88,216,.18)",
  "rgba(49,88,216,.26)",
  "rgba(227,94,73,.18)",
  "rgba(16,33,61,.10)",
  "rgba(216,227,251,.75)",
];

type CheckerboardProps = {
  // Which outer edge gets the soft fade — the other edge stays fully
  // opaque. Used when two instances sit back-to-back (the small-tier hero
  // copy's instance and the card's instance) so the shared seam between
  // them reads as one continuous grid instead of both independently
  // fading toward each other and creating a visible gap band. Omit for a
  // single, self-contained instance that fades on both edges (the default
  // .checkerboard rule).
  fadeEdge?: "top" | "bottom";
  // Lets a consumer override the base rule's position (top/bottom/left/
  // right are hard-coded to JourneyHero's own --split-x-based card
  // geometry) — pass a class from the consumer's own CSS module with
  // `!important` overrides, same pattern as FinalCta.module.css's
  // .eyebrowWrap/.btn.
  className?: string;
};

// Purely decorative: a handful of 30px grid cells intermittently flip in
// place, independent of scroll. Runs entirely on refs/DOM so it never
// triggers a React re-render — see docs/design-system.md Section 8.
export function Checkerboard({ fadeEdge, className }: CheckerboardProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checker = containerRef.current;
    if (!checker) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let generation = 0;
    const pieces: HTMLSpanElement[] = [];
    const timeouts: number[] = [];

    const mod = (n: number, m: number) => ((n % m) + m) % m;

    // Two separate <Checkerboard> instances (the small-tier hero copy's and
    // the card's — see JourneyHero.tsx) sit at different, dynamically-sized
    // offsets on the page, but need to read as windows onto one continuous
    // grid rather than each restarting its own phase at its own top-left
    // corner. That used to be solved with background-attachment: fixed
    // (viewport-anchored), but that decouples the *visual* grid position
    // from this box's own position: the box scrolls with the page while a
    // fixed background does not, so pieces — which are plain local
    // left/top offsets inside the box — drifted off the grid lines as soon
    // as the page scrolled between one piece placement and the next.
    //
    // Instead, this measures the mismatch between this box's own top-left
    // corner and the nearest grid line *once* (on mount and on resize) and
    // bakes it into background-position via a CSS var, so the background
    // and this box move together as one rigid unit — nothing needs to
    // track scroll at all, and the cross-instance alignment still holds
    // because both instances compute their own phase the same way.
    let phase = { x: 0, y: 0 };

    function measurePhase() {
      const rect = checker!.getBoundingClientRect();
      // getBoundingClientRect() returns sub-pixel floats. Rounded to whole
      // device pixels here so the background-position CSS var and each
      // piece's inline left/top round to the *same* pixel independently —
      // otherwise the two can land a device pixel apart and show up as a
      // hairline double edge where a piece's border nearly, but doesn't
      // quite, coincide with the grid line underneath it.
      phase = { x: Math.round(mod(-rect.left, CELL)), y: Math.round(mod(-rect.top, CELL)) };
      checker!.style.setProperty("--grid-phase-x", `${phase.x}px`);
      checker!.style.setProperty("--grid-phase-y", `${phase.y}px`);
    }

    function cellDimensions() {
      return {
        cols: Math.max(1, Math.floor((checker!.clientWidth - phase.x) / CELL)),
        rows: Math.max(1, Math.floor((checker!.clientHeight - phase.y) / CELL)),
      };
    }

    function randomCell(used: Set<string>) {
      const { cols, rows } = cellDimensions();
      let key = "0:0";
      for (let i = 0; i < 60; i++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        key = `${x}:${y}`;
        if (!used.has(key)) return { x, y, key };
      }
      const fallbackX = Math.floor(Math.random() * cols);
      const fallbackY = Math.floor(Math.random() * rows);
      return { x: fallbackX, y: fallbackY, key: `${fallbackX}:${fallbackY}` };
    }

    function placePiece(el: HTMLSpanElement, used: Set<string>) {
      const cell = randomCell(used);
      used.add(cell.key);
      el.dataset.cell = cell.key;
      el.style.left = `${phase.x + cell.x * CELL}px`;
      el.style.top = `${phase.y + cell.y * CELL}px`;
    }

    function animatePiece(el: HTMLSpanElement, token: number) {
      if (token !== generation || !checker!.contains(el)) return;
      const used = new Set<string>();
      pieces.forEach((p) => {
        if (p !== el && p.dataset.active === "1") used.add(p.dataset.cell ?? "");
      });
      const cell = randomCell(used);
      el.dataset.cell = cell.key;
      el.dataset.active = "1";
      el.style.left = `${phase.x + cell.x * CELL}px`;
      el.style.top = `${phase.y + cell.y * CELL}px`;
      el.style.setProperty("--piece-color", COLORS[Math.floor(Math.random() * COLORS.length)]);
      const duration = 1600 + Math.floor(Math.random() * 1600);
      const axisClass = Math.random() > 0.5 ? styles.flipY : styles.flipX;
      el.style.setProperty("--piece-duration", `${duration}ms`);
      // Reset then re-apply the animation class on the next frame so the
      // flip animation restarts instead of being a no-op class toggle.
      el.className = styles.piece;
      void el.offsetWidth;
      el.className = `${styles.piece} ${axisClass}`;
      timeouts.push(
        window.setTimeout(() => {
          if (token === generation) el.dataset.active = "0";
        }, duration * 0.75),
      );
      timeouts.push(
        window.setTimeout(() => animatePiece(el, token), duration + 900 + Math.random() * 2600),
      );
    }

    function buildPieces() {
      generation += 1;
      const token = generation;
      measurePhase();
      checker!.querySelectorAll(`.${styles.piece}`).forEach((node) => node.remove());
      pieces.length = 0;
      const used = new Set<string>();
      for (let i = 0; i < PIECE_COUNT; i++) {
        const piece = document.createElement("span");
        piece.className = styles.piece;
        checker!.appendChild(piece);
        placePiece(piece, used);
        piece.dataset.active = "0";
        pieces.push(piece);
        timeouts.push(window.setTimeout(() => animatePiece(piece, token), 300 + Math.random() * 2200));
      }
    }

    let resizeTimer: number | undefined;
    buildPieces();
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildPieces, 180);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      generation += 1; // invalidates any in-flight animatePiece timeouts
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const fadeClass =
    fadeEdge === "top" ? styles.fadeTopOnly : fadeEdge === "bottom" ? styles.fadeBottomOnly : "";
  const combinedClassName = [styles.checkerboard, fadeClass, className].filter(Boolean).join(" ");
  return <div ref={containerRef} className={combinedClassName} aria-hidden="true" />;
}

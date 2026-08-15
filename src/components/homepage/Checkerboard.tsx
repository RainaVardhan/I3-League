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
};

// Purely decorative: a handful of 30px grid cells intermittently flip in
// place, independent of scroll. Runs entirely on refs/DOM so it never
// triggers a React re-render — see docs/design-system.md Section 8.
export function Checkerboard({ fadeEdge }: CheckerboardProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checker = containerRef.current;
    if (!checker) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let generation = 0;
    const pieces: HTMLSpanElement[] = [];
    const timeouts: number[] = [];

    const mod = (n: number, m: number) => ((n % m) + m) % m;

    // The grid lines behind these pieces come from .checkerboard's
    // background, which is background-attachment: fixed — anchored to the
    // *viewport*, not to this container (see the comment on that rule: it's
    // what keeps two side-by-side <Checkerboard> instances reading as one
    // continuous pattern instead of each restarting its own grid phase at
    // its own top-left corner). Pieces are positioned in *local* px offsets
    // though, so without this correction they line up with a grid that
    // starts at this container's own (0,0) — which only matches the actual
    // (viewport-phased) grid lines when the container's edge happens to
    // land on an exact CELL multiple. This measures that mismatch, fresh
    // each time (the container can be mid-scroll, e.g. .mobileIntro's
    // instance isn't sticky), so placed pieces snap to real grid cells.
    function gridPhase() {
      const rect = checker!.getBoundingClientRect();
      return { x: mod(-rect.left, CELL), y: mod(-rect.top, CELL) };
    }

    function cellDimensions() {
      const phase = gridPhase();
      return {
        cols: Math.max(1, Math.floor((checker!.clientWidth - phase.x) / CELL)),
        rows: Math.max(1, Math.floor((checker!.clientHeight - phase.y) / CELL)),
        phase,
      };
    }

    function randomCell(used: Set<string>) {
      const { cols, rows, phase } = cellDimensions();
      let key = "0:0";
      for (let i = 0; i < 60; i++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        key = `${x}:${y}`;
        if (!used.has(key)) return { x, y, key, phase };
      }
      const fallbackX = Math.floor(Math.random() * cols);
      const fallbackY = Math.floor(Math.random() * rows);
      return { x: fallbackX, y: fallbackY, key: `${fallbackX}:${fallbackY}`, phase };
    }

    function placePiece(el: HTMLSpanElement, used: Set<string>) {
      const cell = randomCell(used);
      used.add(cell.key);
      el.style.left = `${cell.phase.x + cell.x * CELL}px`;
      el.style.top = `${cell.phase.y + cell.y * CELL}px`;
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
      el.style.left = `${cell.phase.x + cell.x * CELL}px`;
      el.style.top = `${cell.phase.y + cell.y * CELL}px`;
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
  return (
    <div
      ref={containerRef}
      className={fadeClass ? `${styles.checkerboard} ${fadeClass}` : styles.checkerboard}
      aria-hidden="true"
    />
  );
}

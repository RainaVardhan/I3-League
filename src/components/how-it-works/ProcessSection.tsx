"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/design-system/Eyebrow";
import { buildSteps, type Step } from "./steps";
import styles from "./ProcessSection.module.css";

const VARIANT_CLASS: Record<NonNullable<Step["variant"]>, string> = {
  deadline: styles.isDeadline,
};

type ProcessSectionProps = {
  springQualifyDeadline: string;
  summerQualifyDeadline: string;
};

export function ProcessSection({ springQualifyDeadline, summerQualifyDeadline }: ProcessSectionProps) {
  const STEPS = buildSteps(springQualifyDeadline, summerQualifyDeadline);
  const shellRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const firstNumRef = useRef<HTMLSpanElement>(null);
  const lastNumRef = useRef<HTMLSpanElement>(null);
  const railMaskRef = useRef<HTMLSpanElement>(null);
  const maxRevealedRef = useRef(-1);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());

  function toggleStep(index: number) {
    setOpenSteps((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Steps fade/slide in as they scroll into view, and the rail next to them
  // fills to match — both are progressive enhancement. Steps are visible by
  // default in CSS (see .step in the module); the "start hidden, animate
  // in" behavior only turns on once .animated lands on the list, so nothing
  // stays invisible if this effect never runs (JS disabled, a bug, etc).
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      stepRefs.current.forEach((el) => el?.classList.add(styles.revealed));
      if (railMaskRef.current) railMaskRef.current.style.clipPath = "inset(100% 0 0 0)";
      return;
    }

    listRef.current?.classList.add(styles.animated);

    function revealUpTo(index: number) {
      if (index <= maxRevealedRef.current) return;
      maxRevealedRef.current = index;
      const progress = ((index + 1) / stepRefs.current.length) * 100;
      if (railMaskRef.current) {
        railMaskRef.current.style.clipPath = `inset(${progress}% 0 0 0)`;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = stepRefs.current.indexOf(entry.target as HTMLLIElement);
          if (index === -1) return;
          entry.target.classList.add(styles.revealed);
          revealUpTo(index);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Keep the rail's top/bottom pinned to the actual first/last badge
  // centers rather than the fixed pixel guesses this used to hardcode in
  // CSS. Those broke three ways: they don't match the badges' real
  // position at every breakpoint (badge size/padding both change at
  // 900px/820px); opening the first or last step's own detail panel
  // changes the shell's height, so a fixed "58px from the bottom" no
  // longer lands on the last badge, it lands inside the newly opened text
  // below it; and the scroll-reveal slide-in (see the effect above) moves
  // each badge via `transform`, which — unlike a real layout/size change —
  // a ResizeObserver never sees, so without the transitionend listener
  // below this would permanently measure each badge's pre-animation
  // position instead of where it actually ends up on screen.
  useEffect(() => {
    function syncRailBounds() {
      const shell = shellRef.current;
      const firstNum = firstNumRef.current;
      const lastNum = lastNumRef.current;
      if (!shell || !firstNum || !lastNum) return;

      const shellRect = shell.getBoundingClientRect();
      const firstRect = firstNum.getBoundingClientRect();
      const lastRect = lastNum.getBoundingClientRect();
      const firstCenter = firstRect.top + firstRect.height / 2 - shellRect.top;
      const lastCenter = lastRect.top + lastRect.height / 2 - shellRect.top;
      // Every badge sits at the same horizontal position (it's a vertical
      // list), so any one of them — first is as good as any — gives the
      // rail's true center column. Same reasoning as top/bottom: the old
      // hardcoded per-breakpoint `left` values (104px/96px/55px) were
      // guesses that drifted out of sync with the badge's real position,
      // most visibly at the 900px breakpoint.
      const centerX = firstRect.left + firstRect.width / 2 - shellRect.left;

      shell.style.setProperty("--rail-top", `${firstCenter}px`);
      shell.style.setProperty("--rail-bottom", `${shellRect.height - lastCenter}px`);
      shell.style.setProperty("--rail-left", `${centerX}px`);
    }

    syncRailBounds();

    const list = listRef.current;

    const resizeObserver = new ResizeObserver(syncRailBounds);
    if (list) resizeObserver.observe(list);

    function handleTransitionEnd(event: TransitionEvent) {
      if (event.propertyName !== "transform") return;
      if (!(event.target as HTMLElement).classList.contains(styles.step)) return;
      syncRailBounds();
    }
    list?.addEventListener("transitionend", handleTransitionEnd);

    window.addEventListener("resize", syncRailBounds);

    return () => {
      resizeObserver.disconnect();
      list?.removeEventListener("transitionend", handleTransitionEnd);
      window.removeEventListener("resize", syncRailBounds);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="process-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>THE PATH</Eyebrow>
          {/* Visually hidden: keeps a real heading in the outline for
              screen-reader heading navigation now that the visible copy
              underneath the eyebrow was trimmed away. */}
          <h2 id="process-title" className="sr-only">
            The path
          </h2>
        </div>

        <div ref={shellRef} className={styles.shell}>
          <span className={styles.rail} aria-hidden="true" />
          <span ref={railMaskRef} className={styles.railMask} aria-hidden="true" />
          <ol ref={listRef} className={styles.list}>
            {STEPS.map((step, index) => {
              const isOpen = openSteps.has(index);
              const detailId = `step-detail-${step.number}`;
              const isFirst = index === 0;
              const isLast = index === STEPS.length - 1;
              return (
                <li
                  key={step.number}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={detailId}
                    onClick={() => toggleStep(index)}
                    className={
                      step.variant ? `${styles.step} ${VARIANT_CLASS[step.variant]}` : styles.step
                    }
                  >
                    <span
                      ref={(el) => {
                        if (isFirst) firstNumRef.current = el;
                        if (isLast) lastNumRef.current = el;
                      }}
                      className={styles.num}
                    >
                      {step.number}
                    </span>
                    <h3 className={styles.title}>{step.title}</h3>
                    <p className={styles.stepCopy}>{step.copy}</p>
                    <span className={styles.metaRow}>
                      <span className={styles.meta}>{step.meta}</span>
                      <svg
                        className={isOpen ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={detailId}
                    className={isOpen ? `${styles.detail} ${styles.detailOpen}` : styles.detail}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.detailInner}>
                      <p>{step.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

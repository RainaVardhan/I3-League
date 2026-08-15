import { Button } from "@/components/design-system/Button";
import { Cube } from "@/components/design-system/Cube";
import { Eyebrow } from "@/components/design-system/Eyebrow";
import { GridBackground } from "@/components/design-system/GridBackground";
import { Logo } from "@/components/design-system/Logo";
import { Panel } from "@/components/design-system/Panel";
import styles from "./page.module.css";

// Internal style guide — not a real app page. Lets us eyeball every token
// and component together before wiring them into actual screens. Not linked
// from anywhere yet; visit /design-system directly.
const COLOR_SWATCHES = [
  { name: "--canvas", label: "canvas" },
  { name: "--paper", label: "paper" },
  { name: "--paper-warm", label: "paper-warm" },
  { name: "--ink", label: "ink" },
  { name: "--ink-2", label: "ink-2" },
  { name: "--muted", label: "muted" },
  { name: "--dim", label: "dim" },
  { name: "--blue", label: "blue (cobalt)" },
  { name: "--blue-dark", label: "blue-dark" },
  { name: "--blue-soft", label: "blue-soft" },
  { name: "--blue-pale", label: "blue-pale" },
  { name: "--coral", label: "coral" },
  { name: "--coral-soft", label: "coral-soft" },
];

export default function DesignSystemPage() {
  return (
    <div className={styles.page}>
      <GridBackground />
      <div className={styles.wrap}>
        <section className={styles.section}>
          <Eyebrow variant="label">Design System v1</Eyebrow>
          <h1 className={styles.h1}>I³ League</h1>
          <p className={styles.lede}>
            Light innovation-lab / editorial system: cool mineral canvas, warm
            paper, ink-navy type, cobalt for progress, coral reserved for
            action + the IP Checkpoint. Source of truth:{" "}
            <code>docs/design-system.md</code>.
          </p>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">Logo</Eyebrow>
          <div className={styles.row}>
            <Panel>
              <Logo />
            </Panel>
          </div>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">Color</Eyebrow>
          <div className={styles.swatchGrid}>
            {COLOR_SWATCHES.map((c) => (
              <div key={c.name} className={styles.swatch}>
                <div
                  className={styles.swatchColor}
                  style={{ background: `var(${c.name})` }}
                />
                <div className={styles.swatchLabel}>{c.label}</div>
                <div className={styles.swatchToken}>{c.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">Type</Eyebrow>
          <p className={styles.typeRow}>
            <span className={styles.typeLabel}>display / Chakra Petch</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-card)",
                fontWeight: 700,
              }}
            >
              See a problem. Solve it.
            </span>
          </p>
          <p className={styles.typeRow}>
            <span className={styles.typeLabel}>body / Hanken Grotesk</span>
            <span
              style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)" }}
            >
              Choose a real problem. Build evidence. Create, test, and defend
              a solution.
            </span>
          </p>
          <p className={styles.typeRow}>
            <span className={styles.typeLabel}>mono / IBM Plex Mono</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              01 / Insight — National Student Innovation League
            </span>
          </p>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">Eyebrows</Eyebrow>
          <div className={styles.row}>
            <Eyebrow variant="eyebrow">National Student Innovation League</Eyebrow>
            <Eyebrow variant="label">Problem Fields</Eyebrow>
          </div>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">Buttons</Eyebrow>
          <div className={styles.row}>
            <Button variant="primary">Start Your Innovation</Button>
            <Button variant="ghost">See How It Works</Button>
          </div>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">Panels</Eyebrow>
          <div className={styles.panelGrid}>
            <Panel variant="standard">
              <p style={{ color: "var(--muted)" }}>
                Standard panel — paper background, hairline border, no shadow.
              </p>
            </Panel>
            <Panel variant="selected" prominent>
              <p style={{ color: "var(--ink-2)" }}>
                Selected panel — blue-pale fill, cobalt left rule, hard offset
                shadow for real prominence.
              </p>
            </Panel>
          </div>
        </section>

        <section className={styles.section}>
          <Eyebrow variant="label">
            Cube — the signature six-faced journey visual
          </Eyebrow>
          <div className={styles.cubeRow}>
            <Cube size={200} />
          </div>
        </section>
      </div>
    </div>
  );
}

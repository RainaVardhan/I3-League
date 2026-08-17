import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./DistinctionSection.module.css";

type DistinctionSectionProps = {
  springQualifyDeadline: string;
  summerQualifyDeadline: string;
};

// Formerly the standalone Eligibility page's "joining vs qualifying"
// section — the site owner decided against a separate Eligibility page and
// asked for its content folded into whichever existing pages fit best. This
// lands here, after ProcessSection's step-by-step path, since it's the
// natural follow-up question once a reader understands the steps: does
// finishing them mean you've qualified? (No — see below.) The Participation
// card's intro deliberately doesn't restate who's eligible or solo-vs-team —
// WhoItsFor above already covers that on this same page — so it sticks to
// what changes once you've actually registered. Deadlines are passed in
// already-formatted rather than read from Season here, so this stays a plain
// server-rendered component instead of needing its own Prisma call —
// CLAUDE.md "Season-driven config": nothing here is hard-coded, it's just
// formatted upstream in page.tsx.
export function DistinctionSection({
  springQualifyDeadline,
  summerQualifyDeadline,
}: DistinctionSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="distinction-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>AN IMPORTANT DISTINCTION</Eyebrow>
          <h2 id="distinction-title" className={styles.heading}>
            Joining is not the same as qualifying.
          </h2>
          <p className={styles.copy}>
            Program participation gives you access to the I³ pathway. Qualification is a later
            achievement based on completing the required work on time.
          </p>
        </div>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.join}`}>
            <span className={styles.label}>01 / JOIN THE LEAGUE</span>
            <h3>Participation</h3>
            <p>
              Once registration and payment are complete, you&apos;re in. There&apos;s no
              separate approval or tryout.
            </p>
            <ul className={styles.list}>
              <li>Create an Innovator Profile</li>
              <li>Work through the six-stage curriculum</li>
              <li>Apply each stage to your own innovation</li>
            </ul>
          </article>
          <article className={`${styles.card} ${styles.qualify}`}>
            <span className={styles.label}>02 / EARN ADVANCEMENT</span>
            <h3>Qualification</h3>
            <p>
              Students who want to remain eligible for advancement must complete the required
              program work by one of the established completion windows.
            </p>
            <ul className={styles.list}>
              <li>Complete assessments and submissions</li>
              <li>
                Finish by {springQualifyDeadline} or {summerQualifyDeadline}
              </li>
              <li>Top innovators may advance to the Finals</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

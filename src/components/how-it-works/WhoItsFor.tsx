import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./WhoItsFor.module.css";

const FIT_ITEMS = [
  {
    kicker: "STUDENT LEVEL",
    title: "Middle & high school students",
    body: "I³ League groups students into a Middle School Division (grades 6–8) and a High School Division (grades 9–12).",
  },
  {
    kicker: "HOW YOU WORK",
    title: "Solo or with a team",
    body: "Students can work independently or collaborate with a team. Teammates don't need to attend the same school to register together.",
  },
  {
    kicker: "WHAT YOU BUILD",
    title: "Your problem. Your innovation.",
    body: "I³ League does not assign a topic. Students choose a real problem they care about and apply the full innovation process to it.",
  },
];

// Formerly the standalone Eligibility page's "who it's for" section, then
// briefly on the Curriculum page — now moved to How It Works, right after
// the hero and before the 8-step path, since "is this for me" belongs before
// "what are the steps." Trimmed to avoid overlap with DistinctionSection
// further down this same page: the Finals-division detail and the
// "six-stage" framework mention were dropped here since DistinctionSection's
// Participation/Qualification cards already cover the six-stage curriculum
// and advancing to the Finals — this section now sticks to pure "who's
// eligible" facts (grade divisions, solo-or-team, choose-your-own-problem).
// Same three-up "proof group" grid (docs/design-system.md Section 13,
// Pattern C) as StageWorkflow's step grid.
export function WhoItsFor() {
  return (
    <section className={styles.section} aria-labelledby="fit-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>WHO IT&apos;S FOR</Eyebrow>
          <h2 id="fit-title" className={styles.heading}>
            You do not need the perfect idea. You need a problem worth exploring.
          </h2>
          <p className={styles.copy}>
            The program is structured to help students move from observation to evidence, from
            ideas to testing, and from a project to a defensible innovation.
          </p>
        </div>

        <div className={styles.grid}>
          {FIT_ITEMS.map((item) => (
            <article key={item.kicker}>
              <span className={styles.kicker}>{item.kicker}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

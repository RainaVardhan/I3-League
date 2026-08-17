import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./IncludedSection.module.css";

type IncludedSectionProps = {
  curriculumVersion: string;
};

// Connected proof group (Pattern C) — same number/title/body card recipe as
// Curriculum's StageWorkflow ("What Students Build"), scaled to five
// columns instead of four, rather than the plain numbered checklist or the
// forced-span 2-column grid this used before.
function buildItems(curriculumVersion: string) {
  return [
    {
      number: "01",
      title: "Full Curriculum Access",
      body: `Full access to the ${curriculumVersion} curriculum, all six stages.`,
    },
    {
      number: "02",
      title: "Assessments & Retakes",
      body: "Online assessments and unlimited retakes within the allowed attempts.",
    },
    {
      number: "03",
      title: "Journal & Challenges",
      body: "Innovation Journal, Speaking Challenge, Character and Ethics Challenges.",
    },
    {
      number: "04",
      title: "Profile & Credential",
      body: "An Innovator Profile, digital badges, and a Certified Innovator credential.",
    },
    {
      number: "05",
      title: "National Eligibility",
      body: "Eligibility to qualify for the National Finals.",
    },
  ];
}

export function IncludedSection({ curriculumVersion }: IncludedSectionProps) {
  const items = buildItems(curriculumVersion);

  return (
    <section className={styles.section} aria-label="What every registration includes">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>WHAT EVERY REGISTRATION INCLUDES</Eyebrow>
        </div>
        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.number}>
              <span className={styles.number}>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

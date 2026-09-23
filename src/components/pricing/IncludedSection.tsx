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
      body: `Full access to the ${curriculumVersion} curriculum: notes, activities, and worksheets for all six stages.`,
    },
    {
      number: "02",
      title: "Reviews & Feedback",
      body: "A rubric review at every stage, with specific feedback and as many resubmissions as the program calendar allows.",
    },
    {
      number: "03",
      title: "Innovation Journal",
      body: "A dated, append-only record of your thinking, where every edit is kept as a new version.",
    },
    {
      number: "04",
      title: "Final Portfolio",
      body: "Your six stage artifacts, a reflection, and a sustainability plan come together as a Final Innovation Portfolio.",
    },
    {
      number: "05",
      title: "Profile & Credential",
      body: "An Innovator Profile, digital badges, and a Certified Innovator credential.",
    },
    {
      number: "06",
      title: "National Eligibility",
      body: "Eligibility to qualify for the National Finals by completing all six stages by a qualification deadline.",
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

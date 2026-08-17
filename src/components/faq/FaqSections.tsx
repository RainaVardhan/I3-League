import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import type { FaqSection } from "./faq-data";
import styles from "./FaqSections.module.css";

export function FaqSections({ sections }: { sections: FaqSection[] }) {
  return (
    <section className={styles.section} aria-label="Frequently asked questions">
      <div className={styles.inner}>
        {sections.map((group) => (
          <div key={group.title} className={styles.group}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            <FaqAccordion items={group.items} />
          </div>
        ))}
      </div>
    </section>
  );
}

import { SplitHero } from "@/components/design-system/SplitHero";
import styles from "./PricingHero.module.css";

type PricingHeroProps = {
  price: number;
  enrollmentOpenDate: string;
};

// Same SplitHero shell as How It Works (PageHero.tsx) and Curriculum
// (CurriculumHero.tsx), per the site owner's request that Pricing's hero
// match those instead of the lighter single-column PageIntro pattern it
// used before. The right-slot card follows PageHero's .statBox "family"
// (see FrameworkCard.module.css's comment) so all three hero widgets read
// as the same component type.
export function PricingHero({ price, enrollmentOpenDate }: PricingHeroProps) {
  return (
    <SplitHero
      className={styles.hero}
      eyebrow="I³ LEAGUE PRICING"
      title={
        <>
          Priced per student.
          <br />
          Built for teams.
        </>
      }
      lede={`Every student pays their own $${price.toFixed(0)}. The project can be shared, and the learning and certification always stay individual.`}
      rightSlot={
        <div className={styles.statBox}>
          <span className={styles.label}>REGISTRATION PRICE</span>
          <span className={styles.amount}>${price.toFixed(0)}</span>
          <span className={styles.unit}>per student</span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.status}>Enrollment opens {enrollmentOpenDate}</span>
        </div>
      }
    />
  );
}

import { Eyebrow } from "@/components/design-system/Eyebrow";
import { PricingTable } from "@/components/marketing/PricingTable";
import styles from "./TeamPricingSection.module.css";

type TeamPricingSectionProps = {
  perParticipantPriceUsd: number;
  maxTeamSize: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export function TeamPricingSection({ perParticipantPriceUsd, maxTeamSize }: TeamPricingSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="team-pricing-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>TEAM PRICING</Eyebrow>
          <h2 id="team-pricing-title" className={styles.heading}>
            One price. Simple math.
          </h2>
          <p className={styles.copy}>
            Each student registers and pays the same {currency.format(perParticipantPriceUsd)}{" "}
            fee, whether participating individually or on a shared project with up to{" "}
            {maxTeamSize} students.
          </p>
        </div>
        <PricingTable perParticipantPriceUsd={perParticipantPriceUsd} maxTeamSize={maxTeamSize} />
      </div>
    </section>
  );
}

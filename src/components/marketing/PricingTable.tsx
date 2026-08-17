import styles from "./PricingTable.module.css";

type PricingTableProps = {
  perParticipantPriceUsd: number;
  maxTeamSize: number;
};

const PARTICIPATION_LABELS: Record<number, string> = {
  1: "Individual",
};

function participationLabel(size: number) {
  return PARTICIPATION_LABELS[size] ?? `Team of ${size}`;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

// Renders every participation size the current Season allows (1 through
// Season.maxTeamSize) at Season.perParticipantPriceUsd each — see CLAUDE.md
// "Payment flow & pricing model": pricing is strictly per participant, a
// team of N always totals price × N, never a flat team rate.
export function PricingTable({ perParticipantPriceUsd, maxTeamSize }: PricingTableProps) {
  const rows = Array.from({ length: maxTeamSize }, (_, i) => i + 1);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Participation</th>
            <th scope="col">Per student</th>
            <th scope="col">Total due</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((size) => (
            <tr key={size}>
              <td>{participationLabel(size)}</td>
              <td className={styles.mono}>{currency.format(perParticipantPriceUsd)}</td>
              <td className={styles.mono}>{currency.format(perParticipantPriceUsd * size)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import Link from "next/link";
import { STAGE_NUMBERS, type JourneyItem } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import styles from "./DashboardHub.module.css";

// The six-stage journey as a connected node track: a numbered circle per
// stage on one line, with the stage name beneath it. Filled cobalt =
// advanced, coral ring = current, hairline = still locked. The full
// explanation of each stage lives on that stage's own page. Locked stages
// are not links (CLAUDE.md "Sequential stage unlocking").
export function StageNodeTrack({ items }: { items: JourneyItem[] }) {
  return (
    <div className={styles.track}>
      <span className={styles.trackLine} aria-hidden="true" />
      {items.map((item) => {
        const locked = item.status === "LOCKED";
        const copy = getStageCopy(item.stage);
        const nodeClass = [
          styles.node,
          item.status === "COMPLETE" ? styles.nodeDone : "",
          item.status === "CURRENT" ? styles.nodeCurrent : "",
          locked ? styles.nodeLocked : "",
        ]
          .filter(Boolean)
          .join(" ");

        const inner = (
          <>
            <span className={styles.nodeDot}>{STAGE_NUMBERS[item.stage]}</span>
            <span className={styles.nodeName}>{copy.name}</span>
          </>
        );

        return locked ? (
          <span key={item.stage} className={nodeClass}>
            {inner}
          </span>
        ) : (
          <Link
            key={item.stage}
            href={`/dashboard/${item.slug}`}
            className={nodeClass}
            aria-current={item.status === "CURRENT" ? "step" : undefined}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

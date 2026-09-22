"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/design-system/Button";
import styles from "./MissingItemsDialog.module.css";

// One unfinished required item, and where it lives: the page it is on and the
// form field's `name`, so the dialog can take the student straight to it.
export type MissingItem = {
  key: string;
  label: string;
  pageId: string;
  pageLabel: string;
  field: string;
};

type MissingItemsDialogProps = {
  open: boolean;
  items: MissingItem[];
  onClose: () => void;
  /** Called after the dialog asks to close; the caller moves to the item. */
  onGo: (item: MissingItem) => void;
};

// The popup shown when someone selects Submit before everything is finished.
// A native <dialog> opened with showModal(), so the browser handles the
// backdrop, focus trapping and Escape. Items are grouped by page, in page
// order, and each one is a button that closes the popup and jumps to its field.
export function MissingItemsDialog({ open, items, onClose, onGo }: MissingItemsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const groups: { pageId: string; pageLabel: string; items: MissingItem[] }[] = [];
  for (const item of items) {
    const group = groups.find((g) => g.pageId === item.pageId);
    if (group) group.items.push(item);
    else groups.push({ pageId: item.pageId, pageLabel: item.pageLabel, items: [item] });
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="missing-items-title"
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> element itself.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.head}>
        <span className={styles.kicker}>Not ready to submit</span>
        <h2 id="missing-items-title" className={styles.title}>
          {items.length === 1 ? "1 thing left to finish" : `${items.length} things left to finish`}
        </h2>
        <p className={styles.lead}>Select an item to jump straight to it.</p>
      </div>

      <div className={styles.body}>
        {groups.map((group) => (
          <section key={group.pageId} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.pageLabel}</h3>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item.key}>
                  <button type="button" className={styles.item} onClick={() => onGo(item)}>
                    <span>{item.label}</span>
                    <span className={styles.go} aria-hidden="true">
                      Go
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className={styles.foot}>
        <Button type="button" variant="ghost" showArrow={false} onClick={onClose}>
          Close
        </Button>
      </div>
    </dialog>
  );
}

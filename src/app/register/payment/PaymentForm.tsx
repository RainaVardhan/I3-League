"use client";

import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { PaymentMethodIcon } from "./PaymentMethodIcon";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { submitPaymentAction, type PaymentState } from "./actions";
import styles from "./PaymentForm.module.css";

const METHOD_OPTIONS = [
  { value: "PAYPAL", label: "PayPal" },
  { value: "VENMO", label: "Venmo" },
  { value: "ZELLE", label: "Zelle" },
] as const;

type PaymentFormProps = {
  priceUsd: string;
  paypalLink: string | null;
  venmoHandle: string | null;
  zelleInfo: string | null;
  rejectionReason: string | null;
};

const initialState: PaymentState = { error: null };

// Only PayPal and Venmo have a real "pay this recipient" web link — Zelle
// deliberately has no such thing (it's bank-app-mediated, by design, for
// fraud-prevention reasons), so a fabricated "zelle.com/pay?..." URL would
// just be a broken link. Best we can honestly offer there is a mailto:/tel:
// to the contact info itself, when it's shaped like one.
function methodHref(method: "PAYPAL" | "VENMO" | "ZELLE", detail: string): string | null {
  if (method === "PAYPAL") return detail;
  if (method === "VENMO") return `https://venmo.com/u/${detail.replace(/^@/, "")}`;
  if (detail.includes("@")) return `mailto:${detail}`;
  if (/^[\d+()\-.\s]+$/.test(detail)) return `tel:${detail.replace(/[^\d+]/g, "")}`;
  return null;
}

export function PaymentForm({ priceUsd, paypalLink, venmoHandle, zelleInfo, rejectionReason }: PaymentFormProps) {
  const [state, formAction, pending] = useActionState(submitPaymentAction, initialState);

  const methods: { method: "PAYPAL" | "VENMO" | "ZELLE"; name: string; detail: string }[] = [
    ...(paypalLink ? [{ method: "PAYPAL" as const, name: "PayPal", detail: paypalLink }] : []),
    ...(venmoHandle ? [{ method: "VENMO" as const, name: "Venmo", detail: venmoHandle }] : []),
    ...(zelleInfo ? [{ method: "ZELLE" as const, name: "Zelle", detail: zelleInfo }] : []),
  ];

  return (
    <>
      <p className={styles.contactIntro}>Pay ${priceUsd} to one of the below, then confirm it here.</p>
      <div className={styles.methodList}>
        {methods.map(({ method, name, detail }) => {
          const href = methodHref(method, detail);
          const content = (
            <>
              <PaymentMethodIcon method={method} />
              <div className={styles.methodText}>
                <span className={styles.methodName}>{name}</span>
                <span className={styles.methodDetail}>{detail}</span>
              </div>
            </>
          );
          return href ? (
            <a key={method} href={href} target="_blank" rel="noopener noreferrer" className={styles.methodRow}>
              {content}
            </a>
          ) : (
            <div key={method} className={styles.methodRow}>
              {content}
            </div>
          );
        })}
      </div>

      {rejectionReason && (
        <p className={styles.rejection}>
          Your last submission was rejected: {rejectionReason}. Please review and resubmit below.
        </p>
      )}

      <form className={authFormStyles.form} action={formAction}>
        <RadioGroup legend="How did you pay?" name="method" options={METHOD_OPTIONS} required />
        <Input
          label="Transaction / confirmation number"
          id="paymentReference"
          name="paymentReference"
          required
        />
        <ScreenshotUpload />

        {state.error && (
          <p className={authFormStyles.formError} role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className={authFormStyles.submitButton}>
          {pending ? "Submitting…" : "Submit payment confirmation"}
        </Button>
      </form>
    </>
  );
}

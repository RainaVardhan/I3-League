import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Privacy Policy | I³ League",
  description: "How I³ League collects, uses, and protects participant data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 17, 2026" currentHref="/privacy">
      <h2>1. What we collect</h2>
      <ul>
        <li>Account information: name, email, role, and school (where applicable).</li>
        <li>
          Program work: curriculum submissions, assessment results, Innovation Journal entries,
          and challenge submissions.
        </li>
        <li>
          Payment confirmation details: payment method, transaction reference, and an optional
          screenshot, not full payment card or bank information, since I³ League never processes
          payments directly.
        </li>
        <li>Parent/guardian consent and media consent records, where a student is a minor.</li>
      </ul>

      <h2>2. Students & parental consent</h2>
      <p>
        Most I³ League participants are minors. A parent or guardian completes a consent step
        during registration before a student&apos;s account becomes fully active, and separately
        controls whether a student&apos;s name, photo, or work may be used publicly (for example,
        in a public project gallery) through media consent.
      </p>

      <h2>3. How we use this data</h2>
      <p>
        Data is used to run the program: unlocking curriculum stages, tracking progress,
        verifying payment and enrollment, supporting safety and IP review, and issuing
        certificates and credentials. We don&apos;t sell participant data.
      </p>

      <h2>4. Who can see what</h2>
      <p>
        Access is restricted by role. A parent can see their own child&apos;s information, not
        another family&apos;s. A coach has read-only visibility into their own roster, with no
        ability to edit submissions or grades. A project stays confidential, hidden from any
        public-facing view, unless a student explicitly makes it public at or after the IP
        Checkpoint.
      </p>

      <h2>5. Where data lives</h2>
      <p>
        Account and program data is stored in a managed Postgres database (via Supabase), with
        authentication handled by Supabase Auth. Access to the underlying data is restricted at
        both the database and application layer, not just hidden in the interface.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Parents and students can request a copy of their data, ask questions about what&apos;s
        collected, or request account deletion by contacting{" "}
        <a href="mailto:info@i3league.com">info@i3league.com</a>. Note that some records, like
        a student&apos;s Innovation Journal, are kept as an append-only history rather than
        edited or deleted in place, to preserve an accurate record of a student&apos;s work.
      </p>

      <h2>7. Changes to this policy</h2>
      <p>
        We may update this policy as the platform develops. Meaningful changes will be reflected
        by an updated date at the top of this page.
      </p>
    </LegalLayout>
  );
}

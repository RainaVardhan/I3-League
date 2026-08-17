import { LegalLayout } from "@/components/legal/LegalLayout";
import { getActiveSeason } from "@/lib/season";

export const metadata = {
  title: "Terms of Service | I³ League",
  description: "The terms that govern using the I³ League platform.",
};

export default async function TermsPage() {
  const season = await getActiveSeason();
  const price = Number(season.perParticipantPriceUsd).toFixed(0);

  return (
    <LegalLayout title="Terms of Service" lastUpdated="August 17, 2026" currentHref="/terms">
      <h2>1. Who this agreement is with</h2>
      <p>
        These Terms govern use of the I³ League platform by students, parents/guardians, coaches,
        judges, and administrators. Because most participants are middle and high school students,
        a parent or guardian must review and accept these Terms on behalf of any student under 18,
        as part of the Parent/Guardian Consent step during registration.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You&apos;re responsible for the accuracy of the information on your account and for
        keeping your login credentials confidential. Student, parent, and coach accounts are
        self-registered; judge and admin accounts are created by I³ League directly and are never
        available through the public signup form.
      </p>

      <h2>3. Registration & payment</h2>
      <ul>
        <li>
          Registration is priced per student, currently ${price} per student for the active
          season, not per project or per team. A team simply multiplies that price by its number
          of students.
        </li>
        <li>
          I³ League does not process payments directly. Each student pays their individual share
          through the payment method listed at registration (PayPal, Venmo, or Zelle), then
          submits a payment confirmation for admin review.
        </li>
        <li>
          A student&apos;s access is tied to their own verified payment. Each teammate&apos;s
          access stays fully independent of every other teammate&apos;s payment status.
        </li>
        <li>
          Refund requests are reviewed individually, contact{" "}
          <a href="mailto:registration@i3league.com">registration@i3league.com</a> before assuming
          a refund will be issued.
        </li>
      </ul>

      <h2>4. Project ownership & confidentiality</h2>
      <p>
        Every project a student creates is confidential by default. It only becomes public if a
        student explicitly chooses that, at or after the IP Checkpoint stage of the curriculum.
        Students retain ownership of their own work; participating in I³ League does not transfer
        ownership of a student&apos;s innovation to I³ League.
      </p>

      <h2>5. Conduct</h2>
      <p>
        Participants are expected to follow the I³ League{" "}
        <a href="/competition-policies">Competition Policies</a>, including honesty about the use
        of AI assistance and safety requirements for any work involving people, animals, chemicals,
        or other higher-risk elements. Violations can result in a project being placed under
        review or a participant losing eligibility to advance.
      </p>

      <h2>6. Changes to these Terms</h2>
      <p>
        We may update these Terms as the platform develops. Meaningful changes will be reflected
        by an updated date at the top of this page.
      </p>
    </LegalLayout>
  );
}

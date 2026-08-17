import { LegalLayout } from "@/components/legal/LegalLayout";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";

export const metadata = {
  title: "Competition Policies | I³ League",
  description: "Eligibility, team, safety, and academic integrity policies for I³ League.",
};

export default async function CompetitionPoliciesPage() {
  const season = await getActiveSeason();

  return (
    <LegalLayout
      title="Competition Policies"
      lastUpdated="August 17, 2026"
      currentHref="/competition-policies"
    >
      <h2>1. Eligibility</h2>
      <p>
        I³ League is open to middle and high school students. Students may participate
        individually or as part of a team of up to {season.maxTeamSize} students working on a
        shared project. Students choose their own problem to investigate; there is no assigned
        prompt.
      </p>

      <h2>2. Teams</h2>
      <p>
        A project can be shared across a team, and the learning and certification always remain
        individual. Each student on a team completes their own curriculum, assessments,
        Innovation Journal, and challenges, and is evaluated on their own individual contribution
        and understanding, alongside the team&apos;s output.
      </p>

      <h2>3. Safety</h2>
      <p>
        Any project involving higher-risk elements (for example, human subjects, animals, health
        information, chemicals or biological materials, electricity or machinery, personally
        identifiable information, environmental sampling, drones, or AI systems) is automatically
        flagged for admin review during the Investigate stage. A flagged project can&apos;t move
        forward until that review is cleared. This exists to protect students and the people
        around their research, not to discourage ambitious projects.
      </p>

      <h2>4. Intellectual property & confidentiality</h2>
      <p>
        Every project defaults to confidential. At the IP Checkpoint, students choose whether
        their project stays confidential or becomes public. Confidential projects stay private,
        visible only within the platform to the student, their team, and authorized reviewers,
        and kept out of any public gallery, marketing material, or public-facing judge view.
        Students retain ownership of their own work throughout.
      </p>

      <h2>5. Academic integrity & AI use</h2>
      <p>
        Students may use AI tools as part of their research and iteration process, but must
        disclose that use at every major submission. Undisclosed use of AI, or submitting work
        that isn&apos;t substantially the student&apos;s own, can result in a submission being
        rejected or a project losing eligibility to advance.
      </p>

      <h2>6. Qualification windows</h2>
      <p>
        To remain eligible to advance toward the National Finals, students must complete the
        required program work by one of two qualification windows each season: one closing{" "}
        {formatSeasonDate(season.springQualifyDeadline)}, and one closing{" "}
        {formatSeasonDate(season.summerQualifyDeadline)}. Missing both windows doesn&apos;t affect
        a student&apos;s enrollment or curriculum access; it only means they don&apos;t advance
        that season.
      </p>

      <h2>7. Judging</h2>
      <p>
        Judging assignments, conflict-of-interest handling, and scoring rubrics for the National
        Finals are managed by I³ League and communicated separately to qualifying students ahead
        of the event. Details specific to judging are not part of this document.
      </p>

      <h2>8. Enforcement</h2>
      <p>
        I³ League may place a project under review, require corrections, or remove a
        student&apos;s eligibility to advance if these policies are violated. Questions about a
        specific situation can be sent to{" "}
        <a href="mailto:info@i3league.com">info@i3league.com</a>.
      </p>
    </LegalLayout>
  );
}

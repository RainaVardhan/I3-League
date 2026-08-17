import { Header } from "@/components/homepage/Header";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { FaqHero } from "@/components/faq/FaqHero";
import { FaqSections } from "@/components/faq/FaqSections";
import { buildFaqSections } from "@/components/faq/faq-data";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";

export const metadata = {
  title: "FAQs | I³ League",
  description: "Answers to common questions about I³ League registration, teams, curriculum, and qualification.",
};

export default async function FaqsPage() {
  const season = await getActiveSeason();
  const sections = buildFaqSections({
    price: Number(season.perParticipantPriceUsd),
    maxTeamSize: season.maxTeamSize,
    springQualifyDeadline: formatSeasonDate(season.springQualifyDeadline),
    summerQualifyDeadline: formatSeasonDate(season.summerQualifyDeadline),
    curriculumVersion: season.curriculumVersion,
  });

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <FaqHero />
        <FaqSections sections={sections} />
      </main>
      <Footer />
    </>
  );
}

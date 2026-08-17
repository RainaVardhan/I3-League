import { Header } from "@/components/homepage/Header";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { PageHero } from "@/components/how-it-works/PageHero";
import { WhoItsFor } from "@/components/how-it-works/WhoItsFor";
import { ProcessSection } from "@/components/how-it-works/ProcessSection";
import { DistinctionSection } from "@/components/how-it-works/DistinctionSection";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";

export const metadata = {
  title: "How It Works | I³ League",
  description:
    "See the eight steps of the I³ League journey: enroll, learn, apply, pass, earn, qualify, compete, and create real-world impact.",
};

export default async function HowItWorksPage() {
  const season = await getActiveSeason();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <PageHero />
        <WhoItsFor />
        <ProcessSection
          springQualifyDeadline={formatSeasonDate(season.springQualifyDeadline)}
          summerQualifyDeadline={formatSeasonDate(season.summerQualifyDeadline)}
        />
        <DistinctionSection
          springQualifyDeadline={formatSeasonDate(season.springQualifyDeadline)}
          summerQualifyDeadline={formatSeasonDate(season.summerQualifyDeadline)}
        />
      </main>
      <Footer />
    </>
  );
}

import { Header } from "@/components/homepage/Header";
import { JourneyHero } from "@/components/homepage/JourneyHero";
import { CurriculumBridge } from "@/components/homepage/CurriculumBridge";
import { ProblemSection } from "@/components/homepage/ProblemSection";
import { ProofSection } from "@/components/homepage/ProofSection";
import { FinalCta } from "@/components/homepage/FinalCta";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { getActiveSeason, formatSeasonMonthYear } from "@/lib/season";

export default async function Home() {
  const season = await getActiveSeason();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <JourneyHero />
        <CurriculumBridge />
        <ProblemSection />
        <ProofSection />
        <FinalCta enrollmentOpenDate={formatSeasonMonthYear(season.openDate)} />
      </main>
      <Footer />
    </>
  );
}

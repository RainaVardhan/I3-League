import { Header } from "@/components/homepage/Header";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { PricingHero } from "@/components/pricing/PricingHero";
import { TeamPricingSection } from "@/components/pricing/TeamPricingSection";
import { IncludedSection } from "@/components/pricing/IncludedSection";
import { PaymentSection } from "@/components/pricing/PaymentSection";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";

export const metadata = {
  title: "Pricing | I³ League",
  description: "I³ League registration is priced per participant, fair for every team size.",
};

export default async function PricingPage() {
  const season = await getActiveSeason();
  const price = Number(season.perParticipantPriceUsd);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <PricingHero price={price} enrollmentOpenDate={formatSeasonDate(season.openDate)} />

        {/* "Who can register" (grade divisions, solo-or-team, choose-your-
            own-problem) used to live here — removed per the site owner's
            request. How It Works' WhoItsFor section already covers the same
            facts, so nothing is lost site-wide, just no longer duplicated
            on this page. */}

        <TeamPricingSection perParticipantPriceUsd={price} maxTeamSize={season.maxTeamSize} />
        <IncludedSection curriculumVersion={season.curriculumVersion} />
        <PaymentSection />
      </main>
      <Footer />
    </>
  );
}

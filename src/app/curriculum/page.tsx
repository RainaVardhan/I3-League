import { Header } from "@/components/homepage/Header";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { CurriculumHero } from "@/components/curriculum/CurriculumHero";
import { StageWorkflow } from "@/components/curriculum/StageWorkflow";
import { StageDetailList } from "@/components/curriculum/StageDetailList";
import { ThreePhases } from "@/components/curriculum/ThreePhases";

export const metadata = {
  title: "Curriculum | I³ League",
  description:
    "The six-stage I³ League curriculum: Insight, Investigate, Imagine, the IP Checkpoint, Iterate, Impact, and Influence.",
};

export default function CurriculumPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <CurriculumHero />
        <ThreePhases />
        <StageDetailList />
        <StageWorkflow />
      </main>
      <Footer />
    </>
  );
}

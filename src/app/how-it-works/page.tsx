import { Header } from "@/components/homepage/Header";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { PageHero } from "@/components/how-it-works/PageHero";
import { ProcessSection } from "@/components/how-it-works/ProcessSection";

export const metadata = {
  title: "How It Works | I³ League",
  description:
    "See the eight steps of the I³ League journey: enroll, learn, apply, pass, earn, qualify, compete, and create real-world impact.",
};

export default function HowItWorksPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <PageHero />
        <ProcessSection />
      </main>
      <Footer />
    </>
  );
}

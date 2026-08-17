import { Header } from "@/components/homepage/Header";
import { Footer } from "@/components/homepage/Footer";
import { GridBackground } from "@/components/design-system/GridBackground";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactChannels } from "@/components/contact/ContactChannels";

export const metadata = {
  title: "Contact Us | I³ League",
  description: "Reach the I³ League team for general questions, registration and payment support, or partnerships.",
};

export default function ContactPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GridBackground />
      <Header />
      <main id="main">
        <ContactHero />
        <ContactChannels />
      </main>
      <Footer />
    </>
  );
}

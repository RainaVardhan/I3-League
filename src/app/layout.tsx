import type { Metadata } from "next";
import { Chakra_Petch, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// These three variable names ARE the design-system's font tokens
// (--font-display / --font-body / --font-mono), referenced directly in
// globals.css and every component's CSS module. See docs/design-system.md
// Section 3.
const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "I³ League",
  description:
    "I³ League is a national student innovation program. Students choose a real problem and work through six stages (Insight, Investigate, Imagine, Iterate, Impact, Influence) to build a real innovation, earn certification, and qualify for the National Innovation Finals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${chakraPetch.variable} ${hankenGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

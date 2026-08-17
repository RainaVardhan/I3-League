// Single source of truth for the site's core program pages — the Footer's
// "Explore" column renders exactly this list (Home/How It Works/
// Curriculum/Pricing only, no FAQs/Contact Us — those get their own
// "Support" column below).
export const SITE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/pricing", label: "Pricing" },
];

// Support links get their own Footer column, and are also appended to the
// Header's nav (see HEADER_NAV_LINKS) so FAQs/Contact Us are reachable
// from every page, not just the Footer.
export const SUPPORT_NAV_LINKS = [
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact Us" },
];

// Full Header nav = core pages + support pages. Kept separate from
// SITE_NAV_LINKS because the Footer's "Explore" column intentionally
// shows only the core four.
export const HEADER_NAV_LINKS = [...SITE_NAV_LINKS, ...SUPPORT_NAV_LINKS];

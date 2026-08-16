// Single source of truth for the public site's primary nav links — Header
// and Footer both render this same list and previously kept their own
// separate copies, which could silently drift out of sync.
export const SITE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/pricing", label: "Pricing" },
];

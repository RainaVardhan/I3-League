import Link from "next/link";
import { Logo } from "@/components/design-system/Logo";
import styles from "./Footer.module.css";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/pricing", label: "Pricing" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Logo />
          <p className={styles.tagline}>[ Innovate. Impact. Inspire. ]</p>
        </div>
        <div className={styles.col}>
          <h3>Explore</h3>
          <ul>
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={link.href === "/" ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={styles.legal}>© 2026 I³ League. All rights reserved.</p>
    </footer>
  );
}

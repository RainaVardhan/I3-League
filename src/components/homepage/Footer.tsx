import { Logo } from "@/components/design-system/Logo";
import { NavLink } from "@/components/design-system/NavLink";
import { SITE_NAV_LINKS } from "@/lib/site-nav";
import styles from "./Footer.module.css";

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
            {SITE_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={styles.legal}>© 2026 I³ League. All rights reserved.</p>
    </footer>
  );
}

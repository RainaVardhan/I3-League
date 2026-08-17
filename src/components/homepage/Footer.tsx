import { Logo } from "@/components/design-system/Logo";
import { NavLink } from "@/components/design-system/NavLink";
import { SITE_NAV_LINKS, SUPPORT_NAV_LINKS } from "@/lib/site-nav";
import { LEGAL_PAGES } from "@/lib/legal-nav";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Logo />
          <p className={styles.tagline}>[ Innovate. Impact. Inspire. ]</p>
        </div>
        <div className={styles.navGroup}>
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
          <div className={styles.col}>
            <h3>Account</h3>
            <ul>
              <li>
                <NavLink href="/login">Login</NavLink>
              </li>
              <li>
                <NavLink href="/signup">Create Account</NavLink>
              </li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3>Support</h3>
            <ul>
              {SUPPORT_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href}>{link.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.legal}>
        <span>© 2026 I³ League. All rights reserved.</span>
        <span>
          {LEGAL_PAGES.map((page, index) => (
            <span key={page.href}>
              <NavLink href={page.href}>{page.label}</NavLink>
              {index < LEGAL_PAGES.length - 1 ? " · " : null}
            </span>
          ))}
        </span>
      </div>
    </footer>
  );
}

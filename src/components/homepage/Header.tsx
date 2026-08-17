"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/design-system/Logo";
import { NavLink } from "@/components/design-system/NavLink";
import { HEADER_NAV_LINKS } from "@/lib/site-nav";
import styles from "./Header.module.css";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Menu closes on outside click or Escape. The nav is always collapsed
  // behind the toggle now (no separate desktop inline layout to fall back
  // to), so there's no resize-based close to worry about anymore.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!toggleRef.current || !navRef.current) return;
      const target = event.target as Node;
      if (!toggleRef.current.contains(target) && !navRef.current.contains(target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <Logo />
        <nav className={styles.siteNav} aria-label="Primary">
          <button
            ref={toggleRef}
            type="button"
            className={styles.navToggle}
            aria-expanded={isOpen}
            aria-controls="nav-links"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className={styles.navToggleBar} />
            <span className={styles.navToggleBar} />
            <span className={styles.navToggleBar} />
            <span className="sr-only">Menu</span>
          </button>
          <ul
            ref={navRef}
            id="nav-links"
            className={isOpen ? `${styles.navLinks} ${styles.isOpen}` : styles.navLinks}
          >
            {HEADER_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} onClick={() => setIsOpen(false)}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            {/* Plain nav item, not the design-system Button — reads as one
                of the options rather than a standalone CTA, and being
                inside .navLinks it lives in the same always-collapsed
                dropdown as the rest of the list, with no separate
                mobile-only duplicate needed. */}
            <li>
              <NavLink href="/login" onClick={() => setIsOpen(false)}>
                Register
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

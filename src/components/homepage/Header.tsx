"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/design-system/Logo";
import { NavLink } from "@/components/design-system/NavLink";
import { SITE_NAV_LINKS } from "@/lib/site-nav";
import styles from "./Header.module.css";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Mobile menu closes on outside click, Escape, or resize back to desktop —
  // otherwise it can get stuck open if the viewport crosses the 900px
  // breakpoint while it's expanded.
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
    function handleResize() {
      if (window.innerWidth > 900) setIsOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
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
            {SITE_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} onClick={() => setIsOpen(false)}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            {/* Plain nav item, not the design-system Button — reads as one
                of the options rather than a standalone CTA, and being
                inside .navLinks it collapses into the dropdown at <=900px
                the same way the rest of the list does, with no separate
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

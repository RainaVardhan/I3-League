"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/design-system/Logo";
import { Button } from "@/components/design-system/Button";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
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
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Button as={Link} href="/pricing" className={styles.navCta}>
          Start Your Innovation
        </Button>
      </div>
    </header>
  );
}

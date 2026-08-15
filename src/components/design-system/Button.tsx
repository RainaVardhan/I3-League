import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: "primary" | "ghost";
  /** Trailing chevron, on by default per docs/design-system.md Section 9. */
  showArrow?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

// Polymorphic so the same look can render as a <button> (form actions) or
// next/link's <Link> (navigation) without duplicating styles. Exactly one
// primary button per view — see docs/design-system.md Section 9 "Usage".
export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  showArrow = true,
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  const variantClass = variant === "primary" ? styles.primary : styles.ghost;
  const combinedClassName = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`;

  return (
    <Component className={combinedClassName} {...props}>
      {children}
      {showArrow && (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </Component>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";

// href is narrowed to `string` (Link itself also accepts a UrlObject) so the
// `pathname === href` check below can't silently and permanently miss the
// active route by comparing a string to an object — every caller here only
// ever needs a plain path anyway.
type NavLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

// Wraps next/link's Link with the site's shared "is this the current page"
// check, so Header and Footer don't each keep their own copy of
// `pathname === link.href` — a future change to how that's determined
// (e.g. matching nested routes) only needs to happen here.
export function NavLink({ href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return <Link href={href} aria-current={isActive ? "page" : undefined} {...props} />;
}

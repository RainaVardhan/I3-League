"use client";

import { useEffect, useRef } from "react";

// Shared by LoginForm, SignupForm, and ForgotPasswordForm. Explicit (not
// implicit) rendering — we call turnstile.render() ourselves and hold the
// returned widget ID, instead of relying on Cloudflare's script
// auto-scanning the DOM once for `.cf-turnstile` divs. Implicit rendering
// breaks across Next.js Fast Refresh / any remount of the container: the
// auto-scan only runs once, so a remounted div never gets a widget, and a
// later reset() call errors trying to reach a widget ID that no longer
// exists.
//
// `shouldReset` should be the form's error state — Cloudflare marks a token
// consumed the moment Supabase checks it, even if the request then fails
// for an unrelated reason (e.g. weak password), so a retry needs a fresh
// token or Supabase rejects it as "timeout-or-duplicate".
export function useTurnstile(shouldReset: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (shouldReset && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
    }
  }, [shouldReset]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  function renderWidget() {
    if (containerRef.current && window.turnstile && widgetIdRef.current === null) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        // Matches the full-width primary button below it instead of
        // Cloudflare's fixed 300px default.
        size: "flexible",
      });
    }
  }

  // The script tag is deduped by src across pages (next/script), so on a
  // client-side navigation between two pages that each render this hook
  // (e.g. login -> forgot-password), the script may already be loaded by
  // the time this instance mounts — in which case the Script `onLoad` below
  // never fires for it, and the widget silently never renders. Cover that
  // case directly on mount; the Script onLoad handles the first-ever load.
  useEffect(() => {
    renderWidget();
  }, []);

  return { containerRef, handleScriptLoad: renderWidget };
}

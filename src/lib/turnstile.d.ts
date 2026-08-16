// Minimal ambient typing for the Cloudflare Turnstile script loaded via
// next/script in useTurnstile.ts — the real @cloudflare package is a full
// SDK we don't need for explicit rendering, this just covers the three
// methods that hook calls.
interface Window {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: { sitekey: string; size?: "normal" | "flexible" | "compact" }
    ) => string;
    reset: (widgetIdOrContainer?: string | HTMLElement) => void;
    remove: (widgetIdOrContainer?: string | HTMLElement) => void;
  };
}

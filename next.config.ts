import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hard cap on the size of any form submission, checked before the body is
  // read. Uploads are limited to 5MB in src/lib/storage.ts; this leaves room
  // for the other form fields. It also stops huge requests from reaching R2.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },

  // Development only: lets a phone on the same Wi-Fi open the dev server at
  // this computer's network address. Without it, Next blocks its dev scripts
  // for that address and the page loads with no JavaScript (frozen homepage
  // cube, missing stage text). Has no effect on a production build.
  allowedDevOrigins: ["192.168.1.241"],

  // Pins the workspace root explicitly. Without this, Turbopack walks up
  // looking for lockfiles and can pick up an unrelated one in a parent
  // directory (e.g. a stray package-lock.json in the user's home folder),
  // which produces a harmless but noisy "ignored package-lock.json" warning.
  turbopack: {
    root: path.join(__dirname),
  },

  // Keep Prisma's generated client out of Next's own bundler. On Cloudflare,
  // its WebAssembly query engine must be imported by the Cloudflare bundler
  // itself; Next's bundler wraps that import in a loader Prisma cannot read
  // ("The loaded wasm module was unexpectedly undefined").
  serverExternalPackages: [".prisma/client"],

  // Cloudflare Workers reach Postgres through pg-cloudflare, which Next's file
  // tracer skips (it only sees the empty Node-side stub). Force the whole
  // package into the deployed bundle. See scripts/fix-pg-cloudflare.mjs.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/pg-cloudflare/**/*"],
  },
  // Local upload folder (development only) must never be bundled into a deploy.
  outputFileTracingExcludes: {
    "/*": ["./private-uploads/**/*"],
  },

  // Baseline security headers on every response. Deliberately conservative:
  // no Content-Security-Policy yet, because Next's inline bootstrap scripts
  // need a nonce and getting that wrong breaks the whole app silently. These
  // three are safe and cost nothing.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Nothing here is meant to be framed, and the dashboard holds a
          // logged-in session, so deny framing outright (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Stops a browser from second-guessing the declared Content-Type.
          // Matters for /uploads/*: an uploaded file is stored with an
          // extension derived from its declared image type, and this keeps a
          // mislabelled file from ever being sniffed as HTML and run.
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // No page here needs the camera, microphone or geolocation.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

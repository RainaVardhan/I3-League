import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root explicitly. Without this, Turbopack walks up
  // looking for lockfiles and can pick up an unrelated one in a parent
  // directory (e.g. a stray package-lock.json in the user's home folder),
  // which produces a harmless but noisy "ignored package-lock.json" warning.
  turbopack: {
    root: path.join(__dirname),
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

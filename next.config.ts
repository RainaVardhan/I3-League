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
};

export default nextConfig;

// The published pg-cloudflare package points at dist/index.js but ships only
// dist/empty.js (a packaging bug). Without the real file, the Cloudflare build
// fails with "Could not resolve pg-cloudflare". Rebuild the missing file from
// the package's own source. Runs automatically after `npm install`.
import { existsSync } from "node:fs";
import { build } from "esbuild";

const pkg = "node_modules/pg-cloudflare";
if (!existsSync(`${pkg}/src/index.ts`)) process.exit(0); // package not installed
if (existsSync(`${pkg}/dist/index.js`)) process.exit(0); // already fine

await build({
  entryPoints: [`${pkg}/src/index.ts`],
  outfile: `${pkg}/dist/index.js`,
  format: "cjs",
  platform: "neutral",
  external: ["cloudflare:sockets", "events"],
  logLevel: "error",
});
console.log("Rebuilt pg-cloudflare/dist/index.js");

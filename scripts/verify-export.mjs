import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sep } from "node:path";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(
  new URL(".next/server/app-paths-manifest.json", root),
  "utf8",
));
const allowedRoutes = new Set([
  "/page",
  "/clocks/[slug]/page",
  "/favicon.ico/route",
  "/_not-found/page",
  "/_global-error/page",
]);
for (const route of Object.keys(manifest)) {
  assert.ok(allowedRoutes.has(route), `Non-gallery route in production: ${route}`);
}
for (const route of ["/page", "/clocks/[slug]/page", "/favicon.ico/route"]) {
  assert.ok(Object.hasOwn(manifest, route), `Missing gallery route: ${route}`);
}

const files = readdirSync(new URL("out/", root), { recursive: true })
  .map(file => file.split(sep).join("/"));
const pages = files.filter(file => file.endsWith(".html"));
assert.ok(pages.includes("index.html"), "Missing exported gallery");
for (const page of pages) {
  assert.match(
    page,
    /^(?:index\.html|404(?:\/index)?\.html|_not-found\/index\.html|clocks\/[^/]+\/index\.html)$/,
    `Non-gallery page in export: ${page}`,
  );
}
for (const file of files) {
  assert.doesNotMatch(file, /^(?:art|lab|explainers)(?:\/|$)/, `Preview asset in export: ${file}`);
  assert.doesNotMatch(file, /milkmaid/i, `Lab artwork in export: ${file}`);
}
const clockPages = pages.filter(page => page.startsWith("clocks/"));
assert.ok(clockPages.length > 0, "Missing exported clock detail pages");
console.log(`Verified gallery-only export: homepage and ${clockPages.length} clock detail pages.`);

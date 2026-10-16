import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_EXPORT,
} = require("next/constants");
const { createValidFileMatcher } = require("next/dist/server/lib/find-page-file");
const configModule = { exports: {} };
const compiled = ts.transpileModule(
  readFileSync(new URL("../next.config.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS }, reportDiagnostics: true },
);
assert.equal(compiled.diagnostics.length, 0);
vm.runInNewContext(compiled.outputText, {
  module: configModule,
  exports: configModule.exports,
  require,
});

function routesFor(phase) {
  const config = configModule.exports.default(phase);
  const appDirectory = fileURLToPath(new URL("../src/app", import.meta.url));
  const matcher = createValidFileMatcher(config.pageExtensions, appDirectory);
  return readdirSync(appDirectory, { recursive: true })
    .filter(file => matcher.isAppRouterPage(join(appDirectory, file)))
    .map(file => file.split(sep).join("/"))
    .sort();
}

const publicRoutes = [
  "clocks/[slug]/page.tsx",
  "favicon.ico",
  "page.tsx",
];

test("all production phases discover only the formal gallery routes", () => {
  for (const phase of [PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_EXPORT]) {
    assert.deepEqual(routesFor(phase), publicRoutes, phase);
  }
});

test("development keeps both the gallery and local preview routes", () => {
  assert.deepEqual(routesFor(PHASE_DEVELOPMENT_SERVER), [
    ...publicRoutes,
    "explainers/chords/page.dev.tsx",
    "lab/page.dev.tsx",
  ].sort());
});

test("public assets do not include experiments or unused starter images", () => {
  const files = readdirSync(new URL("../public/", import.meta.url), { recursive: true });
  for (const file of files) {
    assert.doesNotMatch(file, /^(?:art|lab)(?:[/\\]|$)/);
    assert.doesNotMatch(file, /^(?:file|globe|next|vercel|window)\.svg$/);
  }
});

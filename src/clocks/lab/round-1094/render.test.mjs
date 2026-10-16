import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();

function loadModule(filePath) {
  if (modules.has(filePath)) return modules.get(filePath).exports;
  const loaded = { exports: {} };
  modules.set(filePath, loaded);
  const compiled = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports: loaded.exports,
    module: loaded,
    require(specifier) {
      if (!specifier.startsWith(".")) return require(specifier);
      const base = resolve(dirname(filePath), specifier);
      const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
      if (!resolved) throw new Error(`Cannot resolve ${specifier} from ${filePath}`);
      return loadModule(resolved);
    },
  }, { filename: filePath });
  return loaded.exports;
}

const folder = dirname(fileURLToPath(import.meta.url));
const { BackTo001Clock } = loadModule(resolve(folder, "BackTo001Clock.tsx"));
const { backTo001Studies } = loadModule(resolve(folder, "catalog.ts"));
const { Hand } = loadModule(resolve(folder, "anatomy.tsx"));
const { getClockTime } = loadModule(resolve(folder, "../shared.tsx"));
const { WallClockProvider } = loadModule(resolve(folder, "../../WallClockProvider.tsx"));

function renderAt(date, entries = backTo001Studies) {
  return renderToStaticMarkup(createElement(
    WallClockProvider,
    { nowMs: date?.getTime() ?? null },
    entries.map((entry, index) => createElement(BackTo001Clock, {
      key: `${entry.id}-${index}`,
      id: entry.id,
      name: entry.nameEn,
    })),
  ));
}

test("new studies append without renaming or reordering the original twenty", () => {
  assert.equal(backTo001Studies.length, 30);
  assert.deepEqual(Array.from(backTo001Studies.slice(0, 20), entry => entry.nameEn), [
    "Open Rim", "Inward", "Hand in Hand", "Courtesy", "Wandering Pivot",
    "Two Sides", "Crosswise", "Still Hour", "Borrowed Numeral", "Cutout",
    "Loop", "Split Pin", "Right Angle", "Regard", "Common Stem",
    "Distant", "Interspace", "Inboard", "Parting", "Round Trip",
  ]);
  assert.equal(new Set(backTo001Studies.map(entry => entry.slug)).size, backTo001Studies.length);
  backTo001Studies.forEach((entry, index) => {
    assert.equal(entry.id, 1094 + index);
    assert.equal(entry.position, entry.id);
    assert.equal(entry.batch, 15);
    assert.ok(entry.mechanism.length && entry.reading.length);
  });
});

test("unchanged hands retain the dimensions and ink of 001", () => {
  const time = getClockTime(new Date(2026, 8, 7, 10, 8, 36));
  const expected = [[50, 10, 5, "#1a1a1a"], [74, 14, 3, "#1a1a1a"], [84, 20, 1.5, "#c1121f"]];
  expected.forEach(([tip, tail, width, color], index) => {
    const { props } = Hand({ time, index });
    assert.ok(Math.abs(Math.hypot(props.x2, props.y2) - tip) < 1e-10);
    assert.ok(Math.abs(Math.hypot(props.x1, props.y1) - tail) < 1e-10);
    assert.equal(props.strokeWidth, width);
    assert.equal(props.stroke, color);
    assert.equal(props.strokeLinecap, "round");
  });
});

test("all studies render synchronized finite artwork at meetings and rollovers", () => {
  const cases = [
    [0, 0, 0, 0],
    [0, 0, 0, 960],
    [1, 5, 27, 280],
    [6, 30, 0, 0],
    [9, 59, 59, 960],
    [10, 0, 0, 0],
    [11, 59, 59, 960],
    [12, 0, 0, 0],
    [23, 59, 59, 960],
  ];
  for (const [hours, minutes, seconds, milliseconds] of cases) {
    const markup = renderAt(new Date(2026, 8, 7, hours, minutes, seconds, milliseconds));
    const expected = [hours, minutes, seconds].map(value => String(value).padStart(2, "0")).join(":");
    const labels = Array.from(markup.matchAll(/aria-label="([^"]+)"/g), match => match[1]);
    assert.equal(labels.length, backTo001Studies.length);
    assert.ok(labels.every(label => label.endsWith(expected)));
    assert.equal((markup.match(/data-study=/g) ?? []).length, backTo001Studies.length);
    assert.doesNotMatch(markup, /NaN|Infinity|undefined/);
    for (const svg of markup.split("</svg>").slice(0, -1)) {
      assert.match(svg, /<(?:path|circle|line) /);
      assert.match(svg, /font-family="Georgia/);
    }
  }
});

test("server placeholders retain the dial but never guess a hand position", () => {
  const markup = renderAt(null);
  assert.equal((markup.match(/--:--:--/g) ?? []).length, backTo001Studies.length);
  assert.equal((markup.match(/<text /g) ?? []).length, backTo001Studies.length * 12);
  assert.doesNotMatch(markup, /data-hand=|data-linked-hand=|data-bowed-hand=|data-seconds-pivot=|data-hour-numeral=/);
});

test("the borrowed hour numeral is replaced exactly at each hour", () => {
  const entry = backTo001Studies.find(study => study.id === 1102);
  for (let hour = 0; hour < 24; hour++) {
    const markup = renderAt(new Date(2026, 8, 7, hour, 0, 0), [entry]);
    const numerals = Array.from(markup.matchAll(/<text\b[^>]*>(\d+)<\/text>/g), match => Number(match[1]));
    assert.equal(numerals.length, 12);
    assert.equal(new Set(numerals).size, 12);
    assert.equal(numerals.at(-1), hour % 12 || 12);
    assert.match(markup, /data-hour-numeral="true"/);
    assert.doesNotMatch(markup, /data-hand="hour"/);
  }
});

test("all studies animate from time alone and can be replayed exactly", () => {
  const start = new Date(2026, 8, 7, 10, 8, 5);
  const later = new Date(2026, 8, 7, 10, 8, 45);
  const artworkOnly = markup => markup.replace(/aria-label="[^"]+"/, "");
  for (const entry of backTo001Studies) {
    const first = renderAt(start, [entry]);
    const next = renderAt(later, [entry]);
    assert.equal(first, renderAt(start, [entry]), entry.nameEn);
    assert.notEqual(artworkOnly(first), artworkOnly(next), entry.nameEn);
  }
  const midnight = renderAt(new Date(2027, 0, 1, 0, 0, 0));
  assert.equal((midnight.match(/: 00:00:00"/g) ?? []).length, backTo001Studies.length);
});

test("repeated instances isolate every half-plane, cutout, and shadow", () => {
  const markup = renderAt(new Date(2026, 8, 7, 10, 8, 36), [...backTo001Studies, ...backTo001Studies]);
  const identifiers = Array.from(markup.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  const references = Array.from(markup.matchAll(/url\(#([^\)]+)\)/g), match => match[1]);
  assert.ok(identifiers.length >= 6);
  assert.equal(new Set(identifiers).size, identifiers.length);
  assert.ok(references.every(reference => identifiers.includes(reference)));
});
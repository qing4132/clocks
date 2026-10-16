import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
function load(filePath) {
  if (modules.has(filePath)) return modules.get(filePath).exports;
  const loaded = { exports: {} };
  modules.set(filePath, loaded);
  const result = ts.transpileModule(readFileSync(filePath, "utf8"), { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const errors = result.diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  assert.equal(errors.length, 0, errors.map(diagnostic => `${filePath}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`).join("\n"));
  const compiled = result.outputText;
  vm.runInNewContext(compiled, { exports: loaded.exports, module: loaded, require(specifier) {
    if (!specifier.startsWith(".")) return require(specifier);
    const base = resolve(dirname(filePath), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
    if (!resolved) throw new Error(`Cannot load ${specifier} from ${filePath}`);
    return load(resolved);
  } }, { filename: filePath });
  return loaded.exports;
}
const folder = dirname(fileURLToPath(import.meta.url));
const { InkClock, implementedFamilies } = load(resolve(folder, "InkClock.tsx"));
const { inkStudies, FAMILIES } = load(resolve(folder, "catalog.ts"));
const { WallClockProvider } = load(resolve(folder, "../../WallClockProvider.tsx"));
const { civilState } = load(resolve(folder, "civil-intervals.tsx"));
const { intervalState, nextMinuteBoundary, duration } = load(resolve(folder, "../open-200/motion-intervals.tsx"));
const entries = inkStudies;
function render(date, selected = entries) {
  return renderToStaticMarkup(createElement(WallClockProvider, { nowMs: date?.getTime() ?? null }, selected.map((entry, index) => createElement(InkClock, { key: `${entry.id}-${index}`, id: entry.id, name: entry.nameZh, family: entry.family, variant: entry.variant }))));
}

test("all two hundred entries have implemented renderers in all twenty families", () => {
  assert.equal(entries.length, 200);
  assert.equal(implementedFamilies.length, 20);
  assert.deepEqual([...implementedFamilies].sort(), [...FAMILIES].sort());
});

test("every clock renders the real time with finite nonempty geometry", () => {
  for (const values of [[0, 0, 0], [1, 5, 27], [6, 30, 30], [10, 8, 36], [23, 59, 59]]) {
    const output = render(new Date(2026, 8, 14, ...values));
    const reading = values.map(value => String(value).padStart(2, "0")).join(":");
    const labels = Array.from(output.matchAll(/aria-label="([^"]+)"/g), match => match[1]);
    assert.equal(labels.length, entries.length);
    assert.ok(labels.every(label => label.endsWith(reading)));
    const invalid = output.match(/\b(?:d|points|transform|[xy][12]?|c[xy]|r|r[xy]|width|height|opacity|stroke-width)="[^"]*(?:NaN|Infinity|undefined)[^"]*"/);
    assert.ok(!invalid, invalid?.[0]);
    output.split("</svg>").slice(0, -1).forEach(svg => assert.match(svg, /<(?:path|line|rect|circle|text) /));
    for (const match of output.matchAll(/(?:width|height|r|rx|ry)="(-?\d+(?:\.\d+)?)"/g)) assert.ok(Number(match[1]) >= 0, match[0]);
  }
});

test("all artwork obeys the original three-color palette and Georgia typography", () => {
  const output = render(new Date(2026, 8, 14, 10, 8, 36));
  const allowed = new Set(["#fafaf7", "#1a1a1a", "#c1121f", "none", "black", "white", "transparent"]);
  for (const match of output.matchAll(/(?:fill|stroke)="([^"]+)"/g)) assert.ok(allowed.has(match[1]) || match[1].startsWith("url(#"), match[1]);
  for (const match of output.matchAll(/font-family="([^"]+)"/g)) assert.match(match[1], /^Georgia,/);
  assert.doesNotMatch(output, /<linearGradient|<radialGradient|feGaussianBlur|hsl\(/);
});

test("each construction is distinct and replays without accumulated state", () => {
  const seen = new Set();
  const body = markup => markup.slice(markup.indexOf(">") + 1, markup.lastIndexOf("</svg>"));
  for (const entry of entries) {
    const first = render(new Date(2026, 8, 14, 10, 8, 36), [entry]);
    assert.equal(first, render(new Date(2026, 8, 14, 10, 8, 36), [entry]));
    assert.notEqual(body(first), body(render(new Date(2026, 8, 14, 17, 49, 12), [entry])), entry.nameZh);
    const structure = body(first).replaceAll(/data-[a-z-]+="[^"]*"/g, "");
    assert.ok(!seen.has(structure), entry.nameZh);
    seen.add(structure);
  }
});

test("initial rendering never guesses a local time and duplicate SVG IDs stay isolated", () => {
  const initial = render(null);
  assert.equal((initial.match(/--:--:--/g) ?? []).length, entries.length);
  assert.doesNotMatch(initial, /<(?:path|line|text|circle) /);
  const output = render(new Date(2026, 8, 14, 10, 8, 36), [...entries, ...entries]);
  const ids = Array.from(output.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  const references = Array.from(output.matchAll(/url\(#([^\)]+)\)/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(references.every(reference => ids.includes(reference)));
});

test("drawn counting marks encode every minute and hour without an off-by-one", () => {
  const minuteEntries = entries.filter(entry => entry.family === "counts" && [0, 1, 3, 4, 5, 9].includes(entry.variant));
  for (let minute = 0; minute < 60; minute++) {
    for (const entry of minuteEntries) {
      const output = render(new Date(2026, 8, 14, 10, minute, 0), [entry]);
      assert.equal((output.match(/data-counted="minute"/g) ?? []).length, minute, `${entry.nameEn}: ${minute}`);
    }
  }
  const hourEntry = entries.find(entry => entry.family === "counts" && entry.variant === 2);
  for (let hour = 0; hour < 24; hour++) {
    assert.equal((render(new Date(2026, 8, 14, hour), [hourEntry]).match(/data-counted="hour"/g) ?? []).length, hour);
  }
});

test("the red second ladder counts from zero without an extra lit mark", () => {
  const entry = entries.find(candidate => candidate.family === "seconds" && candidate.variant === 8);
  for (let second = 0; second < 60; second++) {
    const output = render(new Date(2026, 8, 14, 10, 8, second), [entry]);
    assert.equal((output.match(/data-counted="second"/g) ?? []).length, second);
  }
});

test("overlapping duet faces draw the obscurable hand above both dial surfaces", () => {
  for (const [variant, unit] of [[1, "minute"], [2, "hour"], [3, "hour"], [7, "hour"]]) {
    const entry = entries.find(candidate => candidate.family === "duets" && candidate.variant === variant);
    const output = render(new Date(2026, 8, 14, 4, 44, 0), [entry]);
    const hand = output.lastIndexOf(`data-duet-hand="${unit}"`);
    assert.ok(hand > output.lastIndexOf('stroke-width="1.7" />'), entry.nameEn);
    assert.equal((output.match(new RegExp(`data-duet-hand="${unit}"`, "g")) ?? []).length, 2);
  }
});

test("elapsed time never rounds up to tomorrow while countdowns keep their last second", () => {
  const entry = entries.find(candidate => candidate.family === "intervals" && candidate.variant === 6);
  const output = render(new Date(2026, 11, 31, 23, 59, 59, 900), [entry]);
  assert.match(output, />23:59:59<\/text>/);
  assert.match(output, />00:00:01<\/text>/);
  assert.doesNotMatch(output, />24:00:00<\/text>/);
});

test("civil marks use the real month length, leap year and ISO weekday", () => {
  for (const [year, month, day, daysInMonth, daysInYear, weekday] of [[2024, 1, 29, 29, 366, 3], [2026, 1, 28, 28, 365, 5], [2100, 1, 28, 28, 365, 6], [2026, 11, 31, 31, 365, 3]]) {
    const date = new Date(year, month, day, 23, 59, 59, 900);
    const state = civilState(date);
    assert.equal(state.daysInMonth, daysInMonth);
    assert.equal(state.daysInYear, daysInYear);
    assert.equal(state.weekday, weekday);
    assert.ok(state.yearProgress > 0 && state.yearProgress < 1);
    const output = render(date, entries.filter(entry => entry.family === "civil"));
    assert.equal((output.match(new RegExp(`data-days-in-month="${daysInMonth}"`, "g")) ?? []).length, 10);
  }
  assert.equal(civilState(new Date(2027, 0, 1)).yearProgress, 0);
});

test("local countdowns respect short and long DST days and repeated hours", () => {
  const originalZone = process.env.TZ;
  try {
    for (const [zone, month, day, hours] of [["America/New_York", 2, 8, 23], ["America/New_York", 10, 1, 25], ["Australia/Lord_Howe", 9, 4, 23.5], ["Australia/Lord_Howe", 3, 5, 24.5]]) {
      process.env.TZ = zone;
      const midnight = new Date(2026, month, day);
      const state = intervalState(midnight);
      assert.equal(state.dayLength, hours * 3600, zone);
      assert.equal(state.day, state.dayLength);
      const halfway = new Date(midnight.getTime() + state.dayLength * 500);
      const middle = intervalState(halfway);
      assert.equal(middle.elapsed + middle.day, state.dayLength);
      assert.equal(civilState(halfway).dayProgress, .5);
    }
    process.env.TZ = "America/New_York";
    const repeatedHour = new Date("2026-11-01T01:59:59.500-04:00");
    assert.equal(nextMinuteBoundary(repeatedHour, 60) - repeatedHour.getTime(), 500);
    assert.equal(new Date(nextMinuteBoundary(repeatedHour, 60)).getHours(), 1);
    process.env.TZ = "Australia/Lord_Howe";
    const halfHourShift = new Date("2026-04-05T01:59:59.500+11:00");
    assert.equal(nextMinuteBoundary(halfHourShift, 60) - halfHourShift.getTime(), 1_800_500);
    assert.equal(duration(59.999), "01:00");
    assert.equal(duration(.001), "00:01");
    assert.equal(duration(24.5 * 3600, true), "24:30:00");
  } finally {
    if (originalZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalZone;
  }
});
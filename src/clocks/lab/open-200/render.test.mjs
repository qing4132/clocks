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
function load(filePath) {
  if (modules.has(filePath)) return modules.get(filePath).exports;
  const loaded = { exports: {} };
  modules.set(filePath, loaded);
  const compiled = ts.transpileModule(readFileSync(filePath, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
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
const { OpenClock, implementedFamilies } = load(resolve(folder, "OpenClock.tsx"));
const { openStudies } = load(resolve(folder, "catalog.ts"));
const { WallClockProvider } = load(resolve(folder, "../../WallClockProvider.tsx"));
const { arithmeticExpression, timeBits } = load(resolve(folder, "binary-arithmetic.tsx"));
const { calendarState } = load(resolve(folder, "signals-calendar.tsx"));
const { intervalState, nextMinuteBoundary } = load(resolve(folder, "motion-intervals.tsx"));
const entries = openStudies.filter(entry => implementedFamilies.includes(entry.family));

function render(date, selected = entries) {
  return renderToStaticMarkup(createElement(WallClockProvider, { nowMs: date?.getTime() ?? null }, selected.map(entry => createElement(OpenClock, { key: entry.id, id: entry.id, family: entry.family, variant: entry.variant, name: entry.nameEn }))));
}

test("all 200 catalog entries have implemented renderers", () => {
  assert.equal(implementedFamilies.length, 20);
  assert.equal(entries.length, 200);
});

test("every implemented study renders finite, nonempty geometry at boundaries", () => {
  for (const values of [[0, 0, 0], [1, 5, 27], [6, 30, 30], [9, 59, 59], [12, 0, 0], [23, 59, 59]]) {
    const output = render(new Date(2026, 8, 14, ...values));
    const reading = values.map(value => String(value).padStart(2, "0")).join(":");
    const labels = Array.from(output.matchAll(/aria-label="([^"]+)"/g), match => match[1]);
    assert.equal(labels.length, entries.length);
    assert.ok(labels.every(label => label.endsWith(reading)));
    const invalid = output.match(/\b(?:d|points|transform|[xy][12]?|c[xy]|r|r[xy]|width|height|opacity|stroke-width)="[^"]*(?:NaN|Infinity|undefined)[^"]*"/);
    assert.ok(!invalid, invalid?.[0]);
    output.split("</svg>").slice(0, -1).forEach(svg => assert.match(svg, /<(?:line|circle|rect|path|text) /));
    for (const match of output.matchAll(/(?:width|height|r|rx|ry)="(-?\d+(?:\.\d+)?)"/g)) assert.ok(Number(match[1]) >= 0, match[0]);
  }
});

test("every drawing has a unique structure and changes with time", () => {
  const drawings = new Set();
  for (const entry of entries) {
    const first = render(new Date(2026, 8, 14, 10, 8, 36), [entry]);
    const again = render(new Date(2026, 8, 14, 10, 8, 36), [entry]);
    const later = render(new Date(2026, 8, 14, 17, 49, 12), [entry]);
    const body = value => value.slice(value.indexOf(">") + 1, value.lastIndexOf("</svg>"));
    assert.equal(first, again, entry.nameEn);
    assert.notEqual(body(first), body(later), entry.nameEn);
    const normalized = body(first).replaceAll(/(?:fill|stroke)="[^"]+"/g, "");
    assert.ok(!drawings.has(normalized), `Duplicate drawing: ${entry.nameEn}`);
    drawings.add(normalized);
  }
});

test("server placeholders do not guess any local time", () => {
  const output = render(null);
  assert.equal((output.match(/--:--:--/g) ?? []).length, entries.length);
  assert.doesNotMatch(output, /<(?:path|text|circle) /);
});

test("translated readouts use their local coordinates instead of the face center", () => {
  const date = new Date(2026, 8, 14, 23, 59, 59);
  const travel = render(date, entries.filter(entry => entry.id === 1191));
  const elastic = render(date, entries.filter(entry => entry.id === 1319));
  assert.equal((travel.match(/<text x="0" y="85"/g) ?? []).length, 3);
  assert.equal((elastic.match(/<text x="0" y="0"/g) ?? []).length, 4);
});

test("diagonal cells count every minute exactly and the twin pivots have only three hands", () => {
  const diagonal = entries.filter(entry => entry.family === "tiles" && entry.variant === 6);
  for (let minute = 0; minute < 60; minute++) {
    const output = render(new Date(2026, 8, 14, 10, minute, 36), diagonal);
    assert.equal((output.match(/data-counted="true"/g) ?? []).length, minute);
    assert.equal((output.match(/data-counted=/g) ?? []).length, 60);
  }
  const twins = render(new Date(2026, 8, 14, 10, 8, 36), entries.filter(entry => entry.id === 1144));
  assert.equal((twins.match(/data-twin-hand=/g) ?? []).length, 3);
  assert.doesNotMatch(twins, /data-unit=/);
});

test("all arithmetic representations and binary words reconstruct every value", () => {
  for (let value=0; value<60; value++) {
    for (let variant=0; variant<10; variant++) {
      const entry=arithmeticExpression(value, variant, value<24?0:1);
      assert.equal(entry.evaluated,value,entry.expression);
    }
    assert.equal(timeBits(value).reduce((total,bit)=>total*2+bit,0),value);
    const gray=timeBits(value,true).reduce((total,bit)=>total*2+bit,0);
    let decoded=gray;
    for(let shift=gray>>1;shift>0;shift>>=1) decoded^=shift;
    assert.equal(decoded,value);
  }
});

test("calendar structures honor leap days, century rules, and month lengths", () => {
  assert.equal(calendarState(new Date(2024,1,29)).days,29);
  assert.equal(calendarState(new Date(2024,1,29)).ordinal,60);
  assert.equal(calendarState(new Date(2024,11,31)).yearDays,366);
  assert.equal(calendarState(new Date(2100,1,28)).days,28);
  assert.equal(calendarState(new Date(2100,11,31)).yearDays,365);
  assert.equal(calendarState(new Date(2000,1,29)).days,29);
});

test("local intervals follow actual midnight and repeated or skipped hours", () => {
  const originalTimezone = process.env.TZ;
  try {
    process.env.TZ = "America/New_York";
    assert.equal(intervalState(new Date("2026-03-08T00:00:00-05:00")).day, 23 * 3600);
    assert.equal(intervalState(new Date("2026-11-01T00:00:00-04:00")).day, 25 * 3600);
    assert.equal(intervalState(new Date("2026-11-01T01:59:59-04:00")).hour, 1);
    assert.equal(intervalState(new Date("2026-03-08T01:59:59-05:00")).hour, 1);
    assert.equal(intervalState(new Date("2026-12-31T23:59:59-05:00")).day, 1);
    process.env.TZ = "Australia/Lord_Howe";
    const jump = new Date("2026-10-04T01:59:59+10:30");
    assert.equal(new Date(nextMinuteBoundary(jump, 60)).getMinutes(), 0);
    assert.equal(intervalState(jump).hour, 1801);
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test("SVG masks and clip paths have distinct IDs across duplicate clock instances", () => {
  const selection = entries.filter(entry => ["paper", "waves", "contours", "lattices", "optics", "motion"].includes(entry.family));
  const output = render(new Date(2026, 8, 14, 14, 37, 25), [...selection, ...selection]);
  const identifiers = Array.from(output.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  const references = Array.from(output.matchAll(/url\(#([^\)]+)\)/g), match => match[1]);
  assert.equal(identifiers.length, new Set(identifiers).size);
  assert.ok(identifiers.length > 0);
  assert.ok(references.every(reference => identifiers.includes(reference)));
});
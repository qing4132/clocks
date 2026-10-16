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
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
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
const { PerceptionClock } = loadModule(resolve(folder, "PerceptionClock.tsx"));
const { perceptionStudies } = loadModule(resolve(folder, "catalog.ts"));
const { WallClockProvider } = loadModule(resolve(folder, "../../WallClockProvider.tsx"));

function renderAt(date, entries = perceptionStudies) {
  return renderToStaticMarkup(createElement(
    WallClockProvider,
    { nowMs: date?.getTime() ?? null },
    entries.map((entry, index) => createElement(PerceptionClock, { key: `${entry.id}-${index}`, id: entry.id, name: entry.nameEn })),
  ));
}

test("exactly eight new Lab-only studies are appended after the retained thirty", () => {
  assert.equal(perceptionStudies.length, 8);
  assert.equal(new Set(perceptionStudies.map(entry => entry.slug)).size, 8);
  perceptionStudies.forEach((entry, index) => {
    assert.equal(entry.id, 1124 + index);
    assert.equal(entry.position, entry.id);
    assert.equal(entry.batch, 16);
    assert.ok(entry.description && entry.mechanism && entry.reading);
  });
});

test("SVG and canvas studies share correct controlled readings at boundaries", () => {
  for (const [hours, minutes, seconds, milliseconds] of [[0, 0, 0, 0], [1, 5, 27, 300], [9, 59, 59, 950], [10, 0, 0, 0], [12, 30, 30, 0], [23, 59, 59, 950]]) {
    const markup = renderAt(new Date(2026, 8, 13, hours, minutes, seconds, milliseconds));
    const reading = [hours, minutes, seconds].map(value => String(value).padStart(2, "0")).join(":");
    const labels = Array.from(markup.matchAll(/aria-label="([^"]+)"/g), match => match[1]);
    assert.equal(labels.length, 8);
    assert.ok(labels.every(label => label.endsWith(reading)));
    assert.equal((markup.match(/data-perception=/g) ?? []).length, 8);
    assert.equal((markup.match(/<canvas /g) ?? []).length, 3);
    assert.doesNotMatch(markup, /NaN|Infinity|undefined/);
  }
});

test("the two scales update together at every hour and minute rollover", () => {
  const entry = perceptionStudies.find(study => study.id === 1130);
  for (const [hour, minute] of [[0, 0], [9, 59], [10, 0], [14, 37], [23, 59]]) {
    const markup = renderAt(new Date(2026, 8, 13, hour, minute, 10), [entry]);
    const hours = String(hour).padStart(2, "0");
    const minutes = String(minute).padStart(2, "0");
    assert.ok(markup.includes(`data-macro-hour="${hours}"`));
    assert.ok(markup.includes(`data-micro-minute="${minutes}"`));
    assert.ok(markup.includes(`${minutes} ${minutes} ${minutes}`));
  }
});

test("the phantom interiors are unfilled and the disappearing targets never fade", () => {
  for (let second = 0; second < 60; second += 5) {
    const date = new Date(2026, 8, 13, 10, 8, second);
    const phantom = renderAt(date, [perceptionStudies.find(study => study.id === 1126)]);
    const inducerPaths = Array.from(phantom.matchAll(/<path\b[^>]*data-colored-inducers="[^"]+"[^>]*>/g), match => match[0]);
    assert.equal(inducerPaths.length, 2);
    assert.ok(inducerPaths.every(path => path.includes('fill="none"')));
    assert.doesNotMatch(phantom, /<filter|feGaussianBlur/);
    const blindSpot = renderAt(date, [perceptionStudies.find(study => study.id === 1131)]);
    assert.equal((blindSpot.match(/data-always-drawn="(?:hour|minute)" opacity="1"/g) ?? []).length, 2);
    assert.doesNotMatch(blindSpot, /opacity="0|visibility:|display:none/);
  }
});

test("the ambiguous depth scaffold stays unchanged while time advances", () => {
  const entry = perceptionStudies.find(study => study.id === 1125);
  const first = renderAt(new Date(2026, 8, 13, 1, 23, 45), [entry]);
  const later = renderAt(new Date(2026, 8, 13, 18, 57, 1), [entry]);
  const scaffold = markup => markup.match(/<g data-ambiguous-prism="true"[^>]*>[\s\S]*?<\/g>/)?.[0];
  assert.ok(scaffold(first));
  assert.equal(scaffold(first), scaffold(later));
  assert.notEqual(first, later);
});

test("the server never invents local time and repeated instances isolate SVG definitions", () => {
  const placeholder = renderAt(null);
  assert.equal((placeholder.match(/--:--:--/g) ?? []).length, 8);
  assert.doesNotMatch(placeholder, /<text /);
  const markup = renderAt(new Date(2026, 8, 13, 10, 8, 36), [...perceptionStudies, ...perceptionStudies]);
  const ids = Array.from(markup.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  const references = Array.from(markup.matchAll(/url\(#([^\)]+)\)/g), match => match[1]);
  assert.ok(ids.length >= 10);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(references.every(reference => ids.includes(reference)));
});
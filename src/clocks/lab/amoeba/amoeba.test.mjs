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
  assert.equal(errors.length, 0, errors.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")).join("\n"));
  vm.runInNewContext(result.outputText, { exports: loaded.exports, module: loaded, require(specifier) {
    if (!specifier.startsWith(".")) return require(specifier);
    const base = resolve(dirname(filePath), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
    assert.ok(resolved, specifier);
    return load(resolved);
  } }, { filename: filePath });
  return loaded.exports;
}

const folder = dirname(fileURLToPath(import.meta.url));
const { amoebaShape, amoebaPoint, amoebaStroke } = load(resolve(folder, "geometry.ts"));
const { sculptedRadius, sculptedTime, coalescentTime, carryWindow, transferTime, viscousPoint, viscousNeedle } = load(resolve(folder, "variant-geometry.ts"));
const { AmoebaClock, AmoebaFace } = load(resolve(folder, "AmoebaClock.tsx"));
const { AmoebaVariantClock } = load(resolve(folder, "variants.tsx"));
const { amoebaStudy, amoebaVariantStudies } = load(resolve(folder, "entry.ts"));
const { inkStudies } = load(resolve(folder, "../ink-200/catalog.ts"));
const { HANDS } = load(resolve(folder, "../ink-200/shared.tsx"));
const { getClockTime } = load(resolve(folder, "../shared.tsx"));
const { path } = load(resolve(folder, "../ink-200/geometry.ts"));
const { WallClockProvider } = load(resolve(folder, "../../WallClockProvider.tsx"));
const epoch = new Date(2026, 8, 15, 10, 8, 36).getTime();
const face = milliseconds => renderToStaticMarkup(createElement(AmoebaFace, { date: new Date(milliseconds) }));

test("one new study follows the intact Ink 200 batch and includes a Chinese hint", () => {
  assert.equal(inkStudies.length, 200);
  assert.equal(amoebaStudy.id, inkStudies.at(-1).id + 1);
  assert.equal(amoebaStudy.position, 1532);
  assert.equal(amoebaStudy.batch, 19);
  assert.match(amoebaStudy.hintZh, /阿米巴.*针尖/);
});

test("the shared deformation stays bounded, one-to-one, and consistent behind the pivot", () => {
  for (let frame = 0; frame < 240; frame++) {
    const shape = amoebaShape(epoch + frame * 1379);
    const derivativeBound = 2 * Math.hypot(shape.bend.x, shape.bend.y) + 3 * Math.hypot(shape.oval.x, shape.oval.y) + 4 * Math.hypot(shape.lobe.x, shape.lobe.y);
    assert.ok(derivativeBound < 75);
    for (let index = 0; index < 360; index++) {
      const turns = index / 360;
      const outline = amoebaPoint(96, turns, shape);
      const tail = amoebaPoint(-14, turns, shape);
      const opposite = amoebaPoint(14, turns + .5, shape);
      assert.ok(Math.hypot(outline.x, outline.y) <= 96 + 1e-10);
      assert.ok(Math.hypot(outline.x, outline.y) >= 54 - 1e-10);
      assert.ok(Math.hypot(tail.x - opposite.x, tail.y - opposite.y) < 1e-10);
      const angle = turns * Math.PI * 2;
      assert.ok(outline.x * Math.sin(angle) - outline.y * Math.cos(angle) > 0);
    }
    const center = amoebaPoint(0, 0, shape);
    assert.equal(Math.hypot(center.x, center.y), 0);
  }
});

test("shape changes are continuous at oscillator wraps, midnight, and time-zone transitions", () => {
  for (const boundary of [0, 37_000, 53_000, 71_000, new Date(2027, 0, 1).getTime(), Date.parse("2026-11-01T06:00:00Z")]) {
    const before = amoebaShape(boundary - 1);
    const after = amoebaShape(boundary + 1);
    for (let index = 0; index < 120; index++) {
      const first = amoebaPoint(96, index / 120, before);
      const last = amoebaPoint(96, index / 120, after);
      assert.ok(Math.hypot(first.x - last.x, first.y - last.y) < .06);
    }
  }
  const spread = milliseconds => {
    const shape = amoebaShape(milliseconds);
    return Array.from({ length: 24 }, (_, index) => Math.hypot(...Object.values(amoebaPoint(96, index / 24, shape))));
  };
  const first = spread(epoch);
  const later = spread(epoch + 8000);
  assert.ok(first.reduce((sum, radius, index) => sum + Math.abs(radius - later[index]), 0) > 50);
  assert.notEqual(Math.max(...first) - Math.min(...first), Math.max(...later) - Math.min(...later));
});

test("material lines bend with the face instead of only changing radial length", () => {
  let largestBend = 0;
  for (let frame = 0; frame < 24; frame++) {
    const shape = amoebaShape(epoch + frame * 1000);
    for (let bearing = 0; bearing < 12; bearing++) {
      const center = amoebaPoint(0, bearing / 12, shape);
      const middle = amoebaPoint(37, bearing / 12, shape);
      const tip = amoebaPoint(74, bearing / 12, shape);
      const chord = Math.hypot(tip.x - center.x, tip.y - center.y);
      const bend = Math.abs((middle.x - center.x) * (tip.y - center.y) - (middle.y - center.y) * (tip.x - center.x)) / chord;
      largestBend = Math.max(largestBend, bend);
    }
  }
  assert.ok(largestBend > 3, `largest needle bend: ${largestBend}`);
});

test("shape velocity has no sharp framewise fitting or phase-join reversals", () => {
  let largestChange = 0;
  for (let elapsed = 0; elapsed < 180_000; elapsed += 80) {
    const before = amoebaShape(epoch + elapsed - 16);
    const current = amoebaShape(epoch + elapsed);
    const after = amoebaShape(epoch + elapsed + 16);
    for (let index = 0; index < 12; index++) {
      const first = amoebaPoint(96, index / 12, before);
      const middle = amoebaPoint(96, index / 12, current);
      const last = amoebaPoint(96, index / 12, after);
      largestChange = Math.max(largestChange, Math.hypot(last.x - 2 * middle.x + first.x, last.y - 2 * middle.y + first.y));
    }
  }
  assert.ok(largestChange < .002, `largest 16ms displacement change: ${largestChange}`);
});

test("traveling contours keep their area without framewise rescaling or collapsing to a circle", () => {
  const areas = [];
  for (let frame = 0; frame < 120; frame++) {
    const shape = amoebaShape(epoch + frame * 1237);
    const points = Array.from({ length: 240 }, (_, index) => amoebaPoint(96, index / 240, shape));
    const area = points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - point.y * next.x;
    }, 0) / 2;
    areas.push(area);
    const radii = points.map(point => Math.hypot(point.x, point.y));
    assert.ok(Math.max(...radii) - Math.min(...radii) > 15);
  }
  assert.ok(Math.max(...areas) - Math.min(...areas) < 1e-6);
});

test("complete painted needles and ticks follow the same mapped material lines", () => {
  for (const milliseconds of [epoch, epoch + 8000, epoch + 28_000]) {
    const shape = amoebaShape(milliseconds);
    const time = getClockTime(new Date(milliseconds));
    const output = face(milliseconds);
    for (const hand of HANDS) {
      const points = amoebaStroke(-hand.tail, hand.tip, time[hand.key], shape);
      assert.deepEqual(points[0], amoebaPoint(-hand.tail, time[hand.key], shape));
      assert.deepEqual(points.at(-1), amoebaPoint(hand.tip, time[hand.key], shape));
      assert.ok(points.some(point => Math.hypot(point.x, point.y) === 0));
      assert.ok(output.includes(`data-hand="${hand.key}" d="${path(points)}"`));
    }
    for (let index = 0; index < 60; index++) {
      const points = amoebaStroke(92, index % 5 === 0 ? 82 : 88, index / 60, shape, 4);
      assert.ok(output.includes(`data-tick="${index}" d="${path(points)}"`));
    }
    assert.doesNotMatch(output, /<line /);
  }
});

test("the rendered face retains 001 typography, sixty marks, three hands, and original inks", () => {
  for (const milliseconds of [epoch, epoch + 16, new Date(2026, 8, 15).getTime(), new Date(2026, 11, 31, 23, 59, 59, 984).getTime()]) {
    const output = face(milliseconds);
    assert.equal((output.match(/data-tick=/g) ?? []).length, 60);
    assert.equal((output.match(/<text /g) ?? []).length, 12);
    assert.equal((output.match(/data-hand=/g) ?? []).length, 3);
    assert.match(output, /data-amoeba-outline="true"/);
    assert.doesNotMatch(output, /NaN|Infinity|undefined|<filter|<linearGradient|<radialGradient/);
    const allowed = new Set(["#fafaf7", "#1a1a1a", "#c1121f", "none"]);
    for (const match of output.matchAll(/(?:fill|stroke)="([^"]+)"/g)) assert.ok(allowed.has(match[1]));
    for (const match of output.matchAll(/font-family="([^"]+)"/g)) assert.match(match[1], /^Georgia,/);
    for (const hand of HANDS) assert.match(output, new RegExp(`data-hand="${hand.key}"[^>]+stroke="${hand.color}" stroke-width="${hand.width}"`));
  }
});

test("wall-clock control gives deterministic replay and never invents an initial time", () => {
  const render = milliseconds => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: milliseconds }, createElement(AmoebaClock)));
  assert.equal(render(epoch), render(epoch));
  assert.notEqual(face(epoch), face(epoch + 8000));
  assert.match(render(epoch), /aria-label="Amoeba 10:08:36"/);
  assert.doesNotMatch(render(null), /<(?:path|line|text|circle) /);
  assert.match(render(null), /--:--:--/);
});

test("the sculpted body follows the true hour and minute without separate needles", () => {
  for (let minute = 0; minute < 720; minute += 3) {
    const time = getClockTime(new Date(epoch + minute * 60_000));
    const geometry = sculptedTime(time);
    for (const [point, turns] of [[geometry.hourTip, time.hour], [geometry.minuteTip, time.minute]]) {
      const angle = turns * Math.PI * 2;
      assert.ok(Math.abs(point.x * Math.cos(angle) + point.y * Math.sin(angle)) < 1e-9);
      assert.ok(point.x * Math.sin(angle) - point.y * Math.cos(angle) > 0);
    }
    assert.ok(geometry.outline.every(point => Math.hypot(point.x, point.y) < 75));
  }
  const meeting = sculptedTime(getClockTime(new Date(2026, 8, 16, 12)));
  assert.ok(Math.hypot(meeting.hourTip.x - meeting.minuteTip.x, meeting.hourTip.y - meeting.minuteTip.y) > 6);
});

test("sculpted lobes remain smooth through meetings and the twelve-o'clock wrap", () => {
  for (let bearing = 0; bearing < 60; bearing++) {
    const before = sculptedRadius(bearing / 60, .99999, .99999);
    const after = sculptedRadius(bearing / 60, .00001, .00001);
    assert.ok(Math.abs(after - before) < .04);
  }
});

test("liquid drops merge at meetings and disconnect at opposite clock bearings", () => {
  const meeting = coalescentTime(getClockTime(new Date(2026, 8, 16, 12)));
  const separated = coalescentTime(getClockTime(new Date(2026, 8, 16, 6)));
  assert.equal(meeting.join, 1);
  assert.ok(meeting.neck.length > 0);
  assert.equal(separated.join, 0);
  assert.equal(separated.neck, "");
  for (let minute = 0; minute < 720; minute++) {
    const state = coalescentTime(getClockTime(new Date(2026, 8, 16, 0, minute)));
    assert.ok(state.distance >= 26 - 1e-8);
    assert.ok(state.join >= 0 && state.join <= 1);
    assert.doesNotMatch(state.fill + state.edges + state.neck, /NaN|Infinity|undefined/);
  }
});

test("near-separated drops never collapse their nearly complete arcs into empty arcs", () => {
  const time = getClockTime(new Date(2026, 8, 16, 12));
  for (const gap of [.1, .01, .001, .0001]) {
    const distance = 58 - gap;
    const angle = Math.acos((38 ** 2 + 64 ** 2 - distance ** 2) / (2 * 38 * 64));
    const geometry = coalescentTime({ ...time, hour: 0, minute: angle / (2 * Math.PI) });
    if (geometry.join === 0) {
      assert.equal((geometry.edges.match(/ Z/g) ?? []).length, 2);
    } else {
      for (const segment of geometry.edges.split(" M ")) {
        const coordinates = segment.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
        assert.ok(Math.hypot(coordinates[0] - coordinates.at(-2), coordinates[1] - coordinates.at(-1)) > 0);
      }
    }
  }
});

test("every added variant renders synchronized local time and replays without state", () => {
  const render = (study, milliseconds) => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: milliseconds }, createElement(AmoebaVariantClock, { id: study.id, name: study.nameEn, variant: study.variant })));
  const drawings = new Set();
  for (const study of amoebaVariantStudies) {
    for (const milliseconds of [epoch, new Date(2026, 8, 16, 12).getTime(), new Date(2026, 11, 31, 23, 59, 59, 980).getTime()]) {
      const output = render(study, milliseconds);
      assert.equal(output, render(study, milliseconds));
      assert.match(output, /<path /);
      assert.doesNotMatch(output, /NaN|Infinity|undefined/);
      for (const match of output.matchAll(/(?:fill|stroke)="([^"]+)"/g)) assert.ok(["#fafaf7", "#1a1a1a", "#c1121f", "none"].includes(match[1]));
      for (const match of output.matchAll(/font-family="([^"]+)"/g)) assert.match(match[1], /^Georgia,/);
      for (const match of output.matchAll(/(?:stroke-width|r)="(-?\d+(?:\.\d+)?)"/g)) assert.ok(Number(match[1]) >= 0);
      const date = new Date(Math.floor(milliseconds / 20) * 20);
      const reading = [date.getHours(), date.getMinutes(), date.getSeconds()].map(value => String(value).padStart(2, "0")).join(":");
      assert.ok(output.includes(`aria-label="${study.nameEn} ${reading}"`));
    }
    assert.doesNotMatch(render(study, null), /<(?:path|line|circle|text) /);
    assert.notEqual(render(study, epoch), render(study, epoch + 5000));
    const output = render(study, epoch);
    const body = output.slice(output.indexOf(">") + 1, output.lastIndexOf("</svg>")).replaceAll(/data-[a-z-]+="[^"]*"/g, "");
    assert.ok(!drawings.has(body));
    drawings.add(body);
  }
});

test("four distinct variants append after the existing Amoeba without renumbering it", () => {
  assert.deepEqual(Array.from(amoebaVariantStudies, study => study.id), [1533, 1534, 1535, 1536]);
  assert.equal(new Set(amoebaVariantStudies.map(study => study.variant)).size, 4);
  assert.ok(amoebaVariantStudies.every(study => study.batch === 19 && study.position === study.id && /[\u4e00-\u9fff]/.test(study.hintZh)));
  assert.equal(amoebaStudy.id, 1532);
});

test("carry packets occur only at real minute and hour boundaries without reversing at zero", () => {
  for (const period of [60, 3600]) {
    assert.equal(carryWindow(period / 2, period).active, false);
    assert.equal(carryWindow(period - 2, period).strength, 0);
    assert.equal(carryWindow(2, period).strength, 0);
    const before = carryWindow(period - .001, period);
    const after = carryWindow(.001, period);
    assert.ok(after.progress > before.progress);
    assert.ok(Math.abs(after.strength - before.strength) < .004);
  }
  const minute = transferTime(getClockTime(new Date(2026, 8, 16, 10, 9, 0)));
  const hour = transferTime(getClockTime(new Date(2026, 8, 16, 11, 0, 0)));
  assert.ok(minute.minute.active && !minute.hour.active);
  assert.ok(hour.minute.active && hour.hour.active);
  const before = transferTime(getClockTime(new Date(2026, 11, 31, 23, 59, 59, 980)));
  const after = transferTime(getClockTime(new Date(2027, 0, 1, 0, 0, 0, 20)));
  assert.ok(after.minute.progress > before.minute.progress);
  assert.ok(after.hour.progress > before.hour.progress);
  assert.ok(Math.hypot(after.minute.point.x - before.minute.point.x, after.minute.point.y - before.minute.point.y) < 2);
});

test("viscous needles lag inside the face while all three tips stay on the real bearings", () => {
  let bend = 0;
  for (let step = 0; step < 120; step++) {
    const time = getClockTime(new Date(epoch + step * 11713));
    for (const hand of HANDS) {
      const points = viscousNeedle(time, hand.key, hand.tip, hand.tail);
      const tip = viscousPoint(hand.tip, time[hand.key], time.second);
      assert.ok(Math.hypot(points.at(-1).x - tip.x, points.at(-1).y - tip.y) < 1e-9);
      assert.ok(points.some(point => Math.hypot(point.x, point.y) === 0));
      assert.ok(points.every(point => Math.hypot(point.x, point.y) < 96));
      for (const point of points) bend = Math.max(bend, Math.abs(point.x * tip.y - point.y * tip.x) / Math.hypot(tip.x, tip.y));
    }
  }
  assert.ok(bend > 3);
  for (let index = 0; index < 60; index++) {
    const before = viscousPoint(96, index / 60, .99999);
    const after = viscousPoint(96, index / 60, .00001);
    assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < .02);
  }
});
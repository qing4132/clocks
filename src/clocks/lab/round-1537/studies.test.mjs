import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import * as THREE from "three";
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
    if (specifier === "three") return THREE;
    if (!specifier.startsWith(".")) return require(specifier);
    const base = resolve(dirname(filePath), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
    assert.ok(resolved, specifier);
    return load(resolved);
  } }, { filename: filePath });
  return loaded.exports;
}

const folder = dirname(fileURLToPath(import.meta.url));
const { glyphRods, rodEndpoints, reassemblyState, ROD_LENGTH, ROD_SLOTS } = load(resolve(folder, "reassembly.ts"));
const { SEGMENTS } = load(resolve(folder, "../../digital/segments.tsx"));
const { ReassemblyClock } = load(resolve(folder, "ReassemblyClock.tsx"));
const { WallClockProvider } = load(resolve(folder, "../../WallClockProvider.tsx"));
const { projectionMask, projectionVolume, blockBounds } = load(resolve(folder, "projection.ts"));
const { monogramSegments } = load(resolve(folder, "monogram.ts"));
const { MonogramClock } = load(resolve(folder, "MonogramClock.tsx"));
const { TripleProjectionClock } = load(resolve(folder, "TripleProjectionClock.tsx"));
const { constructionStudies, projectionVariantStudies } = load(resolve(folder, "entries.ts"));
const { TRIPLE_GRID, framedProjectionMask, tripleProjectionVolume, tripleBlockBounds } = load(resolve(folder, "triple-projection.ts"));
const { projectionStyles, projectionScreens } = load(resolve(folder, "projection-variants.ts"));
const { createProjectionVariantModel } = load(resolve(folder, "projection-variants-scene.ts"));
const { ProjectionVariantClock } = load(resolve(folder, "ProjectionVariantClock.tsx"));

test("seven permanent equal rods cover exactly each existing decimal digit", () => {
  const key = pose => `${pose.x},${pose.y},${pose.angle}`;
  for (let digit = 0; digit < 10; digit++) {
    const poses = glyphRods(String(digit));
    assert.equal(poses.length, 7);
    const actual = Array.from(new Set(Array.from(poses, key))).sort();
    const expected = Array.from(SEGMENTS[String(digit)], name => key(ROD_SLOTS[name])).sort();
    assert.deepEqual(actual, expected);
  }
});

test("all minute transitions preserve every rod's identity, length, and unaffected position", () => {
  for (let minute = 0; minute < 1440; minute++) {
    const states = [0, 420, 900, 1799, 1800, 59_999].map(elapsed => reassemblyState(new Date(2026, 8, 16, 0, minute, 0, elapsed)));
    for (const state of states) {
      assert.equal(state.rods.length, 28);
      assert.equal(new Set(state.rods.map(rod => rod.id)).size, 28);
      for (const rod of state.rods) {
        const { start, end } = rodEndpoints(rod);
        assert.ok(Math.abs(Math.hypot(end.x - start.x, end.y - start.y) - ROD_LENGTH) < 1e-9);
        assert.ok(Math.max(Math.abs(start.x), Math.abs(end.x)) < 96);
        assert.ok(Math.max(Math.abs(start.y), Math.abs(end.y)) < 42);
        if (state.current[rod.column] === state.previous[rod.column]) {
          const original = rodEndpoints(states[0].rods[rod.id]);
          assert.deepEqual(start, original.start);
          assert.deepEqual(end, original.end);
        }
      }
    }
  }
});

test("reassembly remains continuous across midnight and replays without accumulated state", () => {
  const before = reassemblyState(new Date(2026, 8, 16, 23, 59, 59, 999));
  const after = reassemblyState(new Date(2026, 8, 17));
  for (let index = 0; index < 28; index++) {
    const first = rodEndpoints(before.rods[index]);
    const last = rodEndpoints(after.rods[index]);
    const direct = Math.hypot(first.start.x - last.start.x, first.start.y - last.start.y);
    const reversed = Math.hypot(first.start.x - last.end.x, first.start.y - last.end.y);
    assert.ok(Math.min(direct, reversed) < 1e-9);
  }
  const date = new Date(2026, 8, 16, 10, 0, 0, 900);
  assert.deepEqual(reassemblyState(date), reassemblyState(date));
  assert.equal(reassemblyState(date).previous, "0959");
  assert.equal(reassemblyState(date).current, "1000");
});

test("the actual component keeps all 28 opaque rods and does not invent an initial reading", () => {
  const render = milliseconds => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: milliseconds }, createElement(ReassemblyClock)));
  for (const elapsed of [0, 400, 1000, 1800, 59_980]) {
    const output = render(new Date(2026, 8, 16, 10, 0, 0, elapsed).getTime());
    assert.equal((output.match(/data-rod=/g) ?? []).length, 28);
    assert.doesNotMatch(output, /opacity|scale\(|NaN|Infinity/);
    assert.match(output, /aria-label="Reassembly 10:00"/);
  }
  assert.doesNotMatch(render(null), /<(?:line|circle) /);
});

test("one solid volume produces both exact numeral projections for all 1440 times", () => {
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      const blocks = projectionVolume(hour, minute);
      const hours = Array.from({ length: 7 }, () => Array(11).fill("0"));
      const minutes = Array.from({ length: 7 }, () => Array(11).fill("0"));
      assert.ok(blocks.length > 0 && blocks.length <= 847);
      for (const block of blocks) {
        for (let column = block.hourStart; column < block.hourStart + block.hourLength; column++) hours[block.row][column] = "1";
        for (let column = block.minuteStart; column < block.minuteStart + block.minuteLength; column++) minutes[block.row][column] = "1";
        const bounds = blockBounds(block);
        assert.ok(Object.values(bounds).every(Number.isFinite));
        assert.ok(Math.abs(bounds.x) + bounds.width / 2 < 1.22);
        assert.ok(Math.abs(bounds.z) + bounds.depth / 2 < 1.22);
      }
      assert.deepEqual(hours.map(row => row.join("")), Array.from(projectionMask(hour)));
      assert.deepEqual(minutes.map(row => row.join("")), Array.from(projectionMask(minute)));
    }
  }
});

test("each local minute has one unique four-quadrant sign without a numeric overlay", () => {
  const signs = new Set();
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      const segments = monogramSegments(hour, minute);
      const sign = JSON.stringify(segments.map(({ start, end }) => [start.x, start.y, end.x, end.y]));
      assert.ok(!signs.has(sign), `${hour}:${minute}`);
      signs.add(sign);
      const digits = [minute % 10, Math.floor(minute / 10), hour % 10, Math.floor(hour / 10)];
      for (const segment of segments) {
        assert.equal(segment.digit, digits[segment.quadrant]);
        assert.ok(Math.abs(segment.start.x) <= 34 && Math.abs(segment.end.x) <= 34);
        assert.ok(Math.abs(segment.start.y) <= 56 && Math.abs(segment.end.y) <= 56);
      }
    }
  }
  assert.equal(signs.size, 1440);
  const output = renderToStaticMarkup(createElement(WallClockProvider, { nowMs: new Date(2026, 8, 16, 23, 59).getTime() }, createElement(MonogramClock)));
  assert.match(output, /Single Sign 23:59/);
  assert.doesNotMatch(output, /<text /);
});

test("triple projection appends after the three existing candidates without changing their IDs", () => {
  assert.deepEqual(Array.from(constructionStudies, study => study.id), [1537, 1538, 1539, 1540]);
  assert.equal(new Set(constructionStudies.map(study => study.slug)).size, 4);
  assert.ok(constructionStudies.every(study => study.position === study.id && study.batch === 20 && /[\u4e00-\u9fff]/.test(study.hintZh)));
});

test("framed numerals preserve the original digits with clear space inside the shared border", () => {
  for (let value = 0; value < 60; value++) {
    const mask = framedProjectionMask(value);
    const digits = projectionMask(value);
    for (let row = 0; row < TRIPLE_GRID; row++) {
      for (let column = 0; column < TRIPLE_GRID; column++) {
        const border = row === 0 || column === 0 || row === TRIPLE_GRID - 1 || column === TRIPLE_GRID - 1;
        const digit = row >= 4 && row < 11 && column >= 2 && column < 13 && digits[row - 4][column - 2] === "1";
        assert.equal(Boolean(mask[row] & (1 << column)), border || digit);
      }
    }
  }
});

test("the actual compressed solid casts three exact projections at all 86400 times", () => {
  const expected = Array.from({ length: 60 }, (_, value) => Array.from(framedProjectionMask(value)));
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      for (let second = 0; second < 60; second++) {
        const blocks = tripleProjectionVolume(hour, minute, second);
        const hours = Array(TRIPLE_GRID).fill(0);
        const minutes = Array(TRIPLE_GRID).fill(0);
        const seconds = Array(TRIPLE_GRID).fill(0);
        assert.ok(blocks.length > 0 && blocks.length <= TRIPLE_GRID ** 3);
        for (const block of blocks) {
          const horizontal = ((1 << block.length) - 1) << block.start;
          hours[block.vertical] |= 1 << block.depth;
          minutes[block.vertical] |= horizontal;
          seconds[TRIPLE_GRID - 1 - block.depth] |= horizontal;
        }
        assert.deepEqual(hours, expected[hour]);
        assert.deepEqual(minutes, expected[minute]);
        assert.deepEqual(seconds, expected[second]);
      }
    }
  }
});

test("thin frame cuboids have positive dimensions and stay within the same bounded volume", () => {
  for (const [hour, minute, second] of [[0, 0, 0], [11, 11, 8], [10, 8, 36], [23, 59, 59]]) {
    for (const block of tripleProjectionVolume(hour, minute, second)) {
      const bounds = tripleBlockBounds(block);
      assert.ok(Object.values(bounds).every(Number.isFinite));
      assert.ok(bounds.width > 0 && bounds.height > 0 && bounds.depth > 0);
      assert.ok(Math.abs(bounds.x) + bounds.width / 2 < 1.23);
      assert.ok(Math.abs(bounds.y) + bounds.height / 2 < 1.23);
      assert.ok(Math.abs(bounds.z) + bounds.depth / 2 < 1.23);
    }
  }
});

test("the new canvas keeps current local seconds and never fabricates an initial reading", () => {
  const render = milliseconds => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: milliseconds }, createElement(TripleProjectionClock)));
  const before = new Date(2026, 8, 16, 23, 59, 59).getTime();
  assert.match(render(before), /Triple Projection 23:59:59/);
  assert.match(render(before + 1000), /Triple Projection 00:00:00/);
  assert.match(render(null), /Triple Projection --:--:--/);
  assert.match(render(before), /data-study="1540"/);
  assert.equal((render(before).match(/<canvas /g) ?? []).length, 1);
  assert.doesNotMatch(render(before), /<text|<img|<svg|<path/);
});

test("four presentation variants retain the same three perpendicular projection surfaces", () => {
  assert.equal(Object.keys(projectionStyles).length, 4);
  for (const variant of Object.keys(projectionStyles)) {
    const style = projectionStyles[variant];
    const screens = projectionScreens(variant);
    assert.deepEqual(Array.from(screens, screen => screen.unit), ["hour", "minute", "second"]);
    for (const screen of screens) {
      assert.ok(screen.width / 2 - Math.abs(screen.offsetX) > 1.225);
      assert.ok(screen.height / 2 - Math.abs(screen.offsetY) > 1.225);
      const position = Array.from(screen.position);
      const rotation = Array.from(screen.rotation);
      if (screen.unit === "hour") {
        assert.deepEqual(position, [-style.wallDistance, 0, 0]);
        assert.deepEqual(rotation, [0, Math.PI / 2, 0]);
      } else if (screen.unit === "minute") {
        assert.deepEqual(position, [0, 0, -style.wallDistance]);
        assert.deepEqual(rotation, [0, 0, 0]);
      } else {
        assert.deepEqual(position, [0, -style.floorDistance, 0]);
        assert.deepEqual(rotation, [-Math.PI / 2, 0, 0]);
      }
    }
    assert.ok(style.thickness > 0 && style.thickness < .3);
    assert.ok(style.lights.every(intensity => intensity > 0));
  }
});

test("every visual variant renders exactly the original 1540 volume with one shared caster", () => {
  const matrix = new THREE.Matrix4();
  for (const variant of Object.keys(projectionStyles)) {
    const model = createProjectionVariantModel(variant);
    for (const [hour, minute, second] of [[0, 0, 0], [11, 11, 8], [10, 8, 36], [23, 59, 59]]) {
      const date = new Date(2026, 8, 16, hour, minute, second);
      assert.equal(model.setTime(date), true);
      assert.equal(model.setTime(date), false);
      const expected = tripleProjectionVolume(hour, minute, second).map(tripleBlockBounds);
      assert.equal(model.volume.count, expected.length);
      expected.forEach((bounds, index) => {
        model.volume.getMatrixAt(index, matrix);
        for (const [element, value] of [[0, bounds.width], [5, bounds.height], [10, bounds.depth], [12, bounds.x], [13, bounds.y], [14, bounds.z]]) {
          assert.ok(Math.abs(matrix.elements[element] - value) < 1e-6);
        }
      });
    }
    const casters = [];
    model.scene.traverse(object => { if (object.isMesh && object.castShadow) casters.push(object); });
    assert.equal(casters.length, 1);
    assert.equal(casters[0], model.volume);
    assert.equal(model.volume.material.opacity, 1);
    assert.equal(model.volume.material.transparent, false);
    assert.equal(model.lights.length, 3);
    assert.equal(model.surfaces.length, 3);
    model.dispose();
  }
});

test("new presentation clocks append four IDs and keep real local time and empty SSR placeholders", () => {
  assert.deepEqual(Array.from(projectionVariantStudies, study => study.id), [1541, 1542, 1543, 1544]);
  assert.deepEqual(Array.from(constructionStudies, study => study.id), [1537, 1538, 1539, 1540]);
  for (const study of projectionVariantStudies) {
    assert.equal(study.batch, 21);
    assert.equal(study.position, study.id);
    assert.match(study.hintZh, /1540/);
    const render = date => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: date?.getTime() ?? null }, createElement(ProjectionVariantClock, { id: study.id, name: study.nameEn, variant: study.variant })));
    assert.match(render(new Date(2026, 8, 16, 23, 59, 59)), /23:59:59/);
    assert.match(render(new Date(2026, 8, 17)), /00:00:00/);
    assert.match(render(null), /--:--:--/);
    assert.equal((render(null).match(/<canvas /g) ?? []).length, 1);
    assert.doesNotMatch(render(null), /<text|<img|<svg|<path/);
  }
});

test("every presentation camera keeps all three readings visible outside the solid's full envelope", () => {
  const envelope = new THREE.Box3(new THREE.Vector3(-1.225, -1.225, -1.225), new THREE.Vector3(1.225, 1.225, 1.225));
  for (const variant of Object.keys(projectionStyles)) {
    const model = createProjectionVariantModel(variant);
    const caster = new THREE.Raycaster();
    for (const surface of model.surfaces) {
      surface.traverse(object => {
        if (!object.isMesh) return;
        object.geometry.computeBoundingBox();
        const bounds = object.geometry.boundingBox;
        for (const horizontal of [bounds.min.x, bounds.max.x]) {
          for (const vertical of [bounds.min.y, bounds.max.y]) {
            for (const depth of [bounds.min.z, bounds.max.z]) {
              const corner = object.localToWorld(new THREE.Vector3(horizontal, vertical, depth)).project(model.camera);
              assert.ok(Math.abs(corner.x) < .99 && Math.abs(corner.y) < .99, `${variant} ${surface.name}: panel clipping`);
            }
          }
        }
      });
      for (const horizontal of [-1.225, 0, 1.225]) {
        for (const vertical of [-1.225, 0, 1.225]) {
          const point = surface.localToWorld(new THREE.Vector3(horizontal, vertical, .003));
          const projected = point.clone().project(model.camera);
          assert.ok(Math.abs(projected.x) < .98 && Math.abs(projected.y) < .98, `${variant} ${surface.name}: clipped`);
          caster.setFromCamera(new THREE.Vector2(projected.x, projected.y), model.camera);
          const intersection = caster.ray.intersectBox(envelope, new THREE.Vector3());
          assert.ok(!intersection || caster.ray.origin.distanceTo(intersection) >= caster.ray.origin.distanceTo(point), `${variant} ${surface.name}: solid occlusion`);
        }
      }
    }
    model.dispose();
  }
});
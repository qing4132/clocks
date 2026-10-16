import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
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
    if (specifier === "three/addons/objects/Reflector.js") return { Reflector };
    if (!specifier.startsWith(".")) return require(specifier);
    const base = resolve(dirname(filePath), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
    assert.ok(resolved, specifier);
    return load(resolved);
  } }, { filename: filePath });
  return loaded.exports;
}

const folder = dirname(fileURLToPath(import.meta.url));
const { gapState, timeStrokes, DIGIT_CENTERS } = load(resolve(folder, "geometry.ts"));
const { SEGMENTS } = load(resolve(folder, "../../digital/segments.tsx"));
const { GapsClock } = load(resolve(folder, "GapsClock.tsx"));
const { WallClockProvider } = load(resolve(folder, "../../WallClockProvider.tsx"));
const { sectionRibbons, intersectTriangles } = load(resolve(folder, "section-geometry.ts"));
const { createSectionModel } = load(resolve(folder, "section-scene.ts"));
const { mirrorTime, mirrorIntersection, MIRROR_NORMAL } = load(resolve(folder, "mirror-geometry.ts"));
const { createMirrorModel } = load(resolve(folder, "mirror-scene.ts"));
const { SpatialRelationClock } = load(resolve(folder, "SpatialRelationClock.tsx"));
const { relationStudies } = load(resolve(folder, "entries.ts"));

test("the white gaps are exactly the current digits, exposed by black shutters rather than painted numerals", () => {
  for (let minute = 0; minute < 1440; minute++) {
    const date = new Date(2026, 8, 16, 0, minute, 3);
    const state = gapState(date);
    assert.equal(state.shutters.length, 28);
    for (const shutter of state.shutters) {
      const lit = SEGMENTS[state.current[shutter.column]].includes(shutter.name);
      const center = { x: shutter.x + shutter.width / 2, y: shutter.y + shutter.height / 2 };
      const covered = center.x > shutter.x + shutter.offsetX && center.x < shutter.x + shutter.offsetX + shutter.width
        && center.y > shutter.y + shutter.offsetY && center.y < shutter.y + shutter.offsetY + shutter.height;
      assert.equal(!covered, lit);
      assert.equal(shutter.opening, lit ? 1 : 0);
    }
  }
});

test("unchanged gaps stay still, and opening motion joins continuously across a minute boundary", () => {
  for (const minute of [1, 9, 10, 59, 60, 599, 600, 1439, 1440]) {
    const start = new Date(2026, 8, 16, 0, minute).getTime();
    const previous = gapState(new Date(start - 1));
    const next = gapState(new Date(start));
    const midway = gapState(new Date(start + 400));
    assert.equal(next.progress, 0);
    assert.equal(midway.progress, .5);
    for (let index = 0; index < 28; index++) {
      assert.equal(previous.shutters[index].offsetX, next.shutters[index].offsetX);
      assert.equal(previous.shutters[index].offsetY, next.shutters[index].offsetY);
      if (midway.current[midway.shutters[index].column] === midway.previous[midway.shutters[index].column]) {
        assert.equal(midway.shutters[index].opening, next.shutters[index].opening);
      }
    }
  }
});

test("the shared stroke layout stays inside four distinct digit positions", () => {
  for (const hour of [0, 8, 11, 23]) {
    for (const minute of [0, 11, 28, 59]) {
      const strokes = timeStrokes(new Date(2026, 8, 16, hour, minute));
      assert.equal(new Set(strokes.map(stroke => stroke.id)).size, strokes.length);
      for (const stroke of strokes) {
        assert.ok(Math.abs(stroke.start.x - DIGIT_CENTERS[stroke.column]) <= 12.01);
        assert.ok(Math.abs(stroke.end.x - DIGIT_CENTERS[stroke.column]) <= 12.01);
        assert.ok(Math.abs(stroke.start.y) <= 24 && Math.abs(stroke.end.y) <= 24);
      }
    }
  }
});

test("the gap component renders opaque moving blockers, not digit text, and isolates its clips", () => {
  const render = (date, count = 1) => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: date?.getTime() ?? null }, Array.from({ length: count }, (_, index) => createElement(GapsClock, { key: index }))));
  for (const elapsed of [0, 200, 400, 800, 1500]) {
    const output = render(new Date(2026, 8, 16, 10, 0, 0, elapsed));
    assert.equal((output.match(/data-gap-shutter=/g) ?? []).length, 28);
    assert.doesNotMatch(output, /<text|<image|<mask|opacity|NaN|Infinity/);
    assert.match(output, /Interstices 10:00/);
  }
  const output = render(new Date(2026, 8, 16, 10, 8), 2);
  const ids = Array.from(output.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(Array.from(output.matchAll(/url\(#([^\)]+)\)/g), match => match[1]).every(id => ids.includes(id)));
  assert.doesNotMatch(render(null), /<path|<rect|<circle/);
});

test("actual ribbon triangles intersect the fixed plane in exactly the current time strokes", () => {
  for (let minute = 0; minute < 1440; minute++) {
    const date = new Date(2026, 8, 16, 0, minute, minute % 60);
    const expected = timeStrokes(date);
    const ribbons = sectionRibbons(date);
    assert.equal(ribbons.length, expected.length);
    for (let index = 0; index < ribbons.length; index++) {
      const intersections = intersectTriangles(ribbons[index].triangles);
      assert.equal(intersections.length, 1);
      const [segment] = intersections;
      const start = new THREE.Vector3(expected[index].start.x * .026, -expected[index].start.y * .026, 0);
      const end = new THREE.Vector3(expected[index].end.x * .026, -expected[index].end.y * .026, 0);
      const direct = segment.start.distanceTo(start) + segment.end.distanceTo(end);
      const reverse = segment.start.distanceTo(end) + segment.end.distanceTo(start);
      assert.ok(Math.min(direct, reverse) < 1e-8);
    }
  }
});

test("the section is not a straight numeral extrusion and moves without changing the cut reading", () => {
  const date = new Date(2026, 8, 16, 10, 8, 36);
  const first = sectionRibbons(date);
  const later = sectionRibbons(new Date(date.getTime() + 8000));
  let spatialChange = 0;
  for (let index = 0; index < first.length; index++) {
    const ribbon = first[index];
    const center = intersectTriangles(ribbon.triangles)[0];
    const another = intersectTriangles(later[index].triangles)[0];
    assert.ok(center.start.distanceTo(another.start) < 1e-9);
    assert.ok(center.end.distanceTo(another.end) < 1e-9);
    spatialChange += ribbon.sections[0][0].distanceTo(later[index].sections[0][0]);
    const lowerAngle = ribbon.sections[0][1].clone().sub(ribbon.sections[0][0]);
    const upperAngle = ribbon.sections.at(-1)[1].clone().sub(ribbon.sections.at(-1)[0]);
    assert.ok(lowerAngle.angleTo(upperAngle) > .4);
    assert.equal(intersectTriangles(ribbon.triangles, new THREE.Plane(new THREE.Vector3(0, 0, 1), -3)).length, 0);
  }
  assert.ok(spatialChange > 1);
});

test("the three-dimensional section renderer uses the computed intersections as its only colored reading", () => {
  const model = createSectionModel();
  const matrix = new THREE.Matrix4();
  for (const date of [new Date(2026, 8, 16, 10, 8, 36), new Date(2026, 8, 16, 23, 59, 59)]) {
    model.setTime(date);
    const intersections = sectionRibbons(date).flatMap(ribbon => intersectTriangles(ribbon.triangles));
    assert.equal(model.cuts.count, intersections.length);
    intersections.forEach((segment, index) => {
      model.cuts.getMatrixAt(index, matrix);
      const start = new THREE.Vector3(0, -.5, 0).applyMatrix4(matrix);
      const end = new THREE.Vector3(0, .5, 0).applyMatrix4(matrix);
      assert.ok(start.distanceTo(segment.start) + end.distanceTo(segment.end) < 1e-6);
    });
    const positions = model.sheets.geometry.getAttribute("position");
    for (let index = 0; index < model.sheets.geometry.drawRange.count; index++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, index).project(model.camera);
      assert.ok(Math.abs(point.x) < 1 && Math.abs(point.y) < 1);
    }
  }
  model.dispose();
});

test("real reflected upper rods and direct lower rods assemble every local time exactly", () => {
  for (let minute = 0; minute < 1440; minute++) {
    const strokes = mirrorTime(new Date(2026, 8, 16, 0, minute));
    assert.ok(strokes.some(stroke => stroke.reflected));
    assert.ok(strokes.some(stroke => !stroke.reflected));
    for (const stroke of strokes) {
      for (const [index, source] of [stroke.start, stroke.end].entries()) {
        const target = stroke.targets[index];
        const image = stroke.reflected ? source.clone().reflect(MIRROR_NORMAL) : source;
        assert.ok(Math.hypot(image.x - target.x, image.y - target.y) < 1e-9);
        if (stroke.reflected) {
          const hit = mirrorIntersection(source);
          assert.ok(Math.abs(MIRROR_NORMAL.dot(hit)) < 1e-9);
          assert.ok(hit.y > 0 && hit.y < 1.1);
          assert.ok(source.y > 1.17 && source.y < 2.07);
          assert.ok(Math.abs(source.x) < 2.675);
          assert.ok(source.z < .14);
        } else {
          assert.ok(source.y <= 0);
          assert.ok(source.clone().reflect(MIRROR_NORMAL).y < 0);
        }
      }
    }
  }
});

test("mirror model contains a real reflector and a physical hood that does not block its light paths", () => {
  const model = createMirrorModel();
  assert.ok(model.mirror instanceof Reflector);
  const date = new Date(2026, 8, 16, 23, 59);
  model.setTime(date);
  model.scene.updateMatrixWorld(true);
  const hood = new THREE.Box3().setFromObject(model.hood);
  for (const stroke of mirrorTime(date).filter(stroke => stroke.reflected)) {
    for (const source of [stroke.start, stroke.end]) {
      const target = mirrorIntersection(source);
      const ray = new THREE.Ray(target, source.clone().sub(target).normalize());
      const intersection = ray.intersectBox(hood, new THREE.Vector3());
      assert.ok(!intersection || intersection.distanceTo(target) >= source.distanceTo(target));
      assert.ok(new THREE.Ray(new THREE.Vector3(source.x, source.y, 10), new THREE.Vector3(0, 0, -1)).intersectBox(hood, new THREE.Vector3()));
    }
  }
  assert.equal(model.rods.count, timeStrokes(date).length);
  assert.equal(model.mirror.material.uniforms.tDiffuse.value, model.mirror.getRenderTarget().texture);
  const rim = new THREE.Box3().setFromObject(model.scene.getObjectByName("mirror-rim"));
  assert.ok(-rim.max.z > 1.1);
  model.dispose();
});

test("the reflector camera sees the source rods but clips the mirror backing behind its plane", () => {
  const model = createMirrorModel();
  const date = new Date(2026, 8, 16, 10, 8, 36);
  model.setTime(date);
  model.scene.updateMatrixWorld(true);
  let reflectedCamera;
  const renderer = {
    xr: { enabled: false }, shadowMap: { autoUpdate: false }, autoClear: true,
    state: { buffers: { depth: { setMask() {} } } },
    getRenderTarget: () => null, setRenderTarget() {},
    render(scene, camera) { reflectedCamera = camera; },
  };
  model.mirror.onBeforeRender(renderer, model.scene, model.camera);
  for (const stroke of mirrorTime(date).filter(stroke => stroke.reflected)) {
    for (const point of [stroke.start, stroke.end]) {
      const clip = point.clone().project(reflectedCamera);
      assert.ok(Math.abs(clip.x) < 1 && Math.abs(clip.y) < 1 && Math.abs(clip.z) < 1, `source ${clip.toArray()}`);
    }
  }
  const behind = model.mirror.localToWorld(new THREE.Vector3(0, 0, -.03)).project(reflectedCamera);
  assert.ok(behind.z < -1, `backing clip depth ${behind.z}`);
  model.dispose();
});

test("three independent relation studies append after 1544 with correct placeholders and Chinese hints", () => {
  assert.deepEqual(Array.from(relationStudies, study => study.id), [1545, 1546, 1547]);
  assert.ok(relationStudies.every(study => study.batch === 22 && study.position === study.id && /[\u4e00-\u9fff]/.test(study.hintZh)));
  for (const [variant, id, name] of [["section", 1546, "Cross Section"], ["mirror", 1547, "Mirror Join"]]) {
    const render = date => renderToStaticMarkup(createElement(WallClockProvider, { nowMs: date?.getTime() ?? null }, createElement(SpatialRelationClock, { variant, id, name })));
    assert.match(render(new Date(2026, 8, 16, 23, 59)), /23:59/);
    assert.match(render(new Date(2026, 8, 17)), /00:00/);
    assert.match(render(null), /--:--/);
    assert.equal((render(null).match(/<canvas /g) ?? []).length, 1);
    assert.doesNotMatch(render(null), /<text|<image|<path/);
  }
});
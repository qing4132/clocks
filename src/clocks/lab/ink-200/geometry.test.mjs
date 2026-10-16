import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("./geometry.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const geometry = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("the new batch uses the exact original paper, ink, red, and typeface", () => {
  assert.equal(geometry.PAPER, "#fafaf7");
  assert.equal(geometry.INK, "#1a1a1a");
  assert.equal(geometry.RED, "#c1121f");
  assert.equal(geometry.SERIF, "Georgia, 'Times New Roman', serif");
});

test("polar bearings and path interpolation stay accurate at all boundaries", () => {
  for (let step = 0; step < 720; step++) {
    const tip = geometry.polar(74, step / 720);
    assert.ok(Math.abs(Math.hypot(tip.x, tip.y) - 74) < 1e-10);
  }
  const square = geometry.polygon(4, 80);
  for (let index = 0; index < 4; index++) {
    const point = geometry.onPath(square, index / 4);
    assert.ok(Math.hypot(point.x - square[index].x, point.y - square[index].y) < 1e-9);
  }
  assert.deepEqual(geometry.onPath([{ x: 0, y: 0 }, { x: 10, y: 0 }], .5, false), { x: 5, y: 0 });
  assert.equal(geometry.circleArc(70, .2, .2), "");
});

test("stepped seconds retain their intended cadence including the minute rollover", () => {
  for (let second = 0; second < 60; second++) {
    assert.equal(geometry.steppedSecond(second, 250, "step"), second / 60);
    assert.equal(geometry.steppedSecond(second, 499, "half"), second / 60);
    assert.equal(geometry.steppedSecond(second, 500, "half"), (second + .5) / 60);
    assert.equal(geometry.steppedSecond(second, 499, "hold"), second / 60);
    assert.ok(geometry.steppedSecond(second, 999, "hold") < (second + 1) / 60);
  }
});

test("all shaped dials map marks and hand tips with the same bounded radial rule", () => {
  for (let variant = 0; variant < 10; variant++) {
    for (let step = 0; step < 720; step++) {
      const turns = step / 720;
      const boundary = geometry.mappedPoint(96, turns, variant);
      const tip = geometry.mappedPoint(74, turns, variant);
      assert.ok(Math.abs(boundary.x) <= 97 && Math.abs(boundary.y) <= 97);
      assert.ok(Math.abs(tip.x / 74 - boundary.x / 96) < 1e-9);
      assert.ok(Math.abs(tip.y / 74 - boundary.y / 96) < 1e-9);
    }
  }
});

test("routes stay in the face and open courses include both exact endpoints", () => {
  for (const points of Object.values(geometry.ROUTES)) {
    assert.deepEqual(geometry.onPath(points, 0, false), points[0]);
    const end = geometry.onPath(points, 1, false);
    assert.ok(Math.hypot(end.x - points.at(-1).x, end.y - points.at(-1).y) < 1e-8);
    for (let index = 0; index <= 100; index++) {
      const point = geometry.onPath(points, index / 100, false);
      assert.ok(Math.abs(point.x) <= 85 && Math.abs(point.y) <= 85);
    }
  }
});

test("hour tokens and decimal minute counts reconstruct every clock value", () => {
  for (const [base, limit] of [[5, 24], [10, 60]]) {
    for (let value = 0; value < limit; value++) {
      const { groups, remainder } = geometry.splitCount(value, base);
      assert.equal(groups * base + remainder, value);
      assert.ok(remainder >= 0 && remainder < base);
    }
  }
});
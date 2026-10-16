import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModule(filePath) {
  const loaded = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports: loaded.exports,
    require(specifier) {
      if (!specifier.startsWith(".")) return require(specifier);
      const base = resolve(dirname(filePath), specifier);
      const resolved = [base, `${base}.ts`].find(candidate => existsSync(candidate));
      if (!resolved) throw new Error(`Cannot resolve ${specifier}`);
      return loadModule(resolved);
    },
  });
  return loaded.exports;
}

const geometry = loadModule(fileURLToPath(new URL("./further.geometry.ts", import.meta.url)));

test("plumb hands keep their time-bearing tops and hang to the lower rim", () => {
  for (let step = 0; step < 720; step++) {
    for (const reach of [50, 74]) {
      const hand = geometry.plumbHand(step / 720, reach);
      assert.ok(Math.abs(Math.hypot(hand.tip.x, hand.tip.y) - reach) < 1e-10);
      assert.equal(hand.foot.x, hand.tip.x);
      assert.ok(Math.abs(Math.hypot(hand.foot.x, hand.foot.y) - 92) < 1e-10);
      assert.ok(hand.foot.y > hand.tip.y);
    }
  }
});

test("the spanning hand always has two distinct correctly placed ends", () => {
  for (let step = 0; step < 720; step++) {
    const state = geometry.spanHands(step / 720, (step % 60) / 60);
    assert.ok(Math.abs(Math.hypot(state.hourTip.x, state.hourTip.y) - 50) < 1e-10);
    assert.ok(Math.abs(Math.hypot(state.minuteTip.x, state.minuteTip.y) - 74) < 1e-10);
    const distance = Math.hypot(state.hourTip.x - state.minuteTip.x, state.hourTip.y - state.minuteTip.y);
    assert.ok(distance >= 24 - 1e-10 && distance <= 124 + 1e-10);
  }
});

test("bypassing hands remain outside the empty hub with exact radial exits", () => {
  for (let step = 0; step < 720; step++) {
    for (const [reach, clockwise] of [[50, true], [74, false]]) {
      const hand = geometry.bypassHand(step / 720, reach, clockwise);
      assert.ok(Math.abs(Math.hypot(hand.start.x, hand.start.y) - 18) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.exit.x, hand.exit.y) - 18) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.tip.x, hand.tip.y) - reach) < 1e-10);
      assert.ok(Math.abs(hand.start.x + hand.exit.x) < 1e-10);
      assert.ok(Math.abs(hand.start.y + hand.exit.y) < 1e-10);
      assert.ok(hand.path.endsWith(`${hand.tip.x} ${hand.tip.y}`));
      assert.doesNotMatch(hand.path, /NaN|Infinity/);
    }
  }
});

test("the two face halves separate perpendicular to the seconds seam", () => {
  for (let step = 0; step < 600; step++) {
    const second = step / 600;
    const left = geometry.faultOffset(second, -1);
    const right = geometry.faultOffset(second, 1);
    assert.ok(Math.abs(Math.hypot(left.x - right.x, left.y - right.y) - 4) < 1e-10);
    assert.ok(Math.abs(left.x + right.x) < 1e-10 && Math.abs(left.y + right.y) < 1e-10);
    assert.ok(Math.abs(right.x * Math.sin(second * Math.PI * 2) - right.y * Math.cos(second * Math.PI * 2)) < 1e-10);
    assert.ok(96 + Math.hypot(right.x, right.y) + 1.5 <= 100);
  }
});

test("only the flanking hour numerals remain and handoffs preserve coverage", () => {
  for (let step = 0; step < 720; step++) {
    const opacities = Array.from({ length: 12 }, (_, index) => geometry.neighborOpacity(index, step / 720));
    assert.ok(opacities.filter(opacity => opacity > 0).length <= 2);
    assert.ok(opacities.some(opacity => opacity >= Math.SQRT1_2 - 1e-10));
    assert.ok(Math.abs(opacities.reduce((total, opacity) => total + opacity ** 2, 0) - 1) < 1e-10);
  }
  assert.equal(geometry.neighborOpacity(0, 0), 1);
  assert.equal(geometry.neighborOpacity(0, 1), 1);
});

test("carried hands retain exact tips and tail lengths throughout the second cycle", () => {
  for (let step = 0; step < 720; step++) {
    for (const [reach, tail, radius] of [[50, 10, -12], [74, 14, 30]]) {
      const angle = step / 60 * Math.PI * 2;
      const anchor = { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
      const hand = geometry.supportedHand(step / 720, reach, tail, anchor);
      assert.ok(Math.abs(Math.hypot(hand.tip.x, hand.tip.y) - reach) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.start.x - anchor.x, hand.start.y - anchor.y) - tail) < 1e-10);
      assert.ok(Number.isFinite(hand.start.x) && Number.isFinite(hand.start.y));
    }
  }
});

test("counterweights balance the original bearings without reversing the reading", () => {
  for (let step = 0; step < 720; step++) {
    for (const reach of [50, 74]) {
      const hand = geometry.balancedHand(step / 720, reach);
      assert.ok(Math.abs(hand.front.x + hand.back.x) < 1e-10);
      assert.ok(Math.abs(hand.front.y + hand.back.y) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.front.x, hand.front.y) - reach) < 1e-10);
    }
  }
});

test("minute ticks hand over continuously and retain all sixty original bearings", () => {
  for (let step = 0; step <= 600; step++) {
    const ticks = Array.from({ length: 60 }, (_, index) => geometry.relayTick(index, step / 600));
    assert.ok(Math.abs(ticks.reduce((total, tick) => total + tick.weight, 0) - 1) < 1e-10);
    assert.ok(ticks.filter((tick) => tick.weight > 1e-10).length <= 2);
    for (const tick of ticks) {
      assert.ok(Math.abs(Math.hypot(tick.outer.x, tick.outer.y) - 92) < 1e-10);
      assert.ok(Math.hypot(tick.inner.x, tick.inner.y) >= 10 - 1e-10);
      assert.ok(Math.abs(tick.outer.x * tick.inner.y - tick.outer.y * tick.inner.x) < 1e-9);
    }
  }
  assert.equal(geometry.relayTick(0, 0).weight, 1);
  assert.equal(geometry.relayTick(0, 1).weight, 1);
});

test("crescent hands taper from zero width to the exact original tips", () => {
  for (let step = 0; step < 720; step++) {
    for (const [reach, width] of [[50, 5], [74, 3]]) {
      const hand = geometry.crescentHand(step / 720, reach, width);
      assert.ok(Math.abs(Math.hypot(hand.tip.x, hand.tip.y) - reach) < 1e-10);
      const outerTip = hand.points[48];
      const innerTip = hand.points[49];
      assert.ok(Math.abs((outerTip.x + innerTip.x) / 2 - hand.tip.x) < 1e-10);
      assert.ok(Math.abs((outerTip.y + innerTip.y) / 2 - hand.tip.y) < 1e-10);
      assert.deepEqual(hand.points[0], hand.points.at(-1));
      assert.ok(hand.points.every((point) => Math.hypot(point.x, point.y) <= reach + width / 2 + 1e-10));
    }
  }
});
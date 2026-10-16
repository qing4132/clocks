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

const geometry = loadModule(fileURLToPath(new URL("./continuations.geometry.ts", import.meta.url)));

test("closed hands pass through the hub and reach exactly the original tips", () => {
  for (let minute = 0; minute < 720; minute++) {
    for (const reach of [50, 74]) {
      const loop = geometry.loopHand(minute / 720, reach);
      assert.ok(Math.abs(Math.hypot(loop.center.x, loop.center.y) - loop.radius) < 1e-10);
      assert.ok(Math.abs(Math.hypot(loop.tip.x, loop.tip.y) - reach) < 1e-10);
      assert.ok(Math.abs(Math.hypot(loop.tip.x - loop.center.x, loop.tip.y - loop.center.y) - loop.radius) < 1e-10);
    }
  }
});

test("independent pins preserve the endpoints and never meet a singularity", () => {
  for (let minute = 0; minute < 720; minute++) {
    for (const [reach, tail, anchorX] of [[50, 10, -18], [74, 14, 18]]) {
      const hand = geometry.splitPinHand(minute / 720, reach, tail, anchorX);
      assert.ok(Math.abs(Math.hypot(hand.tip.x, hand.tip.y) - reach) < 1e-10);
      assert.equal(hand.anchor.x, anchorX);
      assert.equal(hand.anchor.y, 0);
      assert.ok(Math.abs(Math.hypot(hand.start.x - anchorX, hand.start.y) - tail) < 1e-10);
      assert.ok(Number.isFinite(hand.start.x) && Number.isFinite(hand.start.y));
    }
  }
});

test("right-angled hands reach the same tips through perpendicular segments", () => {
  for (let minute = 0; minute < 720; minute++) {
    for (const [reach, horizontalFirst] of [[50, true], [74, false]]) {
      const hand = geometry.rightAngleHand(minute / 720, reach, horizontalFirst);
      assert.ok(Math.abs(Math.hypot(hand.tip.x, hand.tip.y) - reach) < 1e-10);
      assert.ok(Math.abs(hand.corner.x * (hand.tip.x - hand.corner.x) + hand.corner.y * (hand.tip.y - hand.corner.y)) < 1e-10);
      assert.ok(hand.path.endsWith(`${hand.tip.x} ${hand.tip.y}`));
    }
  }
});

test("every tick turns toward the minute without moving its outer anchor", () => {
  for (let minute = 0; minute < 60; minute++) {
    for (let index = 0; index < 60; index++) {
      const tick = geometry.regardingTick(index, minute / 60);
      const delta = { x: tick.end.x - tick.anchor.x, y: tick.end.y - tick.anchor.y };
      const toward = { x: tick.focus.x - tick.anchor.x, y: tick.focus.y - tick.anchor.y };
      assert.ok(Math.abs(Math.hypot(tick.anchor.x, tick.anchor.y) - 92) < 1e-10);
      assert.ok(Math.abs(Math.hypot(delta.x, delta.y) - (index % 5 === 0 ? 10 : 4)) < 1e-10);
      assert.ok(Math.abs(delta.x * toward.y - delta.y * toward.x) < 1e-9);
      assert.ok(delta.x * toward.x + delta.y * toward.y > 0);
    }
  }
});

test("the shared root stays continuous through opposite and coincident hands", () => {
  for (let minute = 0; minute < 720; minute++) {
    const state = geometry.sharedStem(minute / 720, (minute % 60) / 60);
    assert.ok(Math.abs(Math.hypot(state.hourTip.x, state.hourTip.y) - 50) < 1e-10);
    assert.ok(Math.abs(Math.hypot(state.minuteTip.x, state.minuteTip.y) - 74) < 1e-10);
    assert.ok(Math.hypot(state.joint.x, state.joint.y) <= 31 + 1e-10);
    assert.ok(Number.isFinite(state.joint.x) && Number.isFinite(state.joint.y));
  }
});

test("the open interval runs clockwise between the true hands across zero", () => {
  assert.equal(geometry.betweenHands(0, 0).path, "");
  assert.ok(Math.abs(geometry.betweenHands(0.95, 0.05).span - 0.1) < 1e-10);
  assert.ok(Math.abs(geometry.betweenHands(0.05, 0.95).span - 0.9) < 1e-10);
  for (let minute = 0; minute < 720; minute++) {
    const state = geometry.betweenHands(minute / 720, (minute % 60) / 60);
    assert.ok(state.span >= 0 && state.span < 1);
    assert.doesNotMatch(state.path, /NaN|Infinity/);
  }
});

test("numerals part tangentially only for the passing second", () => {
  for (let index = 0; index < 12; index++) {
    const passage = geometry.numeralParting(index, index / 12);
    const resting = geometry.numeralParting(index, (index / 12 + 0.1) % 1);
    assert.ok(Math.abs(passage.distance - 4.2) < 1e-10);
    assert.ok(Math.abs(passage.center.x * passage.displacement.x + passage.center.y * passage.displacement.y) < 1e-10);
    assert.equal(resting.distance, 0);
    assert.ok(Math.abs(Math.hypot(passage.center.x, passage.center.y) - 70) < 1e-10);
  }
  assert.ok(Math.abs(geometry.numeralParting(0, 0.999).distance - geometry.numeralParting(0, 0.001).distance) < 1e-10);
});

test("the second travels between the two tips and returns once per minute", () => {
  for (let minute = 0; minute < 720; minute++) {
    const hour = minute / 720;
    const minuteTurns = (minute % 60) / 60;
    const start = geometry.roundTripPoint(hour, minuteTurns, 0);
    const middle = geometry.roundTripPoint(hour, minuteTurns, 0.5);
    const end = geometry.roundTripPoint(hour, minuteTurns, 1);
    assert.ok(Math.abs(Math.hypot(start.x, start.y) - 50) < 1e-10);
    assert.ok(Math.abs(Math.hypot(middle.x, middle.y) - 74) < 1e-10);
    assert.ok(Math.hypot(start.x - end.x, start.y - end.y) < 1e-10);
    for (const second of [0.1, 0.2, 0.3, 0.4]) {
      const outward = geometry.roundTripPoint(hour, minuteTurns, second);
      const homeward = geometry.roundTripPoint(hour, minuteTurns, 1 - second);
      assert.ok(Math.hypot(outward.x - homeward.x, outward.y - homeward.y) < 1e-9);
      assert.ok(Math.hypot(outward.x, outward.y) <= 74);
    }
  }
});
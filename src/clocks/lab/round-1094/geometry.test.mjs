import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./geometry.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const geometry = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("the opening stays on the original rim and follows all sixty seconds", () => {
  for (let second = 0; second < 60; second++) {
    const turns = second / 60;
    const marker = geometry.radialPoint(96, turns);
    assert.ok(Math.abs(Math.hypot(marker.x, marker.y) - 96) < 1e-10);
    const recovered = (Math.atan2(marker.x, -marker.y) / (2 * Math.PI) + 1) % 1;
    assert.ok(Math.abs(recovered - turns) < 1e-10);
    assert.match(geometry.openRim(turns), /A 96 96 0 1 1/);
    assert.doesNotMatch(geometry.openRim(turns), /NaN|Infinity/);
  }
});

test("edge-supported hands retain their original lengths at every angle", () => {
  for (let second = 0; second < 3600; second++) {
    for (const length of [60, 88, 104]) {
      const hand = geometry.inwardHand(second / 3600, length);
      assert.ok(Math.abs(Math.hypot(hand.anchor.x, hand.anchor.y) - 96) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.end.x - hand.anchor.x, hand.end.y - hand.anchor.y) - length) < 1e-10);
    }
  }
});

test("courtesy changes the middle of the hands, never their time-bearing tips", () => {
  assert.equal(geometry.courtesyBend(0, 0), 18);
  assert.equal(geometry.courtesyBend(0, 0.5), 0);
  for (let minute = 0; minute < 720; minute++) {
    const hour = minute / 720;
    const minuteTurns = (minute % 60) / 60;
    const bend = geometry.courtesyBend(hour, minuteTurns);
    assert.ok(bend >= 0 && bend <= 18);
    for (const [turns, tip, tail, amount] of [[hour, 50, 10, -bend], [minuteTurns, 74, 14, bend]]) {
      const end = geometry.radialPoint(tip, turns);
      assert.ok(geometry.bowedHand(turns, tip, tail, amount).endsWith(`${end.x} ${end.y}`));
    }
  }
});

test("a wandering pivot preserves both tips and keeps the short counterweights", () => {
  for (let minute = 0; minute < 720; minute++) {
    for (const second of [0, 0.25, 0.5, 0.75]) {
      for (const [turns, tip, tail] of [[minute / 720, 50, 10], [(minute % 60) / 60, 74, 14]]) {
        const hand = geometry.wanderingHand(turns, tip, tail, second);
        assert.deepEqual(hand.end, geometry.radialPoint(tip, turns));
        assert.ok(Math.abs(Math.hypot(hand.pivot.x, hand.pivot.y) - 20) < 1e-10);
        assert.ok(Math.abs(Math.hypot(hand.pivot.x - hand.start.x, hand.pivot.y - hand.start.y) - tail) < 1e-10);
        assert.ok(Number.isFinite(hand.start.x) && Number.isFinite(hand.start.y));
      }
    }
  }
});

test("crosswise needles have their midpoint at the original tip and stay inside the face", () => {
  for (let minute = 0; minute < 720; minute++) {
    for (const radius of [50, 74, 84]) {
      const turns = minute / 720;
      const hand = geometry.crosswiseHand(turns, radius);
      const original = geometry.radialPoint(radius, turns);
      assert.ok(Math.abs((hand.start.x + hand.end.x) / 2 - original.x) < 1e-10);
      assert.ok(Math.abs((hand.start.y + hand.end.y) / 2 - original.y) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.start.x, hand.start.y) - 92) < 1e-10);
      assert.ok(Math.abs(Math.hypot(hand.end.x, hand.end.y) - 92) < 1e-10);
    }
  }
});

test("one common rotating frame preserves every hand-to-scale relationship", () => {
  for (let minute = 0; minute < 720; minute++) {
    const hour = minute / 720;
    assert.deepEqual(geometry.stillHourMap(50, hour, hour), { x: 0, y: -50 });
    for (let mark = 0; mark < 60; mark++) {
      const point = geometry.stillHourMap(92, mark / 60, hour);
      assert.ok(Math.abs(Math.hypot(point.x, point.y) - 92) < 1e-10);
      const mappedAngle = Math.atan2(point.x, -point.y);
      const expectedAngle = (mark / 60 - hour) * Math.PI * 2;
      assert.ok(Math.abs(Math.sin(mappedAngle - expectedAngle)) < 1e-10);
    }
  }
});
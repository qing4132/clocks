import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./geometry.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const geometry = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("woven rings preserve the three ordinary time-bearing endpoints", () => {
  for (let minute = 0; minute < 720; minute++) {
    const turns = [minute / 720, minute / 60, minute / 17];
    const state = geometry.weaveGeometry(...turns);
    state.rings.forEach((ring, index) => {
      const reach = [50, 74, 84][index];
      assert.ok(Math.abs(Math.hypot(ring.tip.x, ring.tip.y) - reach) < 1e-9);
      assert.ok(Math.abs(Math.hypot(ring.center.x, ring.center.y) - ring.radius) < 1e-9);
    });
    for (const crossing of state.crossings) {
      for (const index of [crossing.over, crossing.under]) {
        const ring = state.rings[index];
        assert.ok(Math.abs(Math.hypot(crossing.point.x - ring.center.x, crossing.point.y - ring.center.y) - ring.radius) < 1e-7);
      }
    }
  }
});

test("coincident hands have no fabricated crossings and all three depth roles can appear", () => {
  assert.equal(geometry.weaveGeometry(0, 0, 0).crossings.length, 0);
  const state = geometry.weaveGeometry(0.1, 0.27, 0.83);
  assert.deepEqual(state.crossings.map(({ over, under }) => [over, under]), [[0, 1], [1, 2], [2, 0]]);
});
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("./fields.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const fields = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("seeded reaction diffusion produces a repeatable nonuniform concentration", () => {
  const first = fields.createReactionTexture(48, 180);
  const second = fields.createReactionTexture(48, 180);
  assert.deepEqual(first.values, second.values);
  assert.ok(first.values.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
  assert.ok(Math.max(...first.values) - Math.min(...first.values) > 0.15);
});

test("all fields are reproducible, nonblank, and change with the wall clock", () => {
  const size = 48;
  const texture = fields.createReactionTexture(48, 180);
  const mask = Float32Array.from({ length: size * size }, (_, index) => index % size > 12 && index % size < 36 && index / size > 16 && index / size < 32 ? 1 : 0);
  for (const kind of ["organic", "caustic", "stress"]) {
    const first = new Uint8ClampedArray(size * size * 4);
    const replay = new Uint8ClampedArray(first.length);
    const later = new Uint8ClampedArray(first.length);
    fields.renderField(kind, first, size, { milliseconds: 5234560, hour: .37, minute: .72 }, mask, texture);
    fields.renderField(kind, replay, size, { milliseconds: 5234560, hour: .37, minute: .72 }, mask, texture);
    fields.renderField(kind, later, size, { milliseconds: 5254560, hour: .37, minute: .73 }, mask, texture);
    assert.deepEqual(first, replay, kind);
    assert.notDeepEqual(first, later, kind);
    const colors = new Set(Array.from({ length: size * size }, (_, index) => Array.from(first.slice(index * 4, index * 4 + 3)).join(",")));
    assert.ok(colors.size > 100, kind);
    assert.equal(first[(size / 2 * size + size / 2) * 4 + 3], 255);
    assert.equal(first[3], kind === "stress" ? 0 : 255);
  }
});

test("time glyphs control both digital fields rather than a later text overlay", () => {
  const size = 48;
  const empty = new Float32Array(size * size);
  const filled = new Float32Array(size * size).fill(1);
  const texture = fields.createReactionTexture(48, 180);
  for (const kind of ["organic", "caustic"]) {
    const background = new Uint8ClampedArray(size * size * 4);
    const glyph = new Uint8ClampedArray(background.length);
    fields.renderField(kind, background, size, { milliseconds: 12345, hour: .1, minute: .2 }, empty, texture);
    fields.renderField(kind, glyph, size, { milliseconds: 12345, hour: .1, minute: .2 }, filled, texture);
    const center = (24 * size + 24) * 4;
    assert.ok(glyph[center + 1] > background[center + 1] + 60, kind);
  }
});

test("field motion stays continuous across an hour boundary", () => {
  const size = 48;
  const mask = new Float32Array(size * size).fill(1);
  const texture = fields.createReactionTexture(48, 180);
  for (const kind of ["organic", "caustic", "stress"]) {
    const before = new Uint8ClampedArray(size * size * 4);
    const after = new Uint8ClampedArray(before.length);
    fields.renderField(kind, before, size, { milliseconds: 1_800_000_000 - 1, hour: .3, minute: .7 }, mask, texture);
    fields.renderField(kind, after, size, { milliseconds: 1_800_000_000 + 1, hour: .3, minute: .7 }, mask, texture);
    const difference = before.reduce((total, value, index) => total + Math.abs(value - after[index]), 0) / before.length;
    assert.ok(difference < 1, `${kind}: ${difference}`);
  }
});
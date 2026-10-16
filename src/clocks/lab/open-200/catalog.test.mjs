import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("./catalog.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { openStudies, FAMILIES } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("exactly 200 unique new entries occupy 1132 through 1331", () => {
  assert.equal(openStudies.length, 200);
  assert.equal(new Set(openStudies.map(entry => entry.slug)).size, 200);
  assert.equal(new Set(openStudies.map(entry => entry.nameEn)).size, 200);
  openStudies.forEach((entry, index) => {
    assert.equal(entry.id, 1132 + index);
    assert.equal(entry.position, entry.id);
    assert.equal(entry.batch, 17);
    assert.equal(entry.variant, index % 10);
    assert.ok(entry.reading && entry.mechanism);
  });
  FAMILIES.forEach(family => assert.equal(openStudies.filter(entry => entry.family === family).length, 10));
});
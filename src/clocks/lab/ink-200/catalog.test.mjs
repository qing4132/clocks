import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const compiled = ts.transpileModule(readFileSync(new URL("./catalog.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { inkStudies, FAMILIES } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("two hundred new entries have unique consecutive IDs and individual Chinese explanations", () => {
  assert.equal(inkStudies.length, 200);
  for (const key of ["id", "slug", "nameEn", "nameZh", "hintZh"]) assert.equal(new Set(inkStudies.map(entry => entry[key])).size, 200, key);
  inkStudies.forEach((entry, index) => {
    assert.equal(entry.id, 1332 + index);
    assert.equal(entry.position, entry.id);
    assert.equal(entry.batch, 18);
    assert.match(entry.hintZh, /[\u4e00-\u9fff]/);
    assert.ok(entry.hintZh.length >= 20 && entry.hintZh.length <= 80, entry.nameZh);
    assert.equal(entry.variant, index % 10);
  });
  FAMILIES.forEach(family => assert.equal(inkStudies.filter(entry => entry.family === family).length, 10));
});
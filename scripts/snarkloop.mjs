// Build a 4-Snark loop from the verified catalyst and find the C4 center that
// makes a single injected glider circulate forever (a true oscillator).
const OFF = 1 << 14;
const key = (x, y) => (x + OFF) * (1 << 16) + (y + OFF);
const unkey = (k) => [Math.floor(k / (1 << 16)) - OFF, (k % (1 << 16)) - OFF];

function step(live) {
  const counts = new Map();
  for (const k of live) {
    const [x, y] = unkey(k);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nk = key(x + dx, y + dy);
        counts.set(nk, (counts.get(nk) || 0) + 1);
      }
  }
  const next = new Set();
  for (const [k, n] of counts)
    if (n === 3 || (n === 2 && live.has(k))) next.add(k);
  return next;
}

function parseRLE(rle) {
  const cells = [];
  let x = 0,
    y = 0,
    num = "";
  for (const ch of rle) {
    if (ch >= "0" && ch <= "9") num += ch;
    else if (ch === "b") {
      x += num ? +num : 1;
      num = "";
    }
    else if (ch === "o") {
      const n = num ? +num : 1;
      for (let i = 0; i < n; i++) cells.push([x++, y]);
      num = "";
    } else if (ch === "$") {
      y += num ? +num : 1;
      x = 0;
      num = "";
    }
    else if (ch === "!") break;
  }
  return cells;
}

const SNARK_RLE =
  "6b2o3b2o$6b2o2bob3o$10bo4bo$6b4ob2o2bo$6bo2bobobob2o$9bobobobo$10b2obobo$14bo2$2o$bo7b2o$bobo5b2o$2b2o7$12b2o$3b2o7bo$2bobo8b3o$4bo10bo!";

// derive catalyst (still life) and the single input glider
let live = new Set(parseRLE(SNARK_RLE).map(([x, y]) => key(x, y)));
const gen0 = new Set(live);
for (let i = 0; i < 200; i++) live = step(live);
const catalyst = [];
for (const k of live) {
  const [x, y] = unkey(k);
  if (x >= 0 && x <= 16 && y >= 0 && y <= 22) catalyst.push([x, y]);
}
const catSet = new Set(catalyst.map(([x, y]) => key(x, y)));
const inputGlider = [...gen0].filter((k) => !catSet.has(k)).map(unkey);
console.log("catalyst", catalyst.length, "inputGlider", inputGlider.length, inputGlider);

// rotate (x,y) 90° CW on screen about center C: (x,y) -> (cx - (y-cy), cy + (x-cx))
const rotCW = (x, y, cx, cy) => [cx - (y - cy), cy + (x - cx)];
function rotK(cells, k, cx, cy) {
  let out = cells.map(([x, y]) => [x, y]);
  for (let i = 0; i < k; i++) out = out.map(([x, y]) => rotCW(x, y, cx, cy));
  return out;
}

function buildLoop(cx, cy) {
  const cells = new Set();
  for (let k = 0; k < 4; k++)
    for (const [x, y] of rotK(catalyst, k, cx, cy)) cells.add(key(x, y));
  return cells;
}

// periodicity / health check: a real loop keeps ~all catalyst cells + a glider
// that travels (large period) with population fluctuating during reflections.
function evaluate(cx, cy, maxGen = 1200) {
  const loopCells = buildLoop(cx, cy);
  const base = loopCells.size; // 4 catalysts (may differ if overlap)
  let cur = new Set(loopCells);
  for (const [x, y] of inputGlider) cur.add(key(x, y));
  const seen = new Map();
  let minPop = Infinity,
    maxPop = -Infinity;
  for (let g = 0; g <= maxGen; g++) {
    if (cur.size > base + 80 || cur.size < base - 30) return { ok: false };
    minPop = Math.min(minPop, cur.size);
    maxPop = Math.max(maxPop, cur.size);
    const sig = [...cur].sort((a, b) => a - b).join(",");
    if (seen.has(sig)) {
      const period = g - seen.get(sig);
      // require a real traveling glider: big period + population fluctuation
      if (period >= 80 && maxPop - minPop >= 6)
        return { ok: true, period, minPop, maxPop, base };
      return { ok: false, degenerate: period };
    }
    seen.set(sig, g);
    cur = step(cur);
  }
  return { ok: false, reason: "no recurrence" };
}

const mode = process.argv[2];

if (mode === "analyze") {
  // analyze a specific loop: period, envelope bbox, and how big CELL can be to
  // fill a square dial WITHOUT vs WITH a 45° rotation.
  const cx = +(process.argv[3] ?? 13);
  const cy = +(process.argv[4] ?? 33);
  const loopCells = buildLoop(cx, cy);
  let cur = new Set(loopCells);
  for (const [x, y] of inputGlider) cur.add(key(x, y));
  // period
  const seen = new Map();
  let period = 0;
  {
    let p = new Set(cur);
    for (let g = 0; g <= 4000; g++) {
      const sig = [...p].sort((a, b) => a - b).join(",");
      if (seen.has(sig)) {
        period = g - seen.get(sig);
        break;
      }
      seen.set(sig, g);
      p = step(p);
    }
  }
  // envelope over a full period
  const env = new Set();
  {
    let p = new Set(cur);
    for (let g = 0; g < period; g++) {
      for (const k of p) env.add(k);
      p = step(p);
    }
  }
  let minx = Infinity,
    miny = Infinity,
    maxx = -Infinity,
    maxy = -Infinity;
  let mAxis = 0, // max(|dx|,|dy|)  — axis-aligned half-extent
    mDiag = 0; // max(|dx+dy|,|dx-dy|) — half-extent after 45° rotation (×√2)
  for (const k of env) {
    const [x, y] = unkey(k);
    minx = Math.min(minx, x);
    miny = Math.min(miny, y);
    maxx = Math.max(maxx, x);
    maxy = Math.max(maxy, y);
    const dx = x - cx,
      dy = y - cy;
    mAxis = Math.max(mAxis, Math.abs(dx), Math.abs(dy));
    mDiag = Math.max(mDiag, Math.abs(dx + dy), Math.abs(dx - dy));
  }
  const cellNoRot = 96 / mAxis;
  const cellRot = (96 * Math.SQRT2) / mDiag;
  console.log(`center (${cx},${cy})  period=${period}  gens/sec=${(period / 60).toFixed(3)}`);
  console.log(`envelope bbox grid=(${minx},${miny})-(${maxx},${maxy}) size=${maxx - minx + 1}x${maxy - miny + 1}`);
  console.log(`half-extent axis(max|dx|,|dy|)=${mAxis}  diag(max|dx±dy|)=${mDiag}`);
  console.log(`max CELL no-rotation=${cellNoRot.toFixed(3)}  with-45°-rotation=${cellRot.toFixed(3)}  gain=${(cellRot / cellNoRot).toFixed(2)}x`);

  // radial stats (for round-face scaling): max distance of any live cell, and
  // the largest empty CENTERED square (half-width, in cells) where digits fit.
  let maxR = 0;
  for (const k of env) {
    const [x, y] = unkey(k);
    maxR = Math.max(maxR, Math.hypot(x - cx, y - cy));
  }
  let clear = 0;
  for (let h = 1; h < mAxis; h++) {
    let occupied = false;
    for (const k of env) {
      const [x, y] = unkey(k);
      if (Math.abs(x - cx) <= h && Math.abs(y - cy) <= h) {
        occupied = true;
        break;
      }
    }
    if (occupied) break;
    clear = h;
  }
  console.log(`max radius (cells)=${maxR.toFixed(2)}  → CELL for r=84 round face=${(84 / maxR).toFixed(3)}`);
  console.log(`largest empty centered square: half-width=${clear} cells (side ${2 * clear + 1})`);

  // ASCII envelope so we can SEE whether the centre is clear for digits
  console.log("--- envelope (union over one period) ---");
  for (let y = miny; y <= maxy; y++) {
    let row = "";
    for (let x = minx; x <= maxx; x++) row += env.has(key(x, y)) ? "#" : ".";
    console.log(row);
  }
  process.exit(0);
}

const cx0 = +(process.argv[2] ?? 13);
const cy0 = +(process.argv[3] ?? 30);
const R = +(process.argv[4] ?? 8);
let found = [];
for (let icx = (cx0 - R) * 2; icx <= (cx0 + R) * 2; icx++)
  for (let icy = (cy0 - R) * 2; icy <= (cy0 + R) * 2; icy++) {
    const cx = icx / 2,
      cy = icy / 2;
    // integer or half-integer centers keep the lattice; skip quarter steps
    if (cx + cy !== Math.round(cx + cy)) continue;
    const r = evaluate(cx, cy);
    if (r.ok) found.push({ cx, cy, ...r });
  }
found.sort((a, b) => a.period - b.period);
console.log("loop hits:", found.length);
for (const f of found.slice(0, 30)) console.log(f);

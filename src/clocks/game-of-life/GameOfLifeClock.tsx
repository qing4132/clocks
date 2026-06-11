"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * #019 — Game of Life.  (Engine + dial. Technically this is a "Snark loop":
 * four Snark reflectors bouncing one glider around a closed circuit.)
 *
 * A real, working piece of Conway's Game of Life engineering, used as a clock.
 * Four Snarks — Mike Playle's 2013 stable 90° glider reflector, the smallest
 * known — are arranged with 4-fold symmetry so that a single glider, fired
 * once, is reflected corner to corner and circles the loop forever. That
 * circulating glider is a genuine, living second hand: one full lap is tuned
 * to exactly 60 seconds. The loop's period is 360 generations, i.e. exactly
 * 6 generations per second, and the simulation is phase-locked to the wall
 * clock so it never drifts.
 *
 * Nothing here is faked — a real glider runs the real B3/S23 rule around a
 * real reflector loop, and reading its position around the ring tells you the
 * second. The four Snarks and their reflection sparks are the faint "movement";
 * the glider is the red hand.
 *
 * Presentation follows #001: the same round cream dial, black ink, red second
 * accent and thin border. The whole field is rendered rotated 45° (the glider
 * flies Life's natural diagonals, so an eighth-turn squares the diamond up to
 * the dial) and scaled to sit inside the round face with a margin.
 *
 * The loop geometry (centre, period 360, the 52-cell Snark catalyst and the
 * seed glider) was derived and verified offline with a B3/S23 simulator; see
 * scripts/snarkloop.mjs. The bounded grid carries ≥8 cells of margin beyond the
 * loop's envelope, so it evolves identically to the unbounded pattern.
 */

// ── verified loop seed (from scripts/snarkloop.mjs) ───────────────────────
export const PERIOD = 360; // 6 × 60 → exactly 6 generations per wall-clock second
const CENTER_X = 13;
const CENTER_Y = 33;

const CATALYST: [number, number][] = [
  [6, 0], [7, 0], [7, 1], [6, 1], [6, 3], [7, 3], [6, 4], [8, 3], [9, 3],
  [9, 4], [10, 2], [9, 5], [10, 1], [11, 3], [10, 6], [11, 0], [11, 4],
  [12, 3], [11, 5], [11, 6], [12, 0], [12, 1], [13, 4], [13, 1], [13, 5],
  [14, 1], [13, 6], [15, 2], [14, 7], [15, 3], [15, 6], [15, 4], [16, 4],
  [15, 5], [9, 11], [10, 10], [10, 11], [9, 10], [0, 9], [1, 10], [1, 9],
  [1, 11], [2, 12], [3, 11], [3, 12], [12, 20], [13, 19], [12, 19], [14, 21],
  [13, 21], [15, 22], [15, 21],
];
const GLIDER: [number, number][] = [
  [3, 20], [4, 20], [2, 21], [4, 21], [4, 22],
];

// rotate 90° CW (screen coords) about the loop centre
function rotCW(x: number, y: number): [number, number] {
  return [CENTER_X - (y - CENTER_Y), CENTER_Y + (x - CENTER_X)];
}

// ── bounded grid (loop envelope is (-20,0)..(46,66); pad ≥8 every side) ──
const X0 = -28;
const Y0 = -8;
const W = 83;
const H = 83;
const idx = (x: number, y: number) => (y - Y0) * W + (x - X0);

// the four reflectors, baked once = the static "movement"
const MECH = new Set<number>();
{
  let cells = CATALYST.map(([x, y]) => [x, y] as [number, number]);
  for (let k = 0; k < 4; k++) {
    for (const [x, y] of cells) MECH.add(idx(x, y));
    cells = cells.map(([x, y]) => rotCW(x, y));
  }
}

export function seed(): Uint8Array {
  const g = new Uint8Array(W * H);
  for (const m of MECH) g[m] = 1;
  for (const [x, y] of GLIDER) g[idx(x, y)] = 1;
  return g;
}

export function stepLife(cur: Uint8Array): Uint8Array {
  const next = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n =
        cur[i - W - 1] + cur[i - W] + cur[i - W + 1] +
        cur[i - 1] + cur[i + 1] +
        cur[i + W - 1] + cur[i + W] + cur[i + W + 1];
      next[i] = cur[i] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return next;
}

// ── render geometry ───────────────────────────────────────────────────────
// Farthest live cell sits ~33.73 cells from centre (rotation-invariant); scale
// so it lands at r≈82, inside the r=96 #001 round face. The same cell size is
// reused for the square face so every variant renders the loop at one scale.
const CELL = 82 / 33.73;

export function buildPaths(grid: Uint8Array, cell: number) {
  const inset = cell * 0.12;
  const sq = cell - 2 * inset;
  const rect = (i: number) => {
    const gx = (i % W) + X0;
    const gy = Math.floor(i / W) + Y0;
    const x = (gx - CENTER_X) * cell - sq / 2;
    const y = (gy - CENTER_Y) * cell - sq / 2;
    return `M${x.toFixed(2)} ${y.toFixed(2)}h${sq.toFixed(2)}v${sq.toFixed(
      2,
    )}h${(-sq).toFixed(2)}z`;
  };
  let mech = "";
  let glider = "";
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) continue;
    if (MECH.has(i)) mech += rect(i);
    else glider += rect(i);
  }
  // reflectors read as faint ink even where a cell momentarily blinks off
  for (const i of MECH) if (!grid[i]) mech += rect(i);
  return { mech, glider };
}

const GEN_PER_SEC = PERIOD / 60;

// Phase the glider WITHOUT rotating the field (the four Snarks stay pointing
// up/down/left/right). The glider runs clean along each diamond edge, then
// briefly scrambles (~3.5 s) as it bounces off a Snark at a corner. We offset
// the simulation so each corner-bounce STRADDLES a 15-second mark (0/15/30/45):
// half the scramble falls at the end of one quarter and half at the start of
// the next, instead of bunching at an edge's tail. Measured (browser + script):
// at phase 48 the scramble centre sat at sec≈14 — 1 s (6 gens) early — so 42
// puts the bounce centre on the marks. A small fixed offset from a "true"
// second hand remains, plus the geometric wobble of constant-speed-around-a-
// diamond vs constant-angular-speed-around-a-circle.
const SECOND_PHASE = 42;

/** Runs the phase-locked simulation; re-renders once per generation. */
function useLifeGrid(): Uint8Array | null {
  const [grid, setGrid] = useState<Uint8Array | null>(null);
  const gridRef = useRef<Uint8Array>(seed());
  const genRef = useRef<number>(0);

  useEffect(() => {
    gridRef.current = seed();
    genRef.current = 0;
    setGrid(gridRef.current);

    const tick = () => {
      const target = Math.floor((Date.now() / 1000) * GEN_PER_SEC) + SECOND_PHASE;
      let delta = target - genRef.current;
      if (delta <= 0) return;
      if (delta > 40) {
        // tab was asleep — resync exactly (the pattern is periodic)
        gridRef.current = seed();
        let k = target % PERIOD;
        while (k-- > 0) gridRef.current = stepLife(gridRef.current);
      } else {
        while (delta-- > 0) gridRef.current = stepLife(gridRef.current);
      }
      genRef.current = target;
      setGrid(gridRef.current);
    };

    const id = setInterval(tick, 80);
    return () => clearInterval(id);
  }, []);

  return grid;
}

export type DialShape = "circle" | "square";

/**
 * The shared #001-style dial with the living Game-of-Life (Snark) loop inside.
 *
 * - shape "circle" → the round #001 face (r=96).
 * - shape "square" → an upright square #001-coloured face.
 * - fieldSquared   → false (default) leaves the loop in its natural diamond
 *   orientation (snarks pointing up/down/left/right) — the agreed look for the
 *   whole family. true would rotate it 45° to sit axis-aligned (snarks on the
 *   diagonals); kept only for completeness.
 * - frame          → replaces the default border *line* (the ring of black at
 *   the rim). Pass a custom <g> to make the hour/minute read-out *be* that
 *   ring. The cream fill underneath is always drawn, so the loop reads cleanly.
 */
export function SnarkDial({
  shape = "circle",
  fieldSquared = false,
  fieldOpacity = 0.2,
  frame,
  children,
}: {
  shape?: DialShape;
  fieldSquared?: boolean;
  fieldOpacity?: number;
  frame?: ReactNode;
  children?: ReactNode;
}) {
  const grid = useLifeGrid();
  const paths = grid ? buildPaths(grid, CELL) : null;
  const fieldDeg = fieldSquared ? 45 : 0;
  const S = 78; // upright square half-side; squared-up loop spans ±69 with margin

  const bg =
    shape === "circle" ? (
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />
    ) : (
      <rect x={-S} y={-S} width={2 * S} height={2 * S} rx="6" ry="6" fill="#fafaf7" />
    );
  const defaultBorder =
    shape === "circle" ? (
      <circle cx="0" cy="0" r="96" fill="none" stroke="#1a1a1a" strokeWidth="3" />
    ) : (
      <rect
        x={-S}
        y={-S}
        width={2 * S}
        height={2 * S}
        rx="6"
        ry="6"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
    );

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Game of Life clock — a Conway glider as a living second hand"
    >
      {/* cream face, same as #001 */}
      {bg}
      {paths && (
        <g transform={`rotate(${fieldDeg})`}>
          <path d={paths.mech} fill="#1a1a1a" opacity={fieldOpacity} />
          <path d={paths.glider} fill="#c1121f" />
        </g>
      )}
      {/* the rim ring — default #001 black line, or a custom read-out frame */}
      {frame ?? defaultBorder}
      {children}
    </svg>
  );
}

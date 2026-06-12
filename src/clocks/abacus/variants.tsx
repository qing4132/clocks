"use client";

import { useWallClock } from "../useWallClock";

/**
 * Japanese soroban (日式算盘) clock.
 *
 *   A Japanese soroban has 1 heaven bead (×5) above the beam and 4 earth
 *   beads (×1 each) below it — exactly enough for one decimal digit (max
 *   5+4 = 9). Six rods read HH:MM:SS left→right; beads pushed TOWARD the
 *   central beam are counted; the two seconds rods carry red beads. Beads keep
 *   a stable identity and SLIDE between slots (CSS transition) as digits change.
 *
 *   Small rounded-square beads, hairline rods and a soft rounded background
 *   (188 wide, rx 10 — matched to #011 / #021), with generous whitespace.
 *
 *   NOTE: the bead size, spacing and the beam/rod lengths are likely to be
 *   fine-tuned later — this layout is not considered final.
 */

const INK = "#1a1a1a";
const RED = "#c1121f";

function toDigits(h: number, m: number, s: number): number[] {
  return [
    Math.floor(h / 10),
    h % 10,
    Math.floor(m / 10),
    m % 10,
    Math.floor(s / 10),
    s % 10,
  ];
}

// ---------- layout geometry (shared by all six designs) ----------
// Ten slots down each rod (2 above the beam, 8 below). `G` is the EDGE GAP
// between neighbouring bead edges; it is NOT free — it is solved from the fixed
// gray-rod length so the beads fill the rod exactly. The rod length splits as:
//   2*ROD_HALF = 10 bead-heights + ½G (top) + ½G (bottom) + 10G of gaps
//              = 10*(2*BH) + ½G + ½G + (8 normal + 1 doubled) G
//              = 20*BH + 11*G
// so slot 1 / slot 10 keep exactly ½G + BH to each rod end, and the gap across
// the beam (slots 2↔3) is doubled.
const BH = 4.4; // bead half-height (matches SQUARE.beadH); full bead height = 2*BH
const ROD_HALF = 82; // gray rod (灰线) half-length — FIXED; rod spans ±82 (length 164)
const G = (2 * ROD_HALF - 20 * BH) / 11; // edge gap, solved from the rod length
const STEP = 2 * BH + G; // normal centre-to-centre pitch
const STEP2 = 2 * BH + 2 * G; // doubled pitch across the beam (slots 2↔3)
const SPAN = 8 * STEP + STEP2; // centre-to-centre span, slot 1 → slot 10
const Y1 = -SPAN / 2; // slot 1; symmetric, leaving ½G + BH to each rod end
const VROD_X = [-72, -50, -11, 11, 50, 72]; // grouped into three pairs: 时 | 分 | 秒
const SLOT_Y = [
  Y1, // 1 — heaven idle (top)
  Y1 + STEP, // 2 — heaven down (at beam)
  Y1 + STEP + STEP2, // 3 — earth active 0
  Y1 + 2 * STEP + STEP2, // 4
  Y1 + 3 * STEP + STEP2, // 5
  Y1 + 4 * STEP + STEP2, // 6
  Y1 + 5 * STEP + STEP2, // 7 — earth rest 0
  Y1 + 6 * STEP + STEP2, // 8
  Y1 + 7 * STEP + STEP2, // 9
  Y1 + 8 * STEP + STEP2, // 10 (bottom)
];
const VBEAM_Y = (SLOT_Y[1] + SLOT_Y[2]) / 2; // beam centred in the doubled gap
const HEAVEN_REST = SLOT_Y[0]; // slot 1 — heaven bead idle (topmost)
const HEAVEN_DOWN = SLOT_Y[1]; // slot 2 — heaven bead pushed down to the beam
const EARTH_ACTIVE = [SLOT_Y[2], SLOT_Y[3], SLOT_Y[4], SLOT_Y[5]]; // slots 3–6
const EARTH_REST = [SLOT_Y[6], SLOT_Y[7], SLOT_Y[8], SLOT_Y[9]]; // slots 7–10

type Shape = "bicone" | "circle" | "rsquare" | "ring";

// A bead drawn centred at the origin; the wrapping <g> applies its rod position
// with a CSS transition, so the bead SLIDES to its new slot whenever the digit
// changes — the tactile clack of a real soroban.
function shapeNode(shape: Shape, w: number, h: number, color: string) {
  switch (shape) {
    case "ring":
      return (
        <circle r={Math.min(w, h)} fill="#fafaf7" stroke={color} strokeWidth={Math.max(1, Math.min(w, h) * 0.34)} />
      );
    case "rsquare":
      return <rect x={-w} y={-h} width={w * 2} height={h * 2} rx={Math.min(w, h) * 0.45} fill={color} />;
    case "bicone": {
      // a small diamond — the authentic soroban bead silhouette
      const k = 0.42;
      const pts = `0,${-h} ${w},${-h * k} ${w},${h * k} 0,${h} ${-w},${h * k} ${-w},${-h * k}`;
      return <polygon points={pts} fill={color} />;
    }
    default: // circle
      return <circle r={Math.min(w, h)} fill={color} />;
  }
}

const SLIDE = "transform 0.42s cubic-bezier(0.33, 1, 0.68, 1)";

function Bead({
  shape,
  cx,
  y,
  w,
  h,
  color,
}: {
  shape: Shape;
  cx: number;
  y: number;
  w: number;
  h: number;
  color: string;
}) {
  return (
    <g style={{ transform: `translate(${cx}px, ${y}px)`, transition: SLIDE }}>
      {shapeNode(shape, w, h, color)}
    </g>
  );
}

type VConfig = {
  shape: Shape;
  frame: "none" | "round" | "card" | "soft";
  frameWidth?: number;
  beadW: number;
  beadH: number;
  rodColor: string;
  rodWidth: number;
  beamWidth: number;
};

function VerticalSuanpan({ cfg, label }: { cfg: VConfig; label: string }) {
  const now = useWallClock(1000);
  const digits = toDigits(
    now ? now.getHours() : 0,
    now ? now.getMinutes() : 0,
    now ? now.getSeconds() : 0
  );

  // frames are wider than the bead field is tall, so shrink the field to sit
  // harmoniously inside the border (more margin inside the card)
  const scale = cfg.frame === "round" ? 0.8 : cfg.frame === "card" ? 0.78 : 1;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label={label}
    >
      {cfg.frame === "none" && (
        <rect x="-100" y="-100" width="200" height="200" fill="#fafaf7" />
      )}
      {cfg.frame === "round" && (
        <circle cx={0} cy={0} r={96} fill="#fafaf7" stroke={INK} strokeWidth={cfg.frameWidth ?? 1.5} />
      )}
      {cfg.frame === "card" && (
        <rect x="-94" y="-94" width="188" height="188" rx="10" fill="#fafaf7" stroke={INK} strokeWidth={cfg.frameWidth ?? 1.5} />
      )}
      {cfg.frame === "soft" && (
        <rect x="-94" y="-94" width="188" height="188" rx="10" fill="#fafaf7" />
      )}

      <g transform={`scale(${scale})`}>
        {/* rods (vertical hairlines) — drawn first, beneath the beam */}
        {VROD_X.map((cx, i) => (
          <line key={`rod-${i}`} x1={cx} y1={-ROD_HALF} x2={cx} y2={ROD_HALF} stroke={cfg.rodColor} strokeWidth={cfg.rodWidth} />
        ))}

        {/* beam (division line) — on top of the rods */}
        <line x1={-80} y1={VBEAM_Y} x2={80} y2={VBEAM_Y} stroke={INK} strokeWidth={cfg.beamWidth} />

        {/* beads — on top of everything */}
        {now &&
          VROD_X.map((cx, i) => {
            const red = i >= 4;
            const color = red ? RED : INK;
            const d = digits[i];
            const heavenY = d >= 5 ? HEAVEN_DOWN : HEAVEN_REST;
            const e = d % 5;
            return (
              <g key={i}>
                <Bead shape={cfg.shape} cx={cx} y={heavenY} w={cfg.beadW} h={cfg.beadH} color={color} />
                {[0, 1, 2, 3].map((bi) => {
                  const active = bi < e;
                  const y = active ? EARTH_ACTIVE[bi] : EARTH_REST[bi];
                  return (
                    <Bead key={bi} shape={cfg.shape} cx={cx} y={y} w={cfg.beadW} h={cfg.beadH} color={color} />
                  );
                })}
              </g>
            );
          })}
      </g>
    </svg>
  );
}

// Square beads on a soft rounded-rectangle field (matched to #011/#021: 188 wide, rx 10).
const SQUARE: VConfig = {
  shape: "rsquare", frame: "soft", beadW: 4.4, beadH: 4.4,
  rodColor: "#e6e4db", rodWidth: 1, beamWidth: 1.5,
};

export function SorobanClock() {
  return <VerticalSuanpan cfg={SQUARE} label="Japanese soroban clock" />;
}

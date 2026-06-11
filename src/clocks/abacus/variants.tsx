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
const VROD_X = [-72, -50, -11, 11, 50, 72]; // grouped into three pairs: 时 | 分 | 秒
const VBEAM_Y = -42;
const HEAVEN_REST = -70; // single heaven bead, idle (up)
const HEAVEN_DOWN = -52; // single heaven bead, active (down to beam)
// earth beads indexed 0..3 (0 = nearest the beam); each has an "up" slot
// (pushed to the beam) and a "rest" slot (piled at the bottom). Giving every
// physical bead a stable slot pair is what lets it SLIDE between the two.
const EARTH_ACTIVE = [-30, -14, 2, 18]; // bead i pushed up to the beam
const EARTH_REST = [30, 46, 62, 78]; // bead i resting at the bottom

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
        {/* beam */}
        <line x1={-80} y1={VBEAM_Y} x2={80} y2={VBEAM_Y} stroke={INK} strokeWidth={cfg.beamWidth} />

        {now &&
          VROD_X.map((cx, i) => {
            const red = i >= 4;
            const color = red ? RED : INK;
            const d = digits[i];
            const heavenY = d >= 5 ? HEAVEN_DOWN : HEAVEN_REST;
            const e = d % 5;
            return (
              <g key={i}>
                <line x1={cx} y1={-80} x2={cx} y2={80} stroke={cfg.rodColor} strokeWidth={cfg.rodWidth} />
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

"use client";

import { useEffect, useRef, useState } from "react";
import { DigitalPanel } from "../digital/segments";

/**
 * Dead-pixel-density clock variants — the digits are not vector shapes.
 * Instead, the panel is filled with flickering pixels at density P_BG
 * everywhere, and at higher density P_FG inside the rasterised shape
 * of the time string. Your eye picks out the digits from the contrast.
 *
 * Variants tune pixel size, densities, and refresh rate.
 */

type VariantConfig = {
  cell: number; // pixel grid cell size in SVG units
  pBg: number; // background light probability per frame
  pFg: number; // probability when the cell sits on a lit segment
  interval: number; // ms between frame rerolls
  color: string;
  secondsColor?: string;
};

const PANEL = { x: -94, y: -30, w: 188, h: 60 };

// 5×7 dotted font.
const FONT: Record<string, string[]> = {
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["00000", "00100", "00000", "00000", "00000", "00100", "00000"],
};

/** Returns the rasterised mask of "HH:MM:SS" as a 2-D array:
 *    mask[row][col] = "h" | "m" | "s" | "" (which group of digits or empty)
 *  Grid dimensions match the panel's pixel grid for the variant's cell size.
 */
function rasteriseTime(
  HH: string,
  MM: string,
  SS: string,
  cell: number,
): {
  cols: number;
  rows: number;
  mask: ("h" | "m" | "s" | "")[][];
  cellW: number;
  cellH: number;
} {
  const cols = Math.floor(PANEL.w / cell);
  const rows = Math.floor(PANEL.h / cell);
  const mask: ("h" | "m" | "s" | "")[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(""),
  );

  // Character cell: 5 cols × 7 rows in font space. We want each character
  // to fit nicely in the panel. Pick scale so the full string fits with
  // some margin.
  const text = `${HH}:${MM}:${SS}`;
  const charW = 5; // font columns
  const charH = 7;
  const gap = 1; // gap between chars
  const fullTextW = text.length * charW + (text.length - 1) * gap;
  // Pick integer scale to maximise font size while fitting both dimensions.
  const scaleX = Math.floor((cols - 4) / fullTextW);
  const scaleY = Math.floor((rows - 2) / charH);
  const scale = Math.max(1, Math.min(scaleX, scaleY));
  const drawnW = fullTextW * scale;
  const drawnH = charH * scale;
  const startCol = Math.floor((cols - drawnW) / 2);
  const startRow = Math.floor((rows - drawnH) / 2);

  const groupForChar = (idx: number): "h" | "m" | "s" => {
    if (idx <= 1) return "h";
    if (idx === 2) return "h"; // colon stays with hours group visually
    if (idx <= 4) return "m";
    if (idx === 5) return "m";
    return "s";
  };

  for (let ci = 0; ci < text.length; ci++) {
    const glyph = FONT[text[ci]] ?? FONT["0"];
    const groupTag = groupForChar(ci);
    const charStartCol = startCol + ci * (charW + gap) * scale;
    for (let r = 0; r < charH; r++) {
      for (let c = 0; c < charW; c++) {
        if (glyph[r][c] !== "1") continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const col = charStartCol + c * scale + dx;
            const row = startRow + r * scale + dy;
            if (col >= 0 && col < cols && row >= 0 && row < rows) {
              mask[row][col] = groupTag;
            }
          }
        }
      }
    }
  }

  return { cols, rows, mask, cellW: cell, cellH: cell };
}

function useTime() {
  const [s, set] = useState({ HH: "00", MM: "00", SS: "00", ms: 0 });
  useEffect(() => {
    const fn = () => {
      const n = new Date();
      set({
        HH: String(n.getHours()).padStart(2, "0"),
        MM: String(n.getMinutes()).padStart(2, "0"),
        SS: String(n.getSeconds()).padStart(2, "0"),
        ms: n.getMilliseconds(),
      });
    };
    fn();
    const id = setInterval(fn, 250);
    return () => clearInterval(id);
  }, []);
  return s;
}

function DeadPixelDensity({ cfg }: { cfg: VariantConfig }) {
  const time = useTime();
  const ref = useRef<SVGGElement | null>(null);
  const data = rasteriseTime(time.HH, time.MM, time.SS, cfg.cell);
  const { cols, rows, mask } = data;

  // Animate the noise via direct DOM mutation.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > cfg.interval) {
        last = t;
        const g = ref.current;
        if (!g) {
          raf = requestAnimationFrame(loop);
          return;
        }
        const ch = g.children;
        for (let i = 0; i < ch.length; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const tag = mask[row]?.[col] ?? "";
          const p = tag ? cfg.pFg : cfg.pBg;
          const lit = Math.random() < p;
          (ch[i] as SVGElement).setAttribute("opacity", lit ? "1" : "0");
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cfg, cols, mask]);

  const xStart = PANEL.x + (PANEL.w - cols * cfg.cell) / 2;
  const yStart = PANEL.y + (PANEL.h - rows * cfg.cell) / 2;

  // Build a flat list of rects, one per cell, indexed row-major so the
  // animation loop can iterate sequentially.
  const cells: { x: number; y: number; tag: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: xStart + c * cfg.cell,
        y: yStart + r * cfg.cell,
        tag: mask[r][c],
      });
    }
  }

  return (
    <g ref={ref}>
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={cfg.cell}
          height={cfg.cell}
          fill={c.tag === "s" && cfg.secondsColor ? cfg.secondsColor : cfg.color}
          opacity="0"
        />
      ))}
    </g>
  );
}

const Svg = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <svg
    viewBox="-100 -100 200 200"
    className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
    role="img"
    aria-label={label}
  >
    <DigitalPanel>{children}</DigitalPanel>
  </svg>
);

// ─── A: fine grid, gentle contrast (5% bg → 85% fg) ─────────────────────
export function DensityA() {
  return (
    <Svg label="Density A">
      <DeadPixelDensity cfg={{ cell: 2, pBg: 0.05, pFg: 0.85, interval: 1000, color: "#1a1a1a" }} />
    </Svg>
  );
}

// ─── B: more background interference (12% bg → 90% fg) ──────────────────
export function DensityB() {
  return (
    <Svg label="Density B">
      <DeadPixelDensity cfg={{ cell: 2, pBg: 0.12, pFg: 0.9, interval: 1000, color: "#1a1a1a" }} />
    </Svg>
  );
}

// ─── C: bigger pixels for more readable shapes ──────────────────────────
export function DensityC() {
  return (
    <Svg label="Density C">
      <DeadPixelDensity cfg={{ cell: 3, pBg: 0.08, pFg: 0.85, interval: 1000, color: "#1a1a1a" }} />
    </Svg>
  );
}

// ─── D: red seconds, easy contrast ──────────────────────────────────────
export function DensityD() {
  return (
    <Svg label="Density D">
      <DeadPixelDensity
        cfg={{ cell: 2, pBg: 0.06, pFg: 0.85, interval: 1000, color: "#1a1a1a", secondsColor: "#c1121f" }}
      />
    </Svg>
  );
}

// ─── E: slow refresh (350ms) — almost stable image with occasional flicker
export function DensityE() {
  return (
    <Svg label="Density E">
      <DeadPixelDensity cfg={{ cell: 2, pBg: 0.05, pFg: 0.9, interval: 1000, color: "#1a1a1a" }} />
    </Svg>
  );
}

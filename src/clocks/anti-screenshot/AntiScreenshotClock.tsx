"use client";

import { useEffect, useRef } from "react";
import { useWallClock } from "../useWallClock";

/**
 * Anti-Screenshot — 反截图.
 *
 *   A square block of dynamic black-on-background noise (a random-dot
 *   kinematogram). The time `HH:MM` is made of the *same* noise, so any single
 *   frame — and therefore any screenshot — is indistinguishable static: you
 *   cannot read it, and you cannot capture the time. The digits are revealed
 *   ONLY by relative motion (Gestalt "common fate").
 *
 *   Drawn on a canvas with a SHARED grid: every cell is a fixed, integer-pixel
 *   square. The digit mask only chooses, per cell, WHICH scrolled noise field
 *   that cell samples — figure cells a field flowing one way, background cells
 *   the other. So a frozen frame shows no boundary (the digit outline does not
 *   leak) and there are no sub-pixel edges. Motion is therefore whole-cell; the
 *   cells are kept fine so the whole-cell steps read as smooth flow.
 */

const FONT: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

const BLACK = "#1a1a1a";
const BG = "#fafafa";

const CELLS_ACROSS = 240; // higher = finer, smoother noise cells
const TEX_EXTRA = 480; // extra noise columns → long, non-repeating scroll
const CELLS_PER_SEC = 30; // whole-cell scroll speed

function makeRand(seed: number) {
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

// On-blocks of HH:MM at a given cell grid. Each entry is [cellX, cellY, sizeCells].
function digitBlocks(now: number, cols: number, rows: number): [number, number, number][] {
  const d = new Date(now);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const chars = [hh[0], hh[1], ":", mm[0], mm[1]];
  const FW = 25;
  const bs = Math.max(1, Math.floor(Math.min((cols * 0.82) / FW, (rows * 0.5) / 7)));
  const startX = Math.floor((cols - FW * bs) / 2);
  const startY = Math.floor((rows - 7 * bs) / 2);
  const blocks: [number, number, number][] = [];
  let col = 0;
  for (const ch of chars) {
    if (ch === ":") {
      for (const rr of [2, 4]) blocks.push([startX + col * bs, startY + rr * bs, bs]);
      col += 2;
    } else {
      const pat = FONT[ch];
      for (let r = 0; r < 7; r++) {
        for (let c2 = 0; c2 < 5; c2++) {
          if (pat[r][c2] === "1") blocks.push([startX + (col + c2) * bs, startY + r * bs, bs]);
        }
      }
      col += 6;
    }
  }
  return blocks;
}

export default function AntiScreenshotClock() {
  const ref = useRef<HTMLCanvasElement>(null);
  const now = useWallClock(32);
  const nowRef = useRef<number | null>(null);

  useEffect(() => {
    nowRef.current = now?.getTime() ?? null;
  }, [now]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let sq = 0;
    let mx = 0;
    let my = 0;
    let rad = 0;
    let CELL = 4;
    let cols = 0;
    let rows = 0;
    let texCols = 0;
    let tex = new Uint8Array(0);
    let tex2 = new Uint8Array(0);
    let mask = new Uint8Array(0);
    let lastMin = -1;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!cw || !ch) return;
      W = Math.max(1, Math.round(cw * dpr));
      H = Math.max(1, Math.round(ch * dpr));
      canvas.width = W;
      canvas.height = H;
      const side = Math.min(W, H);
      sq = Math.round(side * 0.94); // 188/200, matching #021
      mx = Math.round((W - sq) / 2);
      my = Math.round((H - sq) / 2);
      rad = Math.round(side * 0.05); // rx 10/200
      CELL = Math.max(2, Math.round(sq / CELLS_ACROSS));
      cols = Math.ceil(sq / CELL);
      rows = Math.ceil(sq / CELL);
      texCols = cols + TEX_EXTRA;
      tex = new Uint8Array(texCols * rows);
      tex2 = new Uint8Array(texCols * rows);
      const r = makeRand(99991);
      for (let k = 0; k < tex.length; k++) {
        tex[k] = r() < 0.5 ? 1 : 0;
        tex2[k] = r() < 0.5 ? 1 : 0;
      }
      mask = new Uint8Array(cols * rows);
      lastMin = -1;
    };

    const buildMask = (now: number) => {
      mask.fill(0);
      for (const [bx, by, bsz] of digitBlocks(now, cols, rows)) {
        for (let yy = by; yy < by + bsz; yy++) {
          if (yy < 0 || yy >= rows) continue;
          for (let xx = bx; xx < bx + bsz; xx++) {
            if (xx < 0 || xx >= cols) continue;
            mask[yy * cols + xx] = 1;
          }
        }
      }
    };

    const wrap = (n: number, m: number) => ((n % m) + m) % m;

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!cols) return;
      const clockNow = nowRef.current;
      if (clockNow === null) return;
      const minute = Math.floor(clockNow / 60000);
      if (minute !== lastMin) {
        buildMask(clockNow);
        lastMin = minute;
      }
      const ox = Math.floor((clockNow / 1000) * CELLS_PER_SEC);

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(mx, my, sq, sq, rad);
      ctx.clip();

      ctx.fillStyle = BG;
      ctx.fillRect(mx, my, sq, sq);

      ctx.fillStyle = BLACK;
      for (let j = 0; j < rows; j++) {
        const rowBase = j * texCols;
        const yPix = my + j * CELL;
        for (let i = 0; i < cols; i++) {
          const fig = mask[j * cols + i] === 1;
          // figure cells sample a field flowing left, background one flowing
          // right — both full aligned squares on the same grid.
          const bit = fig
            ? tex[rowBase + wrap(i + ox, texCols)]
            : tex2[rowBase + wrap(i - ox, texCols)];
          if (bit) ctx.fillRect(mx + i * CELL, yPix, CELL, CELL);
        }
      }
      ctx.restore();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="w-72 h-72 sm:w-96 sm:h-96"
      role="img"
      aria-label="Anti-screenshot clock"
    />
  );
}

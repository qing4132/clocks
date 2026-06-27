"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Anti-Screenshot — 反截图.
 *
 *   A square block of dynamic black-on-background noise (a random-dot
 *   kinematogram). The time `HH:MM` is made of the *same* noise, so any single
 *   frame — and therefore any screenshot — is indistinguishable static: you can
 *   read nothing, and you cannot capture the time. The figure is revealed ONLY
 *   by relative motion (Gestalt "common fate"): the digit noise drifts one way
 *   while the background noise drifts the opposite way, splitting the digits out
 *   of the field. Stop the motion and they vanish into the snow. Every cell is
 *   either black or the page background colour.
 *
 *   Implementation: two layered noise fields (background + a digit-masked
 *   figure), each a long non-repeating noise strip, scrolled in opposite
 *   directions by setting `transform` ourselves per frame (modulo-wrapped by one
 *   strip). We deliberately avoid a looping CSS/WAAPI animation — its iteration
 *   restart is what makes iOS Safari flash the whole layer. A plain transform
 *   update is a compositor-only move (GPU), and because the two copies of the
 *   strip are identical, the modulo wrap is visually seamless with no animation
 *   boundary.
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
const BG = "#fafafa"; // page background — the "transparent" cells blend into it

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

const B_CELL = 3;
const B_N = 120; // square face side in cells → 360px
const B_TILE = B_CELL * B_N; // 360 (square face + mask size)
// The scrolling noise is a long, NON-repeating strip so the loop period is far
// larger than the face (~20s instead of ~4s) and the repeat is hard to spot.
// Each track lays two copies of this strip for coverage; the wrap happens at one
// strip width and is seamless (identical copies). Track width (2×strip) is kept
// under iOS's ~4096px composited-layer limit.
const B_COLS = 600; // strip width in cells
const LONG = B_CELL * B_COLS; // 1800px non-repeating noise strip

export default function AntiScreenshotClock() {
  const bgTrackRef = useRef<HTMLDivElement>(null);
  const figTrackRef = useRef<HTMLDivElement>(null);
  const figClipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const makeNoiseURL = (seed: number) => {
      const c = document.createElement("canvas");
      c.width = LONG;
      c.height = B_TILE;
      const x = c.getContext("2d")!;
      x.fillStyle = BG;
      x.fillRect(0, 0, LONG, B_TILE);
      x.fillStyle = BLACK;
      const r = makeRand(seed);
      for (let j = 0; j < B_N; j++)
        for (let i = 0; i < B_COLS; i++) if (r() < 0.5) x.fillRect(i * B_CELL, j * B_CELL, B_CELL, B_CELL);
      return c.toDataURL();
    };
    // Real tile children (no background-repeat) so iOS Safari always paints the
    // area exposed by the transform.
    const setTiles = (track: HTMLDivElement | null, url: string) => {
      if (!track) return;
      for (const child of Array.from(track.children)) {
        (child as HTMLElement).style.backgroundImage = `url(${url})`;
      }
    };
    setTiles(bgTrackRef.current, makeNoiseURL(99991));
    setTiles(figTrackRef.current, makeNoiseURL(12345));

    // Scroll by setting transform per frame (modulo-wrapped). No looping CSS
    // animation → no iOS iteration-restart flash. Background drifts right, the
    // figure drifts left.
    let raf = 0;
    const t0 = performance.now();
    const speed = 0.09; // px/ms ≈ 90 px/s
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const off = Math.round((t - t0) * speed) % LONG; // integer px, [0, LONG)
      if (bgTrackRef.current) bgTrackRef.current.style.transform = `translate3d(${off}px,0,0)`;
      if (figTrackRef.current) figTrackRef.current.style.transform = `translate3d(${-off}px,0,0)`;
    };
    raf = requestAnimationFrame(loop);

    const makeMaskURL = () => {
      const c = document.createElement("canvas");
      c.width = B_TILE;
      c.height = B_TILE;
      const x = c.getContext("2d")!;
      x.clearRect(0, 0, B_TILE, B_TILE);
      x.fillStyle = "#000";
      for (const [bx, by, bsz] of digitBlocks(Date.now(), B_N, B_N)) {
        x.fillRect(bx * B_CELL, by * B_CELL, bsz * B_CELL, bsz * B_CELL);
      }
      return c.toDataURL();
    };
    const applyMask = () => {
      const url = makeMaskURL();
      const el = figClipRef.current;
      if (!el) return;
      el.style.webkitMaskImage = `url(${url})`;
      el.style.maskImage = `url(${url})`;
    };
    applyMask();
    let lastMin = new Date().getMinutes();
    const iv = setInterval(() => {
      const m = new Date().getMinutes();
      if (m !== lastMin) {
        lastMin = m;
        applyMask();
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
    };
  }, []);

  const trackBase: CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: `${2 * LONG}px`,
    display: "flex",
    willChange: "transform",
    backfaceVisibility: "hidden",
  };
  const trackBg: CSSProperties = { ...trackBase, left: `${-LONG}px` };
  const trackFig: CSSProperties = { ...trackBase, left: 0 };
  const tile: CSSProperties = {
    flex: "0 0 auto",
    width: `${LONG}px`,
    height: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: `${LONG}px 100%`,
    imageRendering: "pixelated",
    backfaceVisibility: "hidden",
  };

  return (
    <div className="w-72 h-72 sm:w-96 sm:h-96 relative" role="img" aria-label="Anti-screenshot clock">
      <div style={{ position: "absolute", inset: "3%", borderRadius: "5%", overflow: "hidden", background: BG }}>
        <div ref={bgTrackRef} style={trackBg}>
          <div style={tile} />
          <div style={tile} />
        </div>
        <div
          ref={figClipRef}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        >
          <div ref={figTrackRef} style={trackFig}>
            <div style={tile} />
            <div style={tile} />
          </div>
        </div>
      </div>
    </div>
  );
}

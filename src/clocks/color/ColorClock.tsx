"use client";

import { useWallClock } from "../useWallClock";

/**
 * #021 — Color.
 *
 *   The whole face is a single flat colour: the hex value #HHMMSS, where the
 *   pairs of digits are literally the current hour, minute and second. So at
 *   13:24:57 the dial is exactly #132457.
 *
 *   The twist (a cousin of the Unix clock's "machine-readable, human-illegible"
 *   idea): time becomes a colour you can't read precisely, yet can feel slowly
 *   drifting — reds and oranges through the small hours of the green/blue
 *   channels, the second-pair flickering the blue. A faint hex caption is the
 *   only concession to legibility.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// pick black or white caption for contrast against the current background
function readableInk(r: number, g: number, b: number) {
  // relative luminance (sRGB-ish), threshold ~0.5
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#1a1a1a" : "#fafaf7";
}

export default function ColorClock() {
  const now = useWallClock(1000);
  const h = now ? now.getHours() : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const hex = `#${pad(h)}${pad(m)}${pad(s)}`;
  // the hex pairs ARE the time, read as 0-99 each, mapped onto 0-255 for colour
  const r = h, g = m, b = s; // 0..23, 0..59, 0..59 — naturally dark, that's fine
  const ink = readableInk(r, g, b);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Color clock — the face is the colour #HHMMSS"
    >
      {/* the colour fills the whole face; thin #001-style border keeps it a dial */}
      <rect
        x="-96"
        y="-96"
        width="192"
        height="192"
        rx="10"
        ry="10"
        fill={now ? hex : "#000000"}
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      {now && (
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'SF Mono', Menlo, Consolas, 'Courier New', monospace"
          fontSize="22"
          letterSpacing="2"
          fill={ink}
        >
          {hex.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

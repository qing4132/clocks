"use client";

import { useEffect, useState } from "react";

/**
 * #008 — Linear clock.
 *
 *   No circle, no hands rotating. A single horizontal axis spans the dial,
 *   divided into 12 equal segments (with finer minor ticks). Three small
 *   vertical needles slide along the axis:
 *     - hour   needle: black, thick — position = (h + m/60) / 12 of axis length
 *     - minute needle: black, medium — position = (m + s/60) / 60
 *     - second needle: red,   thin   — position = s / 60
 *   Each needle's x position is read off against the scale below.
 */
export default function LinearClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const H = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const round = (n: number) => Math.round(n * 1000) / 1000;

  const L = 180;
  const x0 = -L / 2;
  const xAt = (frac: number) => round(x0 + frac * L);

  const hFrac = (H + m / 60) / 12;
  const mFrac = (m + s / 60) / 60;
  const sFrac = s / 60;

  // Needle lengths match #001 exactly: hour 50, minute 74, second 84.
  // Needles sit ABOVE the baseline (y ≤ 0).
  const hourLen = 50;
  const minLen = 74;
  const secLen = 84;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Linear clock"
    >
      {/* The artwork extends from y = -secLen (= -84, top of the tallest needle)
          down to y ≈ 23 (bottom of the numerals). Centering vertically in the
          200-unit viewBox means shifting the whole group down by ~30. */}
      <g transform="translate(0 30)">
      {/* baseline */}
      <line x1={x0} y1="0" x2={-x0} y2="0" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />

      {/* 60 minor ticks (every i in 0..60 gets a tick) */}
      {Array.from({ length: 61 }).map((_, i) => {
        const isMajor = i % 5 === 0;
        const x = xAt(i / 60);
        const len = isMajor ? 5 : 2.5;
        return (
          <line
            key={i}
            x1={x}
            y1="0"
            x2={x}
            y2={len}
            stroke="#1a1a1a"
            strokeWidth={isMajor ? 1.5 : 0.6}
            strokeLinecap="round"
          />
        );
      })}

      {/* numeric labels: 1..11 along the axis, and 12 at the RIGHT end only.
          The leftmost position is intentionally unlabelled. */}
      {Array.from({ length: 13 }).map((_, i) => {
        if (i === 0) return null;
        const num = i === 12 ? 12 : i;
        const x = xAt(i / 12);
        return (
          <text
            key={i}
            x={x}
            y="14"
            textAnchor="middle"
            dominantBaseline="hanging"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="9"
            fill="#1a1a1a"
          >
            {num}
          </text>
        );
      })}

      {now && (
        <>
          {/* hour needle */}
          <line
            x1={xAt(hFrac)}
            y1={-1}
            x2={xAt(hFrac)}
            y2={-hourLen}
            stroke="#1a1a1a"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* minute needle */}
          <line
            x1={xAt(mFrac)}
            y1={-1}
            x2={xAt(mFrac)}
            y2={-minLen}
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* second needle */}
          <line
            x1={xAt(sFrac)}
            y1={-1}
            x2={xAt(sFrac)}
            y2={-secLen}
            stroke="#c1121f"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      </g>
    </svg>
  );
}

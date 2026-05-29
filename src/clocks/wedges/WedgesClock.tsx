"use client";

import { useEffect, useState } from "react";

/**
 * #014 — Wedges clock.
 *
 *   Three concentric pie wedges (not stroked arcs) fill from the
 *   12-o'clock position clockwise to the current value:
 *     - inner wedge (densest black, smallest radius) → hours
 *     - middle wedge → minutes
 *     - outer wedge (faintest, red) → seconds
 *   Reading the time = how much of each pie is filled.
 */
export default function WedgesClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const round = (n: number) => Math.round(n * 1000) / 1000;

  const wedge = (r: number, frac: number) => {
    if (frac <= 0) return "";
    const f = Math.min(0.9999, frac);
    const a = f * 2 * Math.PI - Math.PI / 2;
    const x = round(Math.cos(a) * r);
    const y = round(Math.sin(a) * r);
    const large = f > 0.5 ? 1 : 0;
    return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${large} 1 ${x} ${y} Z`;
  };

  const R_HOUR = 50;
  const R_MIN = 70;
  const R_SEC = 88;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Wedges clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      {now && (
        <>
          <path d={wedge(R_SEC, s / 60)} fill="#c1121f" opacity="0.18" />
          <path d={wedge(R_MIN, (m + s / 60) / 60)} fill="#1a1a1a" opacity="0.45" />
          <path d={wedge(R_HOUR, (h + m / 60) / 12)} fill="#1a1a1a" opacity="0.85" />
        </>
      )}
    </svg>
  );
}

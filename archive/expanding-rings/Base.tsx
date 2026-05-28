"use client";

import { type ReactNode } from "react";

/**
 * Shared base for #008 expanding-rings variants. Variants only differ in
 * how the vertical ruler + ticks + numerals are drawn. The three expanding
 * rings (hour / minute / second) and the time math are identical.
 */
export default function ExpandingRingsBase({
  ruler,
  hour,
  minute,
  second,
  L,
}: {
  ruler: ReactNode;
  hour: number;
  minute: number;
  second: number;
  L: number;
}) {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const hourProg = hour;
  const minProg = minute;
  const secProg = second;
  const hourFrac = hourProg === 0 ? 1 : hourProg / 12;
  const minFrac = minProg === 0 ? 1 : minProg / 60;
  const secFrac = secProg === 0 ? 1 : secProg / 60;
  const rHour = round(hourFrac * L);
  const rMin = round(minFrac * L);
  const rSec = round(secFrac * L);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Expanding-rings clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      {ruler}

      {rHour > 0 && (
        <circle
          cx="0"
          cy="0"
          r={rHour}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2.4"
        />
      )}
      {rMin > 0 && (
        <circle
          cx="0"
          cy="0"
          r={rMin}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.4"
        />
      )}
      {rSec > 0 && (
        <circle
          cx="0"
          cy="0"
          r={rSec}
          fill="none"
          stroke="#c1121f"
          strokeWidth="1"
        />
      )}

      <circle cx="0" cy="0" r="2" fill="#1a1a1a" />
    </svg>
  );
}

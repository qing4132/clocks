"use client";

import { useEffect, useState } from "react";

/**
 * #008 — Expanding-rings clock.
 *
 *   A single vertical "ruler" runs from the center straight up to the top
 *   of the dial, divided into 12 equal segments by tick marks.
 *
 *   Three concentric circles, centered at the dial center, expand outward
 *   to encode the time:
 *     - hour   circle: radius = (h / 12)  · L     where h ∈ [0, 12)
 *     - minute circle: radius = (m / 60)  · L     where m ∈ [0, 60)
 *     - second circle: radius = (s / 60)  · L     where s ∈ [0, 60)
 *   L = total length of the ruler.
 *
 *   To read off the time, see where each circle's edge crosses the ruler:
 *     - hour:   the 12 ticks each represent 1 h
 *     - minute: the 12 ticks each represent 5 min
 *     - second: the 12 ticks each represent 5 s
 *
 *   When a circle reaches the top tick its value resets to 0 (its radius
 *   collapses back to the center) and starts expanding again.
 */
export default function ExpandingRingsClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const H = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const L = 96; // length of the vertical ruler — flush with the dial edge

  // Continuous progress so the rings drift smoothly between major ticks.
  //   hour:   H + m/60  hours past 12
  //   minute: m + s/60  minutes past 0
  //   second: integer seconds (ticks discretely)
  const hourProg = H + m / 60;
  const minProg = m + s / 60;
  const secProg = s;

  // Value 0 (top of the cycle: 12 o'clock / minute 0 / second 0) is shown as
  // a fully-grown ring at the outer edge, not as a collapsed point.
  const hourFrac = hourProg === 0 ? 1 : hourProg / 12;
  const minFrac = minProg === 0 ? 1 : minProg / 60;
  const secFrac = secProg === 0 ? 1 : secProg / 60;

  const rHour = hourFrac * L;
  const rMin = minFrac * L;
  const rSec = secFrac * L;

  const round = (n: number) => Math.round(n * 1000) / 1000;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Expanding-rings clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      {/* Vertical ruler: a thin spine from center to the dial edge, with
          12 evenly-spaced ticks pointing left (perpendicular to the spine),
          matching the visual language of the standard dial ticks. */}
      <line x1="0" y1="0" x2="0" y2={-L} stroke="#1a1a1a" strokeWidth="1" />
      {Array.from({ length: 13 }).map((_, i) => {
        if (i === 0) return null;
        const y = round((-i / 12) * L);
        const isMajor = i === 3 || i === 6 || i === 9 || i === 12;
        // Ticks protrude to the LEFT of the spine, mirroring how the rim ticks
        // protrude inward from the dial edge.
        const len = isMajor ? 10 : 6;
        return (
          <g key={i}>
            <line
              x1={0}
              y1={y}
              x2={-len}
              y2={y}
              stroke="#1a1a1a"
              strokeWidth={isMajor ? 2.5 : 1}
              strokeLinecap="round"
            />
            {isMajor && (
              <text
                x={6}
                y={y}
                textAnchor="start"
                dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="11"
                fill="#1a1a1a"
              >
                {i}
              </text>
            )}
          </g>
        );
      })}

      {now && (
        <>
          {/* hour circle (thickest, outermost layered) */}
          {rHour > 0 && (
            <circle
              cx="0"
              cy="0"
              r={round(rHour)}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="2.4"
            />
          )}
          {/* minute circle */}
          {rMin > 0 && (
            <circle
              cx="0"
              cy="0"
              r={round(rMin)}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="1.4"
            />
          )}
          {/* second circle (red, thinnest) */}
          {rSec > 0 && (
            <circle
              cx="0"
              cy="0"
              r={round(rSec)}
              fill="none"
              stroke="#c1121f"
              strokeWidth="1"
            />
          )}
        </>
      )}

      {/* center dot */}
      <circle cx="0" cy="0" r="2" fill="#1a1a1a" />
    </svg>
  );
}

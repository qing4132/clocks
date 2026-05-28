"use client";

import { useEffect, useState } from "react";

/**
 * #009 — Cartesian grid clock.
 *
 *   A 2D coordinate system:
 *     - x-axis: hours,   0 → 23 (24 columns)
 *     - y-axis: minutes, 0 → 59 (60 rows, drawn bottom-to-top in math style)
 *   A small square sits at (currentHour, currentMinute) and displays the
 *   current second number inside it. Each new minute the square jumps one
 *   cell up; each new hour it jumps one cell right (and falls back to row 0).
 *   At midnight it teleports back to (0, 0).
 */
export default function CartesianClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    let raf = 0;
    const loop = () => {
      setNow(new Date());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const H = now ? now.getHours() % 12 : 0; // 0..11 (12-hour scale)
  const m = now ? now.getMinutes() : 0;     // 0..59
  const s = now ? now.getSeconds() : 0;     // 0..59
  const ms = now ? now.getMilliseconds() : 0;
  // Continuous fractional values so the cell drifts smoothly between ticks.
  const sFrac = s + ms / 1000;                // 0..60
  const mFrac = m + sFrac / 60;               // 0..60
  const hFrac = H + mFrac / 60;               // 0..12
  const round = (n: number) => Math.round(n * 1000) / 1000;

  // Plot area (SVG y increases downward, so we flip y).
  const X0 = -80; // left edge
  const Y0 = 80;  // bottom edge (math origin)
  const W = 160;  // plot width
  const Hgt = 160; // plot height
  const colW = W / 12;
  const rowH = Hgt / 60;

  const cellSize = 22;
  // Cell centre uses fractional (h, m) so it glides smoothly through time.
  const cellCx = round(X0 + hFrac * colW);
  const cellCy = round(Y0 - mFrac * rowH);
  const cellX = round(cellCx - cellSize / 2);
  const cellY = round(cellCy - cellSize / 2);
  const cellW = cellSize;
  const cellH = cellSize;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Cartesian grid clock"
    >
      {/* axes — bounded to [0, 12] × [0, 60], no overshoot */}
      <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke="#1a1a1a" strokeWidth="1" />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - Hgt} stroke="#1a1a1a" strokeWidth="1" />

      {/* x-axis ticks: every hour, label every 3 (skip i=0 to keep the origin clean) */}
      {Array.from({ length: 13 }).map((_, i) => {
        if (i === 0) return null;
        const x = round(X0 + i * colW);
        const isMajor = i % 3 === 0;
        return (
          <g key={`x${i}`}>
            <line x1={x} y1={Y0} x2={x} y2={Y0 + (isMajor ? 4 : 2)} stroke="#1a1a1a" strokeWidth={isMajor ? 1 : 0.5} />
            {isMajor && i !== 0 && (
              <text x={x} y={Y0 + 12} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fill="#1a1a1a">
                {i}
              </text>
            )}
          </g>
        );
      })}
      {/* y-axis ticks: every 5 minutes, label every 15 (skip i=0 at origin) */}
      {Array.from({ length: 13 }).map((_, i) => {
        if (i === 0) return null;
        const minute = i * 5;
        const y = round(Y0 - minute * rowH);
        const isMajor = minute % 15 === 0;
        return (
          <g key={`y${i}`}>
            <line x1={X0 - (isMajor ? 4 : 2)} y1={y} x2={X0} y2={y} stroke="#1a1a1a" strokeWidth={isMajor ? 1 : 0.5} />
            {isMajor && minute !== 0 && (
              <text x={X0 - 7} y={y} textAnchor="end" dominantBaseline="central" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fill="#1a1a1a">
                {minute}
              </text>
            )}
          </g>
        );
      })}

      {/* axis arrows omitted; the bare axes are enough */}

      {now && (
        <>
          {/* Projection dashes that stop at the seconds label's bounding box.
              No mask rectangle — the gap is naturally invisible on any
              background colour. */}
          {(() => {
            const halfW = 9; // half-width of label box
            const halfH = 7; // half-height of label box
            return (
              <>
                <line
                  x1={cellCx}
                  y1={cellCy + halfH}
                  x2={cellCx}
                  y2={Y0}
                  stroke="#1a1a1a"
                  strokeWidth="0.6"
                  strokeDasharray="3 2"
                />
                <line
                  x1={cellCx - halfW}
                  y1={cellCy}
                  x2={X0}
                  y2={cellCy}
                  stroke="#1a1a1a"
                  strokeWidth="0.6"
                  strokeDasharray="3 2"
                />
              </>
            );
          })()}
          <text
            x={cellCx}
            y={cellCy - 1.2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="11"
            fill="#c1121f"
            fontWeight="600"
          >
            {String(s).padStart(2, "0")}
          </text>
        </>
      )}
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * #012 — Incense coil clock (盘香钟).
 *
 *   A coiled stick of incense, drawn as an Archimedean spiral
 *       r(θ) = a · θ          a = (R_outer - R_inner) / (turns · 2π)
 *   starting at the outer rim and spiralling inward for `TURNS` turns.
 *   Total spiral arc length L is fixed; the burn proceeds along the spiral
 *   at exactly L / 86400 per second so the whole stick burns down over a
 *   24-hour day. The burn position at the current wall-clock time of day
 *   is computed analytically (no animation state needed).
 *
 *   Reading time:
 *     - the burn moves along the spiral; you can estimate which "turn"
 *       it is on (≈ which hour of the day)
 *     - a small dotted radial line through the burn head shows the angle
 *       it sits at — the angle modulo one turn = how far into that hour
 *     - the current time HH:MM:SS is printed in the corner for precision
 */
export default function IncenseClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const round = (n: number) => Math.round(n * 1000) / 1000;

  // ───── spiral geometry ─────
  const R_OUTER = 86;
  const R_INNER = 8;
  const TURNS = 12;
  const THETA_MAX = TURNS * 2 * Math.PI;
  // r(θ) = R_OUTER − a·θ ; with a chosen so r(THETA_MAX) = R_INNER.
  const A = (R_OUTER - R_INNER) / THETA_MAX;
  // arc length s(θ) of an Archimedean spiral measured from θ=0:
  //   ds/dθ = √(r² + (dr/dθ)²)   with dr/dθ = -A
  // We'll compute s and its inverse numerically via a precomputed table.
  const STEPS = 720;
  const dTheta = THETA_MAX / STEPS;
  const sTable: number[] = [0];
  let acc = 0;
  for (let i = 1; i <= STEPS; i++) {
    const t1 = (i - 1) * dTheta;
    const t2 = i * dTheta;
    // approximate ds with midpoint rule
    const tm = (t1 + t2) / 2;
    const r = R_OUTER - A * tm;
    const dsdt = Math.sqrt(r * r + A * A);
    acc += dsdt * dTheta;
    sTable.push(acc);
  }
  const TOTAL_S = sTable[STEPS];
  /** Invert s(θ): given an arc length s, find θ. */
  const thetaAtS = (s: number) => {
    if (s <= 0) return 0;
    if (s >= TOTAL_S) return THETA_MAX;
    // binary search in sTable
    let lo = 0;
    let hi = STEPS;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sTable[mid] < s) lo = mid + 1;
      else hi = mid;
    }
    // linear interpolate between (lo-1, lo)
    const i0 = Math.max(0, lo - 1);
    const i1 = lo;
    const s0 = sTable[i0];
    const s1 = sTable[i1];
    const t0 = i0 * dTheta;
    const t1 = i1 * dTheta;
    const frac = s1 === s0 ? 0 : (s - s0) / (s1 - s0);
    return t0 + (t1 - t0) * frac;
  };

  // ───── time → burn position ─────
  const seconds = now
    ? now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    : 0;
  // burn distance from the OUTER end of the stick. Day starts (00:00:00)
  // with the burn just at the outer end (sBurn = 0), midnight returns to
  // 0 because the stick has fully burned (sBurn = TOTAL_S → reset).
  const burnFrac = seconds / 86400;
  const sBurn = burnFrac * TOTAL_S;
  const burnTheta = thetaAtS(sBurn);

  // Build the spiral polyline.
  const point = (theta: number) => {
    const r = R_OUTER - A * theta;
    // start the spiral at the top (12 o'clock) and wind clockwise:
    // SVG y grows downward, so cos→y, -sin→x maps θ=0 to (x=0, y=-R).
    const x = round(Math.sin(theta) * r);
    const y = round(-Math.cos(theta) * r);
    return { x, y };
  };

  // unburned segment of the spiral (from burnTheta to THETA_MAX)
  const unburned: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i * dTheta;
    if (t < burnTheta - 0.001) continue;
    const p = point(t);
    unburned.push(`${p.x},${p.y}`);
  }
  // burned (ash) segment: from 0 to burnTheta, lighter colour
  const burned: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i * dTheta;
    if (t > burnTheta + 0.001) break;
    const p = point(t);
    burned.push(`${p.x},${p.y}`);
  }

  const head = point(burnTheta);

  // tiny smoke trails above the burn head
  const smoke = Array.from({ length: 3 }).map((_, i) => {
    const dx = (i - 1) * 1.5;
    const dy = -4 - i * 3;
    return { x: head.x + dx, y: head.y + dy, r: 1.2 - i * 0.3 };
  });

  // Hour markers along the spiral: 24 small tick marks across the day,
  // labelled at 0 / 6 / 12 / 18. Each marker is computed by the same
  // arc-length → θ inversion as the burn head.
  const hourMarkers = Array.from({ length: 25 }).map((_, i) => {
    const sMark = (i / 24) * TOTAL_S;
    const theta = thetaAtS(sMark);
    const p = point(theta);
    // outward unit normal at this point on the spiral. Tangent direction:
    //   dx/dθ = sin·(-A) + cos·r   ;  dy/dθ = -cos·(-A) + sin·r
    // Normal = perpendicular to tangent, pointing outward.
    const r = R_OUTER - A * theta;
    const tx = Math.sin(theta) * -A + Math.cos(theta) * r;
    const ty = -Math.cos(theta) * -A + Math.sin(theta) * r;
    const tlen = Math.hypot(tx, ty);
    const nx = ty / tlen; // perpendicular (rotated -90°)
    const ny = -tx / tlen;
    // make sure normal points OUTWARD (away from origin)
    const sign = nx * p.x + ny * p.y > 0 ? 1 : -1;
    const nox = nx * sign;
    const noy = ny * sign;
    const isMajor = i % 6 === 0;
    return { i, p, nox, noy, isMajor };
  });

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Incense coil clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      {now && (
        <>
          {/* hour markers — short ticks pointing outward, with hour labels at 0/6/12/18 */}
          {hourMarkers.map((mark) => {
            const tickLen = mark.isMajor ? 5 : 2.5;
            const labelOffset = 9;
            const t1 = { x: round(mark.p.x), y: round(mark.p.y) };
            const t2 = {
              x: round(mark.p.x + mark.nox * tickLen),
              y: round(mark.p.y + mark.noy * tickLen),
            };
            const label = {
              x: round(mark.p.x + mark.nox * labelOffset),
              y: round(mark.p.y + mark.noy * labelOffset),
            };
            return (
              <g key={mark.i}>
                <line
                  x1={t1.x}
                  y1={t1.y}
                  x2={t2.x}
                  y2={t2.y}
                  stroke="#1a1a1a"
                  strokeWidth={mark.isMajor ? 1 : 0.5}
                  strokeLinecap="round"
                  opacity={mark.isMajor ? 0.8 : 0.45}
                />
                {mark.isMajor && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontSize="6.5"
                    fill="#1a1a1a"
                  >
                    {mark.i}
                  </text>
                )}
              </g>
            );
          })}

          {/* burned ash trail */}
          {burned.length > 1 && (
            <polyline
              points={burned.join(" ")}
              fill="none"
              stroke="#a0978a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
              strokeDasharray="1 2"
            />
          )}
          {/* unburned incense */}
          {unburned.length > 1 && (
            <polyline
              points={unburned.join(" ")}
              fill="none"
              stroke="#5a3a1a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* glowing ember at the burn head */}
          <circle cx={head.x} cy={head.y} r="3.5" fill="#c1121f" />
          <circle cx={head.x} cy={head.y} r="1.5" fill="#ffd166" />
          {/* smoke */}
          {smoke.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#1a1a1a" opacity={0.18 - i * 0.05} />
          ))}
        </>
      )}
    </svg>
  );
}

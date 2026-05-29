"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Shared rendering for #012 incense-coil variants.
 *
 *   Spiral geometry, burn position computation, and the ash / ember / smoke
 *   visuals are identical across variants. Each variant supplies its own
 *   readout overlay via `renderOverlay({ head, burnFrac, now })`.
 *
 *   - The stick burns from the OUTER end inward over one wall-clock day.
 *   - `burnFrac` ∈ [0, 1) is the fraction of the day elapsed.
 *   - `head` is the SVG point at the current burn position.
 */
export type BurnState = {
  now: Date;
  head: { x: number; y: number };
  burnFrac: number;
  /** Angle, in degrees, from the spiral start (0 = top, clockwise). */
  thetaDeg: number;
  /** 0..23 — which hour-of-day right now. */
  hour: number;
  /** 0..59 minutes within current hour. */
  minute: number;
  /** Layout constants so overlays can position themselves correctly. */
  R_OUTER: number;
};

const R_OUTER = 86;
const R_INNER = 8;
const TURNS = 12;
const THETA_MAX = TURNS * 2 * Math.PI;
const A = (R_OUTER - R_INNER) / THETA_MAX;

const STEPS = 720;
const dTheta = THETA_MAX / STEPS;
const sTable: number[] = [0];
{
  let acc = 0;
  for (let i = 1; i <= STEPS; i++) {
    const tm = (i - 0.5) * dTheta;
    const r = R_OUTER - A * tm;
    const dsdt = Math.sqrt(r * r + A * A);
    acc += dsdt * dTheta;
    sTable.push(acc);
  }
}
const TOTAL_S = sTable[STEPS];

const thetaAtS = (s: number) => {
  if (s <= 0) return 0;
  if (s >= TOTAL_S) return THETA_MAX;
  let lo = 0;
  let hi = STEPS;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sTable[mid] < s) lo = mid + 1;
    else hi = mid;
  }
  const i0 = Math.max(0, lo - 1);
  const s0 = sTable[i0];
  const s1 = sTable[lo];
  const t0 = i0 * dTheta;
  const t1 = lo * dTheta;
  const frac = s1 === s0 ? 0 : (s - s0) / (s1 - s0);
  return t0 + (t1 - t0) * frac;
};

const round = (n: number) => Math.round(n * 1000) / 1000;

const point = (theta: number) => {
  const r = R_OUTER - A * theta;
  return { x: round(Math.sin(theta) * r), y: round(-Math.cos(theta) * r) };
};

export default function IncenseBase({
  renderOverlay,
}: {
  renderOverlay?: (state: BurnState) => ReactNode;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = now
    ? now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    : 0;
  const burnFrac = seconds / 86400;
  const sBurn = burnFrac * TOTAL_S;
  const burnTheta = thetaAtS(sBurn);

  const unburned: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i * dTheta;
    if (t < burnTheta - 0.001) continue;
    const p = point(t);
    unburned.push(`${p.x},${p.y}`);
  }
  const burned: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i * dTheta;
    if (t > burnTheta + 0.001) break;
    const p = point(t);
    burned.push(`${p.x},${p.y}`);
  }
  const head = point(burnTheta);

  const smoke = Array.from({ length: 3 }).map((_, i) => {
    const dx = (i - 1) * 1.5;
    const dy = -4 - i * 3;
    return { x: head.x + dx, y: head.y + dy, r: 1.2 - i * 0.3 };
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
          {/* per-variant overlay sits BEHIND the ash/ember/smoke */}
          {renderOverlay?.({
            now,
            head,
            burnFrac,
            thetaDeg: (burnTheta * 180) / Math.PI,
            hour: now.getHours(),
            minute: now.getMinutes(),
            R_OUTER,
          })}

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
          <circle cx={head.x} cy={head.y} r="3.5" fill="#c1121f" />
          <circle cx={head.x} cy={head.y} r="1.5" fill="#ffd166" />
          {smoke.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#1a1a1a" opacity={0.18 - i * 0.05} />
          ))}
        </>
      )}
    </svg>
  );
}

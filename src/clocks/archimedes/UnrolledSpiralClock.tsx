"use client";

import { useEffect, useState } from "react";

/**
 * #006 — Unrolled-spiral clock
 *
 * ─── How this design is derived ───────────────────────────────────────────
 *
 * Step 1 (#006-draft, deleted): proportional-length hands.
 *   Each hand's length grows with its value:
 *     - second hand:  L_s(t) = L_max_s · (s/60),   t in [0..1) over 1 min
 *     - minute hand:  L_m(t) = L_max_m · (m/60),   t in [0..1) over 1 hour
 *     - hour   hand:  L_h(t) = L_max_h · (h/12),   t in [0..1) over 12 hrs
 *   Combined with the usual constant angular speed (2π per cycle), the tip
 *   of each hand traces the Archimedean spiral
 *       r(θ) = a · θ,        a = L_max / (2π)
 *
 * Step 2 (#007-draft, deleted): draw those three spirals statically on the
 *   face so the trace is visible.
 *
 * Step 3 (this one): "unroll" each spiral by its own arc length onto the
 *   dial circumference (one full turn). The hand still reaches its
 *   correct radius (so the tip lands on the unrolled curve), and tick
 *   marks / numerals are placed at the same arc-length-warped angles.
 *
 *   Effect: hands move at NON-UNIFORM angular speed (slow near 12, fast
 *   on the opposite side), because the Archimedean spiral covers very
 *   little arc length near the center and a lot near the rim.
 *
 * ─── Math ─────────────────────────────────────────────────────────────────
 *
 *   Arc length of r = a·θ from 0 to θ:
 *       s(θ) = ∫₀^θ √(r² + (dr/dθ)²) dθ
 *            = a · ∫₀^θ √(θ² + 1) dθ
 *            = (a/2) · [ θ·√(θ²+1) + ln(θ + √(θ²+1)) ]
 *
 *   Normalized arc-length progress for t ∈ [0, 1]:
 *       u(t) = s(2π·t) / s(2π)
 *
 *   Notice `a` cancels out of u(t) → the warp curve u is IDENTICAL for all
 *   three spirals, regardless of their max radii. Hence the same mapping
 *   t ↦ u(t)·360°  rewrites the angle for hours, minutes AND seconds.
 *
 *   u'(0) ≈ 0 (start slowly), u'(1) ≈ 6.36 (end ~6.36× faster). That
 *   ratio is √(1 + (2π)²) ≈ 6.36 — the spiral's speed factor at θ = 2π.
 */
export default function UnrolledSpiralClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const H = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // Discrete second-tick — no millisecond smoothing.
  const sFrac = s / 60;
  const mFrac = (m + sFrac) / 60;
  const hFrac = (H + mFrac) / 12;

  // ----- arc-length warp u(t) -----
  const TWO_PI = 2 * Math.PI;
  // F(θ) = θ·√(θ²+1) + ln(θ + √(θ²+1))   — i.e. 2·s(θ)/a; the /2 and the
  // factor `a` both cancel out in u(t) so we don't bother including them.
  const F = (theta: number) =>
    theta * Math.sqrt(theta * theta + 1) +
    Math.log(theta + Math.sqrt(theta * theta + 1));
  const F_FULL = F(TWO_PI);
  /** Arc-length fraction u(t) ∈ [0,1]. Same curve for all three hands. */
  const u = (t: number) => F(TWO_PI * t) / F_FULL;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  /** Map a hand's progress t ∈ [0,1) to dial angle in degrees. */
  const angleDeg = (t: number) => round(u(t) * 360);

  // Hand reach (same lengths as #001 so the dial reads at a glance).
  const R_HOUR = 50;
  const R_MIN = 74;
  const R_SEC = 84;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Unrolled-spiral clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />

      {/* 60 minute/second tick marks, placed at warped angles t = i/60. */}
      {Array.from({ length: 60 }).map((_, i) => {
        const isHour = i % 5 === 0;
        return (
          <line
            key={i}
            x1="0"
            y1={-92}
            x2="0"
            y2={isHour ? -82 : -88}
            stroke="#1a1a1a"
            strokeWidth={isHour ? 2.5 : 1}
            strokeLinecap="round"
            transform={`rotate(${angleDeg(i / 60)})`}
          />
        );
      })}

      {/* 12 hour numerals, placed at warped angles t = i/12. */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 12 : i;
        const deg = angleDeg(i / 12);
        const rad = (deg - 90) * (Math.PI / 180);
        const r = 70;
        const x = round(Math.cos(rad) * r);
        const y = round(Math.sin(rad) * r);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="14"
            fill="#1a1a1a"
          >
            {num}
          </text>
        );
      })}

      {now && (
        <>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={-R_HOUR}
            stroke="#1a1a1a"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${angleDeg(hFrac)})`}
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={-R_MIN}
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angleDeg(mFrac)})`}
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={-R_SEC}
            stroke="#c1121f"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${angleDeg(sFrac)})`}
          />
          <circle cx="0" cy="0" r="1.5" fill="#c1121f" />
        </>
      )}

      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </svg>
  );
}

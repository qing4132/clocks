"use client";

import { useId } from "react";
import { useWallClock } from "../useWallClock";

/**
 * #018 — Century clock.
 *
 *   A faithful #001 round clock — the hour, minute and second hands are read
 *   exactly as usual. The one change: the rim is no longer just a border. It
 *   is a progress bar for the whole century.
 *
 *   The arc fills clockwise from 12 o'clock in proportion to how much of this
 *   century (2000-01-01 → 2100-01-01) has elapsed, rendered as a band of fine
 *   gold dust with sparkling glints — like Skypiea's golden bell. In a human
 *   lifetime the gold barely creeps forward, yet it is quietly gilding a
 *   hundred years. The busy little hands rush around inside a frame that moves
 *   on a scale longer than any single life.
 */

// Warm, bright gold — palette for the dust, the stroke gradient and the halo.
const GOLD_TONES = ["#ffd84d", "#ffe98a", "#f7cf57", "#ffe066", "#f5c842", "#ffdf6b"];
const GOLD_GRAD: [string, string, string] = ["#d9a521", "#ffd84d", "#d9a521"];
const GOLD_GLOW = "#ffd24a";

// ── Gold-dust specks ──────────────────────────────────────────────────────
// Many tiny grains scattered along the rim band, plus a few twinkling glints.
// Generated once, deterministically (seeded), so SSR and client match.
const GOLD_R = 96;
const round2 = (n: number) => Math.round(n * 100) / 100;
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Speck = {
  x: number;
  y: number;
  r: number;
  t: number; // tone index into the gold palette (0..5)
};
type Glint = {
  x: number;
  y: number;
  r: number;
  fill: string;
  dur: number;
  begin: number;
};
// The dense sand bed is STATIC (rendered once, no per-frame cost).
const GOLD_DUST: Speck[] = (() => {
  const rand = mulberry32(20262026);
  const specks: Speck[] = [];
  const N = 1100;
  for (let i = 0; i < N; i++) {
    const ang = rand() * Math.PI * 2;
    const rr = GOLD_R - 1.6 + rand() * 3.2; // band across the rim
    const x = round2(Math.cos(ang) * rr);
    const y = round2(Math.sin(ang) * rr);
    const r = round2(0.1 + rand() * 0.24); // ultra-fine grains
    const t = Math.floor(rand() * 6);
    specks.push({ x, y, r, t });
  }
  return specks;
})();

// A scatter of bright glints that twinkle on and off — the "闪闪亮" pop.
const GOLD_GLINTS: Glint[] = (() => {
  const rand = mulberry32(99887766);
  const glints: Glint[] = [];
  const glintTones = ["#ffffff", "#fffaf0", "#fff6c8", "#ffefae"];
  const G = 80;
  for (let i = 0; i < G; i++) {
    const ang = rand() * Math.PI * 2;
    const rr = GOLD_R - 1.4 + rand() * 2.8;
    const x = round2(Math.cos(ang) * rr);
    const y = round2(Math.sin(ang) * rr);
    const r = round2(0.3 + rand() * 0.4);
    const fill = glintTones[Math.floor(rand() * glintTones.length)];
    const dur = round2(1.4 + rand() * 2.6); // quick sparkle
    const begin = round2(-rand() * dur);
    glints.push({ x, y, r, fill, dur, begin });
  }
  return glints;
})();


export default function CenturyClock() {
  const now = useWallClock(1000);

  // Unique per instance — otherwise multiple clocks on one page (the gallery)
  // collide on these SVG ids and all reference the FIRST defs found, so they'd
  // all render with the first clock's gold. useId keeps them apart.
  const uid = useId().replace(/[:]/g, "");
  const strokeId = `century-gold-stroke-${uid}`;
  const glowId = `century-gold-glow-${uid}`;
  const maskId = `century-elapsed-mask-${uid}`;

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  // Fraction of this century elapsed: from the first instant of 2000 up to
  // (but not including) the first instant of 2100 — i.e. through the last
  // moment of 2099. Local time, so the boundary matches the wall clock.
  const CENTURY_START = new Date(2000, 0, 1, 0, 0, 0, 0).getTime();
  const CENTURY_END = new Date(2100, 0, 1, 0, 0, 0, 0).getTime();
  const centuryFrac = now
    ? Math.min(1, Math.max(0, (now.getTime() - CENTURY_START) / (CENTURY_END - CENTURY_START)))
    : 0;

  const R = 96;
  const CIRC = (Math.round(2 * Math.PI * R * 1000) / 1000); // circumference
  const dashOn = Math.round(centuryFrac * CIRC * 1000) / 1000;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Century clock — the rim is a progress bar for the century"
    >
      <defs>
        {/* bright, warm gold — kept luminous all the way across (no dull middle) */}
        <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GOLD_GRAD[0]} />
          <stop offset="50%" stopColor={GOLD_GRAD[1]} />
          <stop offset="100%" stopColor={GOLD_GRAD[2]} />
        </linearGradient>
        {/* warm halo so the gold reads as glowing metal, not flat paint */}
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.4" floodColor={GOLD_GLOW} floodOpacity="0.95" />
        </filter>
        {/* mask = the elapsed arc itself, so the dust only rides the gold */}
        <mask id={maskId}>
          <rect x="-100" y="-100" width="200" height="200" fill="black" />
          <circle
            cx="0"
            cy="0"
            r={R}
            fill="none"
            stroke="white"
            strokeWidth="4.4"
            strokeDasharray={`${dashOn} ${CIRC}`}
            strokeLinecap="butt"
            transform="rotate(-90)"
          />
        </mask>
      </defs>

      {/* face */}
      <circle cx="0" cy="0" r={R} fill="#fafaf7" />

      {/* rim — faint track for the un-elapsed remainder of the century */}
      <circle cx="0" cy="0" r={R} fill="none" stroke="#e2e2dd" strokeWidth="3" />

      {/* rim — golden arc showing the century's elapsed progress, from 12 o'clock */}
      {now && (
        <circle
          cx="0"
          cy="0"
          r={R}
          fill="none"
          stroke={`url(#${strokeId})`}
          strokeWidth="3"
          strokeDasharray={`${dashOn} ${CIRC}`}
          strokeLinecap="butt"
          transform="rotate(-90)"
          filter={`url(#${glowId})`}
        />
      )}

      {/* a static bed of fine gold dust + glints twinkling in place, shown only
          over the elapsed arc via the century mask */}
      {now && (
        <g mask={`url(#${maskId})`}>
          {/* dense sand bed: static, rendered once, no ongoing animation cost */}
          {GOLD_DUST.map((g, i) => (
            <circle key={i} cx={g.x} cy={g.y} r={g.r} fill={GOLD_TONES[g.t]} />
          ))}
          {/* glints twinkle in place → the "闪闪亮" sparkle */}
          {GOLD_GLINTS.map((g, i) => (
            <circle key={i} cx={g.x} cy={g.y} r={g.r} fill={g.fill} opacity="0">
              <animate
                attributeName="opacity"
                values="0;0;1;0.2;0"
                keyTimes="0;0.42;0.5;0.62;1"
                dur={`${g.dur}s`}
                begin={`${g.begin}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      )}

      {/* minute ticks */}
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
            transform={`rotate(${i * 6})`}
          />
        );
      })}

      {/* hour numerals */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = ((i * 30) - 90) * (Math.PI / 180);
        const r = 70;
        const x = Math.round(Math.cos(angle) * r * 1000) / 1000;
        const y = Math.round(Math.sin(angle) * r * 1000) / 1000;
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

      {/* hands — only render after mount, so we never paint a "wrong" 12:00 first */}
      {now && (
        <>
          <line
            x1="0"
            y1="10"
            x2="0"
            y2="-50"
            stroke="#1a1a1a"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${hourAngle})`}
          />
          <line
            x1="0"
            y1="14"
            x2="0"
            y2="-74"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle})`}
          />
          <line
            x1="0"
            y1="20"
            x2="0"
            y2="-84"
            stroke="#c1121f"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${secondAngle})`}
          />
          <circle cx="0" cy="0" r="1.5" fill="#c1121f" />
        </>
      )}

      {/* center cap (always visible so the dial doesn't look hollow) */}
      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </svg>
  );
}


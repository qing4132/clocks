"use client";

import { useEffect, useState } from "react";
import { useWallClock } from "../useWallClock";

/**
 * #024 — Century clock (sand variant — a cheaper re-implementation of #018).
 *
 *   Same definition as #018: the rim is a progress bar for the whole century
 *   (2000-01-01 → 2100-01-01); the gold arc fills clockwise from 12 o'clock in
 *   proportion to how much of the century has elapsed.
 *
 *   The difference is purely in HOW the gold is drawn. #018 paints ~1186 live
 *   <circle> specks (+ a mask) — heavy for the gallery. Here the gold-dust ring
 *   is baked ONCE onto a <canvas> as a single PNG, then shown as one <image>
 *   that rotates slowly (flowing gold sand). An opaque arc occludes the
 *   un-elapsed remainder so only the elapsed fraction shows gold. Net cost:
 *   one composited raster layer + one arc, instead of ~1200 nodes.
 */

const R = 96;
const CIRC = Math.round(2 * Math.PI * R * 1000) / 1000;
const BAND = 3; // shared rim-band width — matches #001's black ring (r96, w3)
const TRACK = "#e2e2dd"; // faint remainder track / occluder colour

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Bake the gold-dust ring to a PNG data URL once, on the client.
function useGoldRing(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const S = 1000; // internal resolution (≈5× display) for crispness
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const K = S / 200; // viewBox unit → px
    const C = S / 2;

    // The rim band has ONE shared width so the gold arc and the grey occluder
    // are exactly the same thickness & radius — no step at their junction.
    const HALF = BAND / 2; // half-width of the band, in viewBox units
    // Gold is baked at EXACTLY the band width (R ± HALF), identical to the grey
    // track and occluder (strokeWidth = BAND, r = R). Same radius, same width →
    // neither out-widths the other; their anti-alias fringes coincide.
    const GHALF = HALF;

    // Clip everything to the ring R±GHALF, so the gold band has crisp knife-cut
    // edges and the sand grains can't nibble the edge into a see-through fringe.
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, (R + GHALF) * K, 0, Math.PI * 2);
    ctx.arc(C, C, (R - GHALF) * K, 0, Math.PI * 2, true); // even-odd hole
    ctx.clip("evenodd");

    // 1) fully-opaque, EVEN solid gold fill across the whole band → uniform
    //    brightness (no darker inner edge), as solid as the grey track
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f3c33a";
    ctx.fillRect(0, 0, S, S);

    // 2) dense fine sand grains as TEXTURE on top of the solid fill (they vary
    //    the tone but no longer define the band's edges)
    const tones = ["#ffe98a", "#f7cf57", "#ffe066", "#f5c842", "#ffdf6b", "#e9bb39"];
    const rand = mulberry32(20262026);
    for (let i = 0; i < 3200; i++) {
      const ang = rand() * Math.PI * 2;
      const rr = R - GHALF + rand() * (2 * GHALF);
      const x = C + Math.cos(ang) * rr * K;
      const y = C + Math.sin(ang) * rr * K;
      const rad = (0.14 + rand() * 0.34) * K; // finer grains
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3) a scatter of brighter static glints (the "亮点") — small & sparse
    const glints = ["#ffffff", "#fffaf0", "#fff6c8", "#ffefae"];
    const grand = mulberry32(99887766);
    for (let i = 0; i < 95; i++) {
      const ang = grand() * Math.PI * 2;
      const rr = R - GHALF + 0.2 + grand() * (2 * GHALF - 0.4);
      const x = C + Math.cos(ang) * rr * K;
      const y = C + Math.sin(ang) * rr * K;
      const rad = (0.16 + grand() * 0.28) * K; // smaller on average
      ctx.globalAlpha = 1;
      ctx.fillStyle = glints[Math.floor(grand() * glints.length)];
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    setUrl(c.toDataURL("image/png"));
  }, []);
  return url;
}

export default function CenturySandClock() {
  const now = useWallClock(1000);
  const goldUrl = useGoldRing();

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  const CENTURY_START = new Date(2000, 0, 1, 0, 0, 0, 0).getTime();
  const CENTURY_END = new Date(2100, 0, 1, 0, 0, 0, 0).getTime();
  const frac = now
    ? Math.min(1, Math.max(0, (now.getTime() - CENTURY_START) / (CENTURY_END - CENTURY_START)))
    : 0;
  const dashOn = Math.round(frac * CIRC * 1000) / 1000;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Century clock — flowing gold sand on the rim marks the century's progress"
    >
      {/* face */}
      <circle cx="0" cy="0" r={R} fill="#fafaf7" />

      {/* faint full track (the century's un-elapsed remainder) — same width &
          radius as the gold band, so the two read as one continuous rim */}
      <circle cx="0" cy="0" r={R} fill="none" stroke={TRACK} strokeWidth={BAND} />

      {/* rotating gold-sand ring (one baked raster layer) */}
      {now && goldUrl && (
        <g>
          <image href={goldUrl} x="-100" y="-100" width="200" height="200" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="480s"
            repeatCount="indefinite"
          />
        </g>
      )}

      {/* opaque arc occluding the un-elapsed remainder, leaving gold only on
          the elapsed fraction — same look & definition as #018. The 3-value
          dash (0 / elapsed gap / remainder) takes exactly the complement of
          the gold arc, starting clockwise from 12 o'clock. */}
      {now && (
        <circle
          cx="0"
          cy="0"
          r={R}
          fill="none"
          stroke={TRACK}
          strokeWidth={BAND}
          strokeDasharray={`0 ${dashOn} ${Math.round((CIRC - dashOn) * 1000) / 1000}`}
          strokeLinecap="butt"
          transform="rotate(-90)"
        />
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

      {/* hands */}
      {now && (
        <>
          <line x1="0" y1="10" x2="0" y2="-50" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourAngle})`} />
          <line x1="0" y1="14" x2="0" y2="-74" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
          <line x1="0" y1="20" x2="0" y2="-84" stroke="#c1121f" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${secondAngle})`} />
          <circle cx="0" cy="0" r="1.5" fill="#c1121f" />
        </>
      )}

      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </svg>
  );
}

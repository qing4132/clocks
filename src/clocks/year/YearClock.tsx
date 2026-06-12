"use client";

import { useEffect, useState } from "react";
import { useWallClock } from "../useWallClock";

const R = 96;
const CIRC = Math.round(2 * Math.PI * R * 1000) / 1000;
const BAND = 3;
const TRACK = "#dbe5ee";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useBlueRing(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const S = 1000;
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const K = S / 200;
    const C = S / 2;
    const HALF = BAND / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, (R + HALF) * K, 0, Math.PI * 2);
    ctx.arc(C, C, (R - HALF) * K, 0, Math.PI * 2, true);
    ctx.clip("evenodd");

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#2f80d8";
    ctx.fillRect(0, 0, S, S);

    const tones = ["#78c7ff", "#49a8f2", "#2f80d8", "#1f6fbd", "#8bd8ff", "#3b95df"];
    const rand = mulberry32(20262027);
    for (let i = 0; i < 3200; i++) {
      const ang = rand() * Math.PI * 2;
      const rr = R - HALF + rand() * (2 * HALF);
      const x = C + Math.cos(ang) * rr * K;
      const y = C + Math.sin(ang) * rr * K;
      const rad = (0.14 + rand() * 0.34) * K;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const glints = ["#ffffff", "#e8f7ff", "#bce9ff", "#d8f2ff"];
    const grand = mulberry32(77889922);
    for (let i = 0; i < 95; i++) {
      const ang = grand() * Math.PI * 2;
      const rr = R - HALF + 0.2 + grand() * (2 * HALF - 0.4);
      const x = C + Math.cos(ang) * rr * K;
      const y = C + Math.sin(ang) * rr * K;
      const rad = (0.16 + grand() * 0.28) * K;
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

export default function YearClock() {
  const now = useWallClock(1000);
  const blueUrl = useBlueRing();

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  const YEAR_START = now ? new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0).getTime() : 0;
  const YEAR_END = now ? new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0).getTime() : 1;
  const frac = now ? Math.min(1, Math.max(0, (now.getTime() - YEAR_START) / (YEAR_END - YEAR_START))) : 0;
  const dashOn = Math.round(frac * CIRC * 1000) / 1000;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Year clock — flowing blue sand on the rim marks the current year's progress"
    >
      <circle cx="0" cy="0" r={R} fill="#fafaf7" />
      <circle cx="0" cy="0" r={R} fill="none" stroke={TRACK} strokeWidth={BAND} />

      {now && blueUrl && (
        <g>
          <image href={blueUrl} x="-100" y="-100" width="200" height="200" />
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="480s" repeatCount="indefinite" />
        </g>
      )}

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

      {now && (
        <>
          <line x1="0" y1="10" x2="0" y2="-50" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourAngle})`} />
          <line x1="0" y1="14" x2="0" y2="-74" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
          <line x1="0" y1="20" x2="0" y2="-84" stroke="#c1121f" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${secondAngle})`} />
          <circle cx="0" cy="0" r="1.5" fill="#c1121f" />
        </>
      )}
    </svg>
  );
}
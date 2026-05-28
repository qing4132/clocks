"use client";

import { useEffect, useState } from "react";
import Base from "./Base";

const L = 96;
const round = (n: number) => Math.round(n * 1000) / 1000;

function useTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const H = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  return { now, hour: H + m / 60, minute: m + s / 60, second: s };
}

// ───────────────────────── A — symmetric centered ticks ─────────────────────
export function ExpandingRingsA() {
  const t = useTime();
  return (
    <Base
      {...t}
      L={L}
      ruler={
        <>
          {Array.from({ length: 13 }).map((_, i) => {
            if (i === 0) return null;
            const y = round((-i / 12) * L);
            const isMajor = i === 3 || i === 6 || i === 9 || i === 12;
            const w = isMajor ? 5 : 3;
            return (
              <g key={i}>
                <line
                  x1={-w}
                  y1={y}
                  x2={w}
                  y2={y}
                  stroke="#1a1a1a"
                  strokeWidth={isMajor ? 2.2 : 1}
                  strokeLinecap="round"
                />
                {isMajor && (
                  <text
                    x={12}
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
        </>
      }
    />
  );
}

// ───────────────────────── B — just dots, no spine ─────────────────────────
export function ExpandingRingsB() {
  const t = useTime();
  return (
    <Base
      {...t}
      L={L}
      ruler={
        <>
          {Array.from({ length: 13 }).map((_, i) => {
            if (i === 0) return null;
            const y = round((-i / 12) * L);
            const isMajor = i === 3 || i === 6 || i === 9 || i === 12;
            return (
              <g key={i}>
                <circle
                  cx="0"
                  cy={y}
                  r={isMajor ? 2 : 1}
                  fill="#1a1a1a"
                />
                {isMajor && (
                  <text
                    x={8}
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
        </>
      }
    />
  );
}

// ───────────────────────── C — wedge / triangle ticks ──────────────────────
export function ExpandingRingsC() {
  const t = useTime();
  return (
    <Base
      {...t}
      L={L}
      ruler={
        <>
          <line x1="0" y1="0" x2="0" y2={-L} stroke="#1a1a1a" strokeWidth="0.6" />
          {Array.from({ length: 13 }).map((_, i) => {
            if (i === 0) return null;
            const y = round((-i / 12) * L);
            const isMajor = i === 3 || i === 6 || i === 9 || i === 12;
            const h = isMajor ? 6 : 3.5;
            const w = isMajor ? 3 : 1.6;
            return (
              <g key={i}>
                <polygon
                  points={`0,${y} ${-w},${y - h} ${w},${y - h}`}
                  fill="#1a1a1a"
                />
                {isMajor && (
                  <text
                    x={12}
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
        </>
      }
    />
  );
}

// ───────────────────────── D — engraved ruler look ────────────────────────
export function ExpandingRingsD() {
  const t = useTime();
  return (
    <Base
      {...t}
      L={L}
      ruler={
        <>
          {/* a thin pair of parallel lines as the spine, like a thermometer */}
          <line x1={-2} y1="0" x2={-2} y2={-L} stroke="#1a1a1a" strokeWidth="0.6" />
          <line x1={2} y1="0" x2={2} y2={-L} stroke="#1a1a1a" strokeWidth="0.6" />
          {Array.from({ length: 13 }).map((_, i) => {
            if (i === 0) return null;
            const y = round((-i / 12) * L);
            const isMajor = i === 3 || i === 6 || i === 9 || i === 12;
            return (
              <g key={i}>
                <line
                  x1={-2}
                  y1={y}
                  x2={2}
                  y2={y}
                  stroke="#1a1a1a"
                  strokeWidth={isMajor ? 1.6 : 0.6}
                />
                {isMajor && (
                  <text
                    x={8}
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
        </>
      }
    />
  );
}

// ───────────────────────── E — minimal, only major ticks ──────────────────
export function ExpandingRingsE() {
  const t = useTime();
  return (
    <Base
      {...t}
      L={L}
      ruler={
        <>
          <line x1="0" y1="0" x2="0" y2={-L} stroke="#1a1a1a" strokeWidth="0.8" />
          {[3, 6, 9, 12].map((i) => {
            const y = round((-i / 12) * L);
            return (
              <g key={i}>
                <line
                  x1={-7}
                  y1={y}
                  x2={7}
                  y2={y}
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <text
                  x={14}
                  y={y}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontSize="12"
                  fill="#1a1a1a"
                >
                  {i}
                </text>
              </g>
            );
          })}
        </>
      }
    />
  );
}

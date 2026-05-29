"use client";

import { useWallClock } from "../useWallClock";

/**
 * Rotating dials clock (classic-styled):
 *   - Cream face, black ink, red accent — matches the classic round clock.
 *   - One fixed red pointer at the RIGHT (3 o'clock) — horizontal layout
 *     makes the current numeral easier to read than a vertical pointer.
 *   - Three concentric dials rotate so the current value passes under the
 *     pointer.
 *   - Layer order from outside in: SECONDS, MINUTES, HOURS.
 */
export default function RotatingDialsClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // All dials rotate counter-clockwise so the current value reaches the
  // fixed pointer at top. Numerals stay in normal (clockwise) order.
  const secondsRotation = -(s * 6);
  const minutesRotation = -(m * 6 + s * 0.1);
  const hoursRotation = -(h * 30 + m * 0.5);

  // Outer -> inner: seconds, minutes, hours.
  const R_SEC = 88;
  const R_MIN = 60;
  const R_HOUR = 32;

  const INK = "#1a1a1a";
  const FAINT = "#1a1a1a55";
  const RED = "#c1121f";
  const FACE = "#fafaf7";

  const round = (n: number) => Math.round(n * 1000) / 1000;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Rotating dials clock"
    >
      <circle cx="0" cy="0" r="96" fill={FACE} stroke={INK} strokeWidth="3" />

      {/* ===== SECOND DIAL (outer) ===== */}
      {now && (
      <>
      <g transform={`rotate(${secondsRotation})`}>
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i * 6) * (Math.PI / 180);
          const inner = R_SEC - (i % 5 === 0 ? 6 : 3);
          return (
            <line
              key={i}
              x1={round(Math.cos(a) * R_SEC)}
              y1={round(Math.sin(a) * R_SEC)}
              x2={round(Math.cos(a) * inner)}
              y2={round(Math.sin(a) * inner)}
              stroke={INK}
              strokeWidth={i % 5 === 0 ? 2 : 0.8}
              strokeLinecap="round"
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const val = i * 5;
          const a = (val * 6) * (Math.PI / 180);
          const r = R_SEC - 13;
          const x = round(Math.cos(a) * r);
          const y = round(Math.sin(a) * r);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${-secondsRotation})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="7"
                fill={INK}
              >
                {val.toString().padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </g>

      <circle cx="0" cy="0" r={R_SEC - 22} fill="none" stroke={FAINT} strokeWidth="0.5" />

      {/* ===== MINUTE DIAL (middle) ===== */}
      <g transform={`rotate(${minutesRotation})`}>
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i * 6) * (Math.PI / 180);
          const inner = R_MIN - (i % 5 === 0 ? 5 : 2.5);
          return (
            <line
              key={i}
              x1={round(Math.cos(a) * R_MIN)}
              y1={round(Math.sin(a) * R_MIN)}
              x2={round(Math.cos(a) * inner)}
              y2={round(Math.sin(a) * inner)}
              stroke={INK}
              strokeWidth={i % 5 === 0 ? 1.6 : 0.6}
              strokeLinecap="round"
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const val = i * 5;
          const a = (val * 6) * (Math.PI / 180);
          const r = R_MIN - 11;
          const x = round(Math.cos(a) * r);
          const y = round(Math.sin(a) * r);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${-minutesRotation})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="7"
                fill={INK}
              >
                {val.toString().padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </g>

      <circle cx="0" cy="0" r={R_MIN - 18} fill="none" stroke={FAINT} strokeWidth="0.5" />

      {/* ===== HOUR DIAL (inner) ===== */}
      <g transform={`rotate(${hoursRotation})`}>
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i === 0 ? 12 : i;
          const a = (i * 30) * (Math.PI / 180);
          const x = round(Math.cos(a) * R_HOUR);
          const y = round(Math.sin(a) * R_HOUR);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${-hoursRotation})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="10"
                fill={INK}
              >
                {num}
              </text>
            </g>
          );
        })}
      </g>
      </>
      )}

      {/* ===== Fixed pointer at right — same look as #001's second hand:
          straight red line from a tail behind the hub out to the rim. ===== */}
      <line
        x1="-20"
        y1="0"
        x2="84"
        y2="0"
        stroke={RED}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="0" cy="0" r="4" fill={INK} />
    </svg>
  );
}

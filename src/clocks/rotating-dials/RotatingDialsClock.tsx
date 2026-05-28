"use client";

import { useEffect, useState } from "react";

/**
 * Rotating dials clock:
 *   - One fixed pointer at the top (12 o'clock position).
 *   - Three concentric dials (hours / minutes / seconds) rotate so that the
 *     current value passes under the pointer.
 */
export default function RotatingDialsClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // Each dial rotates so the current value lines up under the top pointer.
  // Smooth motion: minutes drift with seconds, hours drift with minutes.
  const secondsRotation = -(s * 6);
  const minutesRotation = -(m * 6 + s * 0.1);
  const hoursRotation = -(h * 30 + m * 0.5);

  // Radii for the three dials.
  const R_HOUR = 90;
  const R_MIN = 64;
  const R_SEC = 38;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Rotating dials clock"
    >
      {/* background */}
      <circle cx="0" cy="0" r="98" fill="#0f172a" />

      {/* ===== HOUR DIAL (outer) ===== */}
      <g transform={`rotate(${hoursRotation})`}>
        <circle
          cx="0"
          cy="0"
          r={R_HOUR}
          fill="none"
          stroke="#1e293b"
          strokeWidth="1"
        />
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i === 0 ? 12 : i;
          // value i sits at angle (i * 30) - 90 (i.e. 12 on top when rotation=0)
          const a = ((i * 30) - 90) * (Math.PI / 180);
          const x = Math.round(Math.cos(a) * R_HOUR * 1000) / 1000;
          const y = Math.round(Math.sin(a) * R_HOUR * 1000) / 1000;
          // counter-rotate the text so numerals stay upright
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${-hoursRotation})`}
            >
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="11"
                fill="#e2e8f0"
              >
                {num}
              </text>
            </g>
          );
        })}
      </g>

      {/* ===== MINUTE DIAL (middle) ===== */}
      <g transform={`rotate(${minutesRotation})`}>
        <circle
          cx="0"
          cy="0"
          r={R_MIN}
          fill="none"
          stroke="#1e293b"
          strokeWidth="1"
        />
        {Array.from({ length: 60 }).map((_, i) => {
          const a = ((i * 6) - 90) * (Math.PI / 180);
          const x1 = Math.round(Math.cos(a) * R_MIN * 1000) / 1000;
          const y1 = Math.round(Math.sin(a) * R_MIN * 1000) / 1000;
          const inner = R_MIN - (i % 5 === 0 ? 5 : 2.5);
          const x2 = Math.round(Math.cos(a) * inner * 1000) / 1000;
          const y2 = Math.round(Math.sin(a) * inner * 1000) / 1000;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94a3b8"
              strokeWidth={i % 5 === 0 ? 1.2 : 0.6}
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const val = i * 5;
          const a = ((val * 6) - 90) * (Math.PI / 180);
          const r = R_MIN - 11;
          const x = Math.round(Math.cos(a) * r * 1000) / 1000;
          const y = Math.round(Math.sin(a) * r * 1000) / 1000;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${-minutesRotation})`}
            >
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize="6"
                fill="#94a3b8"
              >
                {val.toString().padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </g>

      {/* ===== SECOND DIAL (inner) ===== */}
      <g transform={`rotate(${secondsRotation})`}>
        <circle
          cx="0"
          cy="0"
          r={R_SEC}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="0.5"
        />
        {Array.from({ length: 60 }).map((_, i) => {
          const a = ((i * 6) - 90) * (Math.PI / 180);
          const x1 = Math.round(Math.cos(a) * R_SEC * 1000) / 1000;
          const y1 = Math.round(Math.sin(a) * R_SEC * 1000) / 1000;
          const inner = R_SEC - (i % 5 === 0 ? 4 : 2);
          const x2 = Math.round(Math.cos(a) * inner * 1000) / 1000;
          const y2 = Math.round(Math.sin(a) * inner * 1000) / 1000;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#64748b"
              strokeWidth={i % 5 === 0 ? 1 : 0.5}
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const val = i * 5;
          const a = ((val * 6) - 90) * (Math.PI / 180);
          const r = R_SEC - 9;
          const x = Math.round(Math.cos(a) * r * 1000) / 1000;
          const y = Math.round(Math.sin(a) * r * 1000) / 1000;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${-secondsRotation})`}
            >
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize="5"
                fill="#cbd5e1"
              >
                {val.toString().padStart(2, "0")}
              </text>
            </g>
          );
        })}
        <circle cx="0" cy="0" r="2" fill="#f97316" />
      </g>

      {/* ===== Fixed pointer at top ===== */}
      <polygon points="0,-98 -5,-86 5,-86" fill="#f97316" />
      <line x1="0" y1="-86" x2="0" y2="-80" stroke="#f97316" strokeWidth="1.5" />
    </svg>
  );
}

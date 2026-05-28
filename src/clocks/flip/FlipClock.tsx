"use client";

import { useEffect, useState } from "react";

/**
 * #007 — Flip clock.
 *
 *   The classic round clock, but the whole face spins around the vertical
 *   axis (CSS rotateY). One full revolution per minute, locked to the
 *   second hand:
 *     - s = 0   → rotateY 0°   (front)
 *     - s = 15  → rotateY 90°  (edge-on)
 *     - s = 30  → rotateY 180° (back: mirrored)
 *     - s = 45  → rotateY 270° (edge-on)
 *     - s = 60  → rotateY 360° (front again)
 *
 *   The hands themselves still keep correct time. Reading the back side
 *   requires you to mentally mirror it (or just wait a few seconds).
 */
export default function FlipClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;
  const flipY = s * 6; // 360° per 60s

  const round = (n: number) => Math.round(n * 1000) / 1000;

  return (
    <div
      className="w-72 h-72 sm:w-96 sm:h-96"
      style={{ perspective: "1000px" }}
    >
      <div
        className="w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${flipY}deg)`,
        }}
      >
        <svg
          viewBox="-100 -100 200 200"
          className="w-full h-full drop-shadow-xl"
          role="img"
          aria-label="Flip clock"
        >
          <circle
            cx="0"
            cy="0"
            r="96"
            fill="#fafaf7"
            stroke="#1a1a1a"
            strokeWidth="3"
          />

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
            const x = round(Math.cos(angle) * r);
            const y = round(Math.sin(angle) * r);
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

          <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
        </svg>
      </div>
    </div>
  );
}

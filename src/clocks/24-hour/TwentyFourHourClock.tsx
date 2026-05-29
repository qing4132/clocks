"use client";

import { useEffect, useState } from "react";

/**
 * 24-hour clock — the classic round clock with every numeral doubled
 * (2, 4, 6, ..., 24). The hour hand makes a single full rotation per day.
 * Minute and second hands behave normally.
 */
export default function TwentyFourHourClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const H = now ? now.getHours() : 0; // 0..23
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // 12 positions, each 30°, but the dial values are 2H. So one real hour = 15°.
  const hourAngle = H * 15 + m * 0.25;
  const minuteAngle = m * 6 + s * 0.1;
  const secondAngle = s * 6;

  const round = (n: number) => Math.round(n * 1000) / 1000;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="24-hour analog clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />

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

      {/* hour numerals — doubled: 2, 4, 6, ..., 24 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 24 : i * 2;
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
  );
}

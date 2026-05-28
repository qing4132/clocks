"use client";

import { useEffect, useState } from "react";

/**
 * 24-hour clock:
 *   - The dial is divided into 24 hours instead of 12.
 *   - 0 (midnight) sits at the top, 12 (noon) at the bottom, 6 to the right, 18 to the left.
 *   - The hour hand makes a single full rotation per day.
 *   - Minute and second hands behave normally.
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

  // 360 / 24 = 15 deg per hour.
  const hourAngle = H * 15 + m * 0.25 + s * (0.25 / 60);
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

      {/* day/night arc — subtle top half lighter, bottom half a touch darker */}
      <path
        d="M -96 0 A 96 96 0 0 1 96 0 L 96 0 Z"
        fill="#fafaf7"
      />
      <path
        d="M -96 0 A 96 96 0 0 0 96 0 L 96 0 Z"
        fill="#1a1a1a"
        opacity="0.04"
      />

      {/* minute ticks: 60 around the rim */}
      {Array.from({ length: 60 }).map((_, i) => {
        const isHour = i % 5 === 0;
        return (
          <line
            key={i}
            x1="0"
            y1={-92}
            x2="0"
            y2={isHour ? -84 : -88}
            stroke="#1a1a1a"
            strokeWidth={isHour ? 1.5 : 0.6}
            strokeLinecap="round"
            transform={`rotate(${i * 6})`}
          />
        );
      })}

      {/* 24 hour ticks (thicker) */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1={-92}
          x2="0"
          y2={-82}
          stroke="#1a1a1a"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${i * 15})`}
        />
      ))}

      {/* 24 hour numerals: 0 at top (midnight), 12 at bottom (noon) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = ((i * 15) - 90) * (Math.PI / 180);
        const r = 70;
        const x = round(Math.cos(angle) * r);
        const y = round(Math.sin(angle) * r);
        const isMajor = i % 6 === 0; // 0, 6, 12, 18
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={isMajor ? 13 : 9}
            fontWeight={isMajor ? 600 : 400}
            fill="#1a1a1a"
          >
            {i}
          </text>
        );
      })}

      {/* tiny labels for orientation */}
      <text
        x="0" y="-44"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="5"
        fill="#1a1a1a99"
        letterSpacing="1.5"
      >
        子夜
      </text>
      <text
        x="0" y="44"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="5"
        fill="#1a1a1a99"
        letterSpacing="1.5"
      >
        正午
      </text>

      {now && (
        <>
          {/* hour hand */}
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
          {/* minute hand */}
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
          {/* second hand */}
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

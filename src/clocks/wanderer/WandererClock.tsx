"use client";

import { useWallClock } from "../useWallClock";

export default function WandererClock() {
  const now = useWallClock(1000);
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96"
      role="img"
      aria-label="Wanderer clock, with its hour shown by its gallery position"
    >
      <circle
        cx="0"
        cy="0"
        r="96"
        fill="#fafaf7"
        stroke="#1a1a1a"
        strokeWidth="3"
      />

      {Array.from({ length: 60 }).map((_, index) => {
        const isHour = index % 5 === 0;
        return (
          <line
            key={index}
            x1="0"
            y1="-92"
            x2="0"
            y2={isHour ? -82 : -88}
            stroke="#1a1a1a"
            strokeWidth={isHour ? 2.5 : 1}
            strokeLinecap="round"
            transform={`rotate(${index * 6})`}
          />
        );
      })}

      {Array.from({ length: 12 }).map((_, index) => {
        const value = index === 0 ? 12 : index;
        const angle = (index * 30 - 90) * (Math.PI / 180);
        const x = Math.round(Math.cos(angle) * 70 * 1000) / 1000;
        const y = Math.round(Math.sin(angle) * 70 * 1000) / 1000;
        return (
          <text
            key={index}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="14"
            fill="#1a1a1a"
          >
            {value}
          </text>
        );
      })}

      {now && (
        <>
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
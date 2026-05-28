"use client";

import { useEffect, useState } from "react";

/**
 * Reverse clock: hands tick counter-clockwise, and the numerals on the dial
 * are mirrored so that the clock still tells the correct time — you just have
 * to read it "backwards". 12 is on top, but 1..11 walk to the left.
 */
export default function ReverseClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // Negate angles so hands sweep counter-clockwise.
  const secondAngle = -(s * 6);
  const minuteAngle = -(m * 6 + s * 0.1);
  const hourAngle = -(h * 30 + m * 0.5);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Reverse analog clock"
    >
      <circle cx="0" cy="0" r="96" fill="#f5f1e8" stroke="#1a1a1a" strokeWidth="3" />

      {/* minute ticks (symmetric — no mirroring needed) */}
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

      {/* numerals walk counter-clockwise: 12 on top, then 1 to the left */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = ((-i * 30) - 90) * (Math.PI / 180);
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
            // mirror each numeral horizontally so it looks like a mirror image
            transform={`scale(-1 1) translate(${-2 * x} 0)`}
          >
            {num}
          </text>
        );
      })}

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
        stroke="#2a9d8f"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform={`rotate(${secondAngle})`}
      />

      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
      <circle cx="0" cy="0" r="1.5" fill="#2a9d8f" />
    </svg>
  );
}

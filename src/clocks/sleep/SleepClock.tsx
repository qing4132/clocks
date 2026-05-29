"use client";

import { useWallClock } from "../useWallClock";

/**
 * #015 — Sleep clock.
 *
 *   Based on the 24-hour clock (one full hand revolution per day) but
 *   with the 22:00–06:00 sector physically removed from the dial. The
 *   message is: don't be thinking about time during sleep hours.
 *
 *   The dial values that survive are 6, 8, 10, 12, 14, 16, 18, 20.
 *   The hour hand, if it falls inside the missing sector, is simply
 *   hidden — you can't tell what time it is in the small hours and
 *   you're not supposed to. Minute & second hands keep going as a
 *   reminder that time is still passing.
 */
export default function SleepClock() {
  const now = useWallClock(1000);

  const H = now ? now.getHours() : 0; // 0..23
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // 15° per hour (1 revolution per 24 h).
  const hourAngle = H * 15 + m * 0.25;
  const minuteAngle = m * 6 + s * 0.1;
  const secondAngle = s * 6;

  // Sleep sector: from 23:00 to 07:00 (8 hours = 120°).
  // 23:00 is at angle 23 × 15° = 345°, 07:00 is at 105°.
  // Visible window: 07:00..23:00 = 105° → 345° (the bottom 240°).
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const polar = (angleDeg: number, r: number) => {
    const a = (angleDeg - 90) * (Math.PI / 180);
    return { x: round(Math.cos(a) * r), y: round(Math.sin(a) * r) };
  };
  const R = 96;
  const startA = 105; // 07:00
  const endA = 345; // 23:00
  const p1 = polar(startA, R);
  const p2 = polar(endA, R);
  // sweep clockwise the long way (240°) — large-arc flag = 1
  const facePath = `M ${p1.x} ${p1.y} A ${R} ${R} 0 1 1 ${p2.x} ${p2.y} L 0 0 Z`;

  // Is the hour hand currently inside the sleep sector?
  const hourInSleep = H >= 23 || H < 7;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Sleep-hours clock"
    >
      {/* face — cream pac-man shape with the 22-06 sector cut out */}
      <path d={facePath} fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />

      {/* minute ticks — only those that fall inside the visible 240° wedge */}
      {Array.from({ length: 60 }).map((_, i) => {
        const ang = i * 6;
        if (ang < 105 || ang > 345) return null; // skip sleep sector
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
            transform={`rotate(${ang})`}
          />
        );
      })}

      {/* hour numerals — only the ones in the visible window: 6, 8, 10, 12, 14, 16, 18, 20 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 24 : i * 2; // 24 / 2 / 4 / 6 / ... / 22
        // Hide labels that fall inside the sleep sector.
        // 24 → angle 0, 2 → 30, 4 → 60, 6 → 90, 8 → 120, ..., 20 → 300, 22 → 330.
        // Visible: 8, 10, 12, 14, 16, 18, 20 (we also drop 6 because it
        // sits right on the cut edge and looks crowded against the rim).
        if (num < 8 || num > 22) return null;
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

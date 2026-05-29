"use client";

import { useWallClock } from "../useWallClock";

/**
 * Five-minutes-ahead clock (variant D — single sweeping arc).
 *
 *   - Identical to the classic round clock except for the minute hand.
 *   - The hand's straight root from the center reads the true minute.
 *   - The tip curves over and *points* 5 minutes ahead (+30°).
 *   - The tangent at the tip is aligned with the +30° radial direction,
 *     so the tip really points, doesn't just sit at, the +5 spot.
 */
export default function FiveMinutesAheadClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  const round = (n: number) => Math.round(n * 1000) / 1000;

  // Minute-hand geometry (un-rotated frame: root points straight up).
  const TIP_R = 74;
  const TIP_OFFSET_DEG = 30;
  const a = (TIP_OFFSET_DEG - 90) * (Math.PI / 180);
  const TIP_X = round(Math.cos(a) * TIP_R);
  const TIP_Y = round(Math.sin(a) * TIP_R);
  const DIR_X = round(Math.cos(a));
  const DIR_Y = round(Math.sin(a));
  // Variant D shape: a single big sweeping arc.
  const ROOT_END = -40;
  const C1 = { x: 0, y: -44 };
  const L2 = 20;
  const C2 = { x: round(TIP_X - DIR_X * L2), y: round(TIP_Y - DIR_Y * L2) };
  const minutePath = `M 0 14 L 0 ${ROOT_END} C ${C1.x} ${C1.y}, ${C2.x} ${C2.y}, ${TIP_X} ${TIP_Y}`;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Five-minutes-ahead clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />

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
          <path
            d={minutePath}
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
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

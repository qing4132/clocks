"use client";

import { useWallClock } from "../useWallClock";

/**
 * #017 — Elapsed clock.
 *
 *   Built on the 24-hour dial (#004, one full hand revolution per day), but
 *   the slice of the dial for time that has ALREADY passed today is eaten
 *   away. The mouth opens at midnight (24:00, straight up) and widens
 *   clockwise as the day goes on, so the face shrinks from a full disc at
 *   00:00 to a thin sliver just before midnight — then resets to whole.
 *
 *   The leading edge of what remains sits exactly under the hour hand: you
 *   read the hour from where the dial has been cut to. The minute and second
 *   hands keep sweeping the whole circle (even over the void) as a reminder
 *   that the spent time is gone for good. The wedge is cut the same way as
 *   the Sleep clock (#015) — clean radial edges to the centre.
 */
export default function ElapsedClock() {
  const now = useWallClock(1000);

  const H = now ? now.getHours() : 0; // 0..23
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // 15° per hour (one revolution per 24 h). Midnight (24:00) is straight up.
  const hourAngle = H * 15 + m * 0.25 + s * (0.25 / 60);
  const minuteAngle = m * 6 + s * 0.1;
  const secondAngle = s * 6;

  const round = (n: number) => Math.round(n * 1000) / 1000;
  const polar = (angleDeg: number, r: number) => {
    const a = (angleDeg - 90) * (Math.PI / 180);
    return { x: round(Math.cos(a) * r), y: round(Math.sin(a) * r) };
  };

  const R = 96;
  // The remaining (future) wedge spans from the hour hand, clockwise, back to
  // the top (midnight). Its angular size is 360 − hourAngle.
  const remaining = 360 - hourAngle;
  const pStart = polar(hourAngle, R); // leading edge (under the hour hand)
  const pTop = polar(360, R); // = top point (0, −R)
  const largeArc = remaining > 180 ? 1 : 0;
  // When essentially the whole day is still ahead (just past midnight) draw a
  // full disc, since a 360° arc is degenerate.
  const wholeDisc = hourAngle < 0.05;
  const facePath = `M 0 0 L ${pStart.x} ${pStart.y} A ${R} ${R} 0 ${largeArc} 1 ${pTop.x} ${pTop.y} Z`;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Elapsed-time clock"
    >
      {/* face — the day's remaining slice; what has passed is gone */}
      {wholeDisc ? (
        <circle cx="0" cy="0" r={R} fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />
      ) : (
        <path
          d={facePath}
          fill="#fafaf7"
          stroke="#1a1a1a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      {/* minute ticks — only those still on the remaining face */}
      {Array.from({ length: 60 }).map((_, i) => {
        const ang = i * 6;
        if (!wholeDisc && ang < hourAngle) return null; // eaten away
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

      {/* hour numerals — doubled (2, 4, ..., 24); hidden once eaten */}
      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 24 : i * 2;
        const ang = i * 30;
        if (!wholeDisc && ang < hourAngle) return null;
        const a = (ang - 90) * (Math.PI / 180);
        const r = 70;
        const x = round(Math.cos(a) * r);
        const y = round(Math.sin(a) * r);
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
          {/* no hour hand — the cut edge of the dial already marks the hour */}
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

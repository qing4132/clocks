"use client";

import { useWallClock } from "../useWallClock";

/**
 * #020 — Decimal (French Revolutionary) time.
 *
 *   The French Republic, 1793: a day is 10 hours, an hour is 100 minutes, a
 *   minute is 100 seconds. The whole face is therefore divided into TEN, not
 *   twelve — the single hand sweeps the dial once per (decimal) day, so it
 *   moves through the morning where a normal hour hand barely stirs.
 *
 *   The twist is the most fundamental possible: not a new way of *drawing*
 *   time, but a different answer to "into how many pieces should a day be
 *   cut?". Read like a 10-hour clock: 5 = midday, 7.5 = evening.
 *
 *   Same #001 language: cream face, black ink, red accent, thin border.
 */

// seconds since local midnight → decimal h:m:s (10h / 100m / 100s per day)
function decimalTime(now: Date) {
  const secsOfDay =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds() +
    now.getMilliseconds() / 1000;
  const dayFrac = secsOfDay / 86400; // 0..1 through the day
  const totalDecSec = dayFrac * 100000; // 100000 decimal seconds per day
  const dh = Math.floor(totalDecSec / 10000);
  const dm = Math.floor((totalDecSec % 10000) / 100);
  const ds = Math.floor(totalDecSec % 100);
  return { dayFrac, dh, dm, ds, totalDecSec };
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export default function DecimalClock() {
  const now = useWallClock(100);
  const t = now ? decimalTime(now) : null;

  // Three hands, read like #001 but in decimal units (10h / 100m / 100s):
  //   hour hand   → 1 turn per decimal DAY, glides (carries the minute).
  //   minute hand → 1 turn per decimal HOUR, glides (carries the second).
  //   second hand → 1 turn per decimal MINUTE, TICKS one of the 100 fine
  //                 ticks each decimal second (like #001's stepping second).
  const hourAngle = t ? (t.totalDecSec / 100000) * 360 : 0; // 1 rev / day, smooth
  const minuteAngle = t ? ((t.totalDecSec / 10000) % 1) * 360 : 0; // 1 rev / dec-hour, smooth
  const secondAngle = t ? (Math.floor(t.totalDecSec % 100) / 100) * 360 : 0; // 1 rev / dec-min, ticking

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Decimal (French Revolutionary) time clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />

      {/* 10 hour divisions + 100 minute ticks */}
      {Array.from({ length: 100 }).map((_, i) => {
        const major = i % 10 === 0;
        return (
          <line
            key={i}
            x1="0"
            y1={-92}
            x2="0"
            y2={major ? -82 : -88}
            stroke="#1a1a1a"
            strokeWidth={major ? 2.5 : 1}
            strokeLinecap="round"
            transform={`rotate(${i * 3.6})`}
          />
        );
      })}

      {/* hour numerals 1..10, 10 at the top */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = ((i * 36) - 90) * (Math.PI / 180);
        const r = 70;
        return (
          <text
            key={i}
            x={round(Math.cos(angle) * r)}
            y={round(Math.sin(angle) * r)}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="13"
            fill="#1a1a1a"
          >
            {i === 0 ? 10 : i}
          </text>
        );
      })}

      {now && t && (
        <>
          {/* hour hand — glides, 1 turn per decimal day */}
          <line x1="0" y1="12" x2="0" y2="-46" stroke="#1a1a1a" strokeWidth="5"
            strokeLinecap="round" transform={`rotate(${hourAngle})`} />
          {/* minute hand — glides, 1 turn per decimal hour */}
          <line x1="0" y1="14" x2="0" y2="-74" stroke="#1a1a1a" strokeWidth="3"
            strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
          {/* second hand — ticks the 100 fine ticks, 1 turn per decimal minute */}
          <line x1="0" y1="18" x2="0" y2="-84" stroke="#c1121f" strokeWidth="1.5"
            strokeLinecap="round" transform={`rotate(${secondAngle})`} />
          <circle cx="0" cy="0" r="1.5" fill="#c1121f" />
        </>
      )}

      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </svg>
  );
}

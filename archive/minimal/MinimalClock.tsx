"use client";

import { useWallClock } from "../useWallClock";

export default function MinimalClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // angles match #001 exactly
  const hourDeg = h * 30 + m * 0.5;
  const minuteDeg = m * 6 + s * 0.1;
  const secondDeg = s * 6;

  // each dot sits at the tip of the corresponding #001 hand, with radius
  // equal to that hand's strokeWidth/2 (its rounded-cap end).
  // #001: hour  y2=-50, sw=5  →  r=50, dot=2.5
  //       min   y2=-74, sw=3  →  r=74, dot=1.5
  //       sec   y2=-84, sw=1.5→  r=84, dot=0.75
  const polar = (deg: number, r: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
  };
  const hp = polar(hourDeg, 50);
  const mp = polar(minuteDeg, 74);
  const sp = polar(secondDeg, 84);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Minimal clock — three dots at the hand tips of #001"
    >
      {/* face — no border */}
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      {now && (
        <>
          <circle cx={hp.x} cy={hp.y} r="2.5" fill="#1a1a1a" />
          <circle cx={mp.x} cy={mp.y} r="1.5" fill="#1a1a1a" />
          <circle cx={sp.x} cy={sp.y} r="0.75" fill="#c1121f" />
        </>
      )}
    </svg>
  );
}

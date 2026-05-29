"use client";

import { useWallClock } from "../useWallClock";
import { Digit, DigitalPanel } from "../digital/segments";

/**
 * #015 — Unix timestamp clock.
 *
 *   Shows the current Unix epoch time (seconds since 1970-01-01 UTC) as
 *   a 10-digit 7-segment number. Increments by 1 every second; rightmost
 *   digit highlighted in red so the "second" is obvious.
 */
export default function UnixClock() {
  const now = useWallClock(250);

  const ts = now ? Math.floor(now.getTime() / 1000) : 0;
  const text = String(ts);

  const DIGIT_W = 14;
  const GAP = 2;
  const TOTAL_W = text.length * DIGIT_W + (text.length - 1) * GAP;
  const startX = -TOTAL_W / 2;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Unix timestamp clock"
    >
      <DigitalPanel>
        {now &&
          text.split("").map((d, i) => {
            const x = startX + i * (DIGIT_W + GAP);
            const color = i === text.length - 1 ? "#c1121f" : "#1a1a1a";
            return <Digit key={i} x={x} width={DIGIT_W} d={d} color={color} />;
          })}
      </DigitalPanel>
    </svg>
  );
}

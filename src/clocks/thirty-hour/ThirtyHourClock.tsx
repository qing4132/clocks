"use client";

import { useEffect, useState } from "react";
import { Colon, Digit, DigitalPanel } from "../digital/segments";

/**
 * #012 — 30-hour digital clock (broadcast TV convention).
 *
 *   00:00..05:59 civil → displays 24..29
 *   06:00..23:59 civil → displays 06..23
 *   so the "day boundary" is 06:00.
 *
 *   Same 7-segment look as #011.
 */
export default function ThirtyHourClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(id);
  }, []);

  const civilHour = now ? now.getHours() : 0;
  const displayHour = civilHour < 6 ? civilHour + 24 : civilHour;

  const HH = String(displayHour).padStart(2, "0");
  const MM = now ? String(now.getMinutes()).padStart(2, "0") : "00";
  const SS = now ? String(now.getSeconds()).padStart(2, "0") : "00";
  const ms = now ? now.getMilliseconds() : 0;
  const colonOn = ms < 500;

  const DIGIT_W = 18;
  const COLON_W = 6;
  const GAP = 2;
  const TOTAL_W = 6 * DIGIT_W + 2 * COLON_W + 7 * GAP;
  let cursor = -TOTAL_W / 2;
  const layout: ("d" | "c")[] = ["d", "d", "c", "d", "d", "c", "d", "d"];
  const slotX: { type: "d" | "c"; x: number }[] = [];
  for (const t of layout) {
    slotX.push({ type: t, x: cursor });
    cursor += (t === "d" ? DIGIT_W : COLON_W) + GAP;
  }

  const digits = [HH[0], HH[1], MM[0], MM[1], SS[0], SS[1]];
  const digitColors = ["#1a1a1a", "#1a1a1a", "#1a1a1a", "#1a1a1a", "#c1121f", "#c1121f"];
  let dI = 0;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="30-hour digital clock"
    >
      <DigitalPanel>
        {now &&
          slotX.map((slot, i) => {
            if (slot.type === "c") {
              return <Colon key={i} x={slot.x} width={COLON_W} on={colonOn} />;
            }
            const d = digits[dI];
            const color = digitColors[dI];
            dI++;
            return <Digit key={i} x={slot.x} width={DIGIT_W} d={d} color={color} />;
          })}
      </DigitalPanel>
    </svg>
  );
}

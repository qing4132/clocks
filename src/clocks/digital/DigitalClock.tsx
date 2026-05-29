"use client";

import { useEffect, useState } from "react";

/**
 * #011 — Digital clock, 7-segment LED style.
 *
 *   Fixed-width digit grid → colons never shift.
 */
export default function DigitalClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(id);
  }, []);

  const HH = now ? String(now.getHours()).padStart(2, "0") : "00";
  const MM = now ? String(now.getMinutes()).padStart(2, "0") : "00";
  const SS = now ? String(now.getSeconds()).padStart(2, "0") : "00";
  const ms = now ? now.getMilliseconds() : 0;
  const colonOn = ms < 500;

  // Slot widths and total width.
  const DIGIT_W = 18;
  const COLON_W = 6;
  const GAP = 2;
  // 6 digits + 2 colons + 7 gaps between
  const TOTAL_W = 6 * DIGIT_W + 2 * COLON_W + 7 * GAP;
  // Lay out from leftStart, centred on x=0.
  let cursor = -TOTAL_W / 2;
  const slotX: { type: "d" | "c"; x: number }[] = [];
  const layout: ("d" | "c")[] = ["d", "d", "c", "d", "d", "c", "d", "d"];
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
      aria-label="Digital clock"
    >
      <rect
        x="-94"
        y="-30"
        width="188"
        height="60"
        rx="10"
        ry="10"
        fill="#fafaf7"
        stroke="#1a1a1a"
        strokeWidth="3"
      />

      {now && (
        <>
          {slotX.map((slot, i) => {
            if (slot.type === "c") {
              return <Colon key={i} x={slot.x} width={COLON_W} on={colonOn} />;
            }
            const d = digits[dI];
            const color = digitColors[dI];
            dI++;
            return <Digit key={i} x={slot.x} width={DIGIT_W} d={d} color={color} />;
          })}
        </>
      )}
    </svg>
  );
}

const SEGMENTS: Record<string, string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

// Each digit cell is `width` wide and ~1.8 × width tall.
// Origin: cell's TOP-LEFT corner is at (x, -height/2).
const Digit = ({ x, width, d, color }: { x: number; width: number; d: string; color: string }) => {
  const h = width * 1.85; // total height
  const segT = Math.max(1.5, width * 0.13); // segment thickness
  const lit = new Set(SEGMENTS[d] ?? []);
  const w = width;
  const halfH = (h - segT) / 2;
  const segHorizW = w - segT * 2;
  const segVertH = halfH - segT;

  const segs: { which: string; x: number; y: number; w: number; h: number }[] = [
    { which: "a", x: segT, y: 0, w: segHorizW, h: segT }, // top
    { which: "b", x: w - segT, y: segT, w: segT, h: segVertH }, // upper-right
    { which: "c", x: w - segT, y: segT + segVertH + segT, w: segT, h: segVertH }, // lower-right
    { which: "d", x: segT, y: h - segT, w: segHorizW, h: segT }, // bottom
    { which: "e", x: 0, y: segT + segVertH + segT, w: segT, h: segVertH }, // lower-left
    { which: "f", x: 0, y: segT, w: segT, h: segVertH }, // upper-left
    { which: "g", x: segT, y: halfH, w: segHorizW, h: segT }, // middle
  ];

  return (
    <g transform={`translate(${x} ${-h / 2})`}>
      {segs.map((s) => (
        <rect
          key={s.which}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={Math.min(s.w, s.h) / 2}
          ry={Math.min(s.w, s.h) / 2}
          fill={color}
          opacity={lit.has(s.which) ? 1 : 0.08}
        />
      ))}
    </g>
  );
};

const Colon = ({ x, width, on }: { x: number; width: number; on: boolean }) => (
  <g transform={`translate(${x + width / 2} 0)`}>
    <circle cx="0" cy="-7" r="1.8" fill="#1a1a1a" opacity={on ? 1 : 0.08} />
    <circle cx="0" cy="7" r="1.8" fill="#1a1a1a" opacity={on ? 1 : 0.08} />
  </g>
);

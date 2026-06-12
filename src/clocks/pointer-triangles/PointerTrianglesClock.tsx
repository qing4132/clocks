"use client";

import { useWallClock } from "../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Math.round(Math.cos(a) * r * 1000) / 1000,
    y: Math.round(Math.sin(a) * r * 1000) / 1000,
  };
}

function trianglePath(angleDeg: number, r: number) {
  const tip = polar(angleDeg, r);
  const left = polar(angleDeg + 120, r);
  const right = polar(angleDeg + 240, r);
  return `M ${tip.x} ${tip.y} L ${left.x} ${left.y} M ${tip.x} ${tip.y} L ${right.x} ${right.y}`;
}

export default function PointerTrianglesClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Pointer triangles clock"
    >
      {now && (
        <>
          <path d={trianglePath(hourAngle, 50)} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d={trianglePath(minuteAngle, 74)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d={trianglePath(secondAngle, 84)} fill="none" stroke={RED} strokeWidth="1.5" strokeLinecap="round" />

        </>
      )}
    </svg>
  );
}
"use client";

import { useEffect, useState } from "react";

const MIN_RADIUS = 10;
const MAX_RADIUS = 86;
const INK = "#1b201d";
const MOSS = "#52665a";
const RED = "#b44336";

function radiusFor(value: number, cycle: number) {
  const progress = value === 0 ? 1 : value / cycle;
  return MIN_RADIUS + progress * (MAX_RADIUS - MIN_RADIUS);
}

function TraceArc({
  radius,
  rotation,
  stroke,
  strokeWidth,
  opacity,
}: {
  radius: number;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}) {
  return (
    <circle
      cx="0"
      cy="0"
      r={radius}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray="25 75"
      pathLength="100"
      opacity={opacity}
      transform={`rotate(${rotation})`}
      vectorEffect="non-scaling-stroke"
      style={{ transition: "r 780ms cubic-bezier(0.22, 1, 0.36, 1)" }}
    />
  );
}

export default function ThreeTracesClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const hour = now ? now.getHours() % 12 : 0;
  const minute = now ? now.getMinutes() : 0;
  const second = now ? now.getSeconds() : 0;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label="Three Traces clock"
    >
      <circle cx="0" cy="0" r="96" fill="#f5f5f1" />
      {now && (
        <>
          <TraceArc
            radius={radiusFor(hour + minute / 60 + second / 3600, 12)}
            rotation={-75}
            stroke={INK}
            strokeWidth={5.2}
            opacity={0.78}
          />
          <TraceArc
            radius={radiusFor(minute + second / 60, 60)}
            rotation={45}
            stroke={MOSS}
            strokeWidth={3}
            opacity={0.68}
          />
          <TraceArc
            radius={radiusFor(second, 60)}
            rotation={165}
            stroke={RED}
            strokeWidth={1.35}
            opacity={0.82}
          />
        </>
      )}
      <circle cx="0" cy="0" r="1.8" fill={RED} />
    </svg>
  );
}
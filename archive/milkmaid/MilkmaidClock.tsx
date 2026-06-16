"use client";

import { useWallClock } from "../useWallClock";

const CLOCK = {
  x: 75.4,
  y: 6.8,
  width: 13.8,
  aspect: 508 / 290,
  dialX: 48.6,
  dialY: 57.7,
};

const HAND = {
  width: 15.2,
  aspect: 224 / 1187,
  pivotX: 19.7,
  pivotY: 50,
};

function HandLayer({
  angle,
  scale,
  opacity = 1,
}: {
  angle: number;
  scale: number;
  opacity?: number;
}) {
  const clockHeight = CLOCK.width * CLOCK.aspect;

  return (
    <div
      className="absolute bg-contain bg-no-repeat"
      style={{
        left: `${CLOCK.x + CLOCK.width * (CLOCK.dialX / 100)}%`,
        top: `${CLOCK.y + clockHeight * (CLOCK.dialY / 100)}%`,
        width: `${HAND.width * scale}%`,
        height: `${HAND.width * scale * HAND.aspect}%`,
        backgroundImage: "url('/art/milkmaid-clock-hand.png')",
        opacity,
        transform: `translate(-${HAND.pivotX}%, -${HAND.pivotY}%) rotate(${angle - 90}deg)`,
        transformOrigin: `${HAND.pivotX}% ${HAND.pivotY}%`,
      }}
    />
  );
}

export default function MilkmaidClock() {
  const now = useWallClock(1000);

  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;
  const clockHeight = CLOCK.width * CLOCK.aspect;

  return (
    <div
      className="relative h-72 w-72 overflow-hidden rounded-sm bg-stone-100 bg-cover bg-center shadow-xl sm:h-96 sm:w-96"
      role="img"
      aria-label="Milkmaid antique wall clock"
      style={{ backgroundImage: "url('/art/milkmaid.jpg')" }}
    >
      <div
        className="absolute rounded-full bg-stone-900/30 blur-md"
        style={{
          left: `${CLOCK.x + CLOCK.width * 0.34}%`,
          top: `${CLOCK.y + clockHeight * 0.35}%`,
          width: `${CLOCK.width * 0.95}%`,
          height: `${clockHeight * 0.72}%`,
          transform: "translate(20%, 13%) rotate(7deg)",
        }}
      />
      <div
        className="absolute bg-contain bg-no-repeat"
        style={{
          left: `${CLOCK.x}%`,
          top: `${CLOCK.y}%`,
          width: `${CLOCK.width}%`,
          height: `${clockHeight}%`,
          backgroundImage: "url('/art/milkmaid-clock-face.png')",
        }}
      />

      {now && (
        <>
          <HandLayer angle={hourAngle} scale={0.22} opacity={0.96} />
          <HandLayer angle={minuteAngle} scale={0.32} opacity={0.98} />
          <HandLayer angle={secondAngle} scale={0.36} opacity={0.68} />
        </>
      )}
    </div>
  );
}
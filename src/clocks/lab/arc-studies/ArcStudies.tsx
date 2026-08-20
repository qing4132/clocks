"use client";

import { useWallClock } from "../../useWallClock";

const INK = "#1a1a1a";

type ArcVariant = "chord" | "short-arc" | "bow" | "hinge" | "spiral";

type Point = {
  x: number;
  y: number;
};

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function polarPoint(angleDegrees: number, radius: number): Point {
  const radians = angleDegrees * Math.PI / 180;
  return {
    x: round(Math.sin(radians) * radius),
    y: round(-Math.cos(radians) * radius),
  };
}

function clockwiseSweep(fromAngle: number, toAngle: number) {
  return ((toAngle - fromAngle) % 360 + 360) % 360;
}

function inwardSpiralPath(hourAngle: number, minuteAngle: number) {
  const sweep = clockwiseSweep(hourAngle, minuteAngle);
  return Array.from({ length: 65 }, (_, index) => {
    const progress = index / 64;
    const point = polarPoint(
      hourAngle + sweep * progress,
      96 - 44 * progress,
    );
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");
}

function pathForVariant(
  variant: ArcVariant,
  hourAngle: number,
  minuteAngle: number,
  hour: Point,
  minute: Point,
) {
  const sweep = clockwiseSweep(hourAngle, minuteAngle);

  switch (variant) {
    case "chord":
      return `M ${hour.x} ${hour.y} L ${minute.x} ${minute.y}`;
    case "short-arc":
      return `M ${hour.x} ${hour.y} A 96 96 0 0 ${sweep <= 180 ? 1 : 0} ${minute.x} ${minute.y}`;
    case "bow": {
      const control = polarPoint(hourAngle + sweep / 2, 28);
      return `M ${hour.x} ${hour.y} Q ${control.x} ${control.y} ${minute.x} ${minute.y}`;
    }
    case "hinge":
      return `M ${hour.x} ${hour.y} L 0 0 L ${minute.x} ${minute.y}`;
    case "spiral":
      return inwardSpiralPath(hourAngle, minuteAngle);
  }
}

function ArcStudyClock({ variant, label }: { variant: ArcVariant; label: string }) {
  const now = useWallClock(32);
  const hours = (now?.getHours() ?? 0) % 12;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds / 120;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hour = polarPoint(hourAngle, 96);
  const minute = polarPoint(minuteAngle, 96);
  const path = pathForVariant(variant, hourAngle, minuteAngle, hour, minute);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label={label}
    >
      {now && (
        <>
          <path d={path} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={hour.x} cy={hour.y} r="3" fill={INK} />
        </>
      )}
    </svg>
  );
}

export function ArcChordClock() {
  return <ArcStudyClock variant="chord" label="Arc chord clock" />;
}

export function ArcShortClock() {
  return <ArcStudyClock variant="short-arc" label="Arc shortest-path clock" />;
}

export function ArcBowClock() {
  return <ArcStudyClock variant="bow" label="Arc bowed clock" />;
}

export function ArcHingeClock() {
  return <ArcStudyClock variant="hinge" label="Arc hinge clock" />;
}

export function ArcSpiralClock() {
  return <ArcStudyClock variant="spiral" label="Arc inward spiral clock" />;
}
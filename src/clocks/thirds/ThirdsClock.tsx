"use client";

import { useWallClock } from "../useWallClock";

const INK = "#1a1a1a";
const FACE = "#fafaf7";
const RED = "#c1121f";
const RADIUS = 96;

const HOUR_CENTER = 0;
const MINUTE_CENTER = 240;
const SECOND_CENTER = 120;

type Point = {
  x: number;
  y: number;
};

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function polar(angleDegrees: number, radius: number): Point {
  const radians = (angleDegrees - 90) * (Math.PI / 180);
  return {
    x: round(Math.cos(radians) * radius),
    y: round(Math.sin(radians) * radius),
  };
}

function sectorPath(startAngle: number, endAngle: number) {
  const start = polar(startAngle, RADIUS);
  const end = polar(endAngle, RADIUS);
  return `M 0 0 L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y} Z`;
}

function signedDistance(angle: number, center: number) {
  return ((angle - center + 540) % 360) - 180;
}

function featherOpacity(
  baseAngle: number,
  rotation: number,
  center: number,
) {
  const distance = Math.abs(signedDistance(baseAngle + rotation, center));
  const value = Math.max(0, Math.min(1, (60 - distance) / 16));
  return value * value * (3 - 2 * value);
}

function DialTicks({
  divisions,
  rotation,
  center,
  accent,
}: {
  divisions: 12 | 60;
  rotation: number;
  center: number;
  accent: boolean;
}) {
  return Array.from({ length: divisions }).map((_, index) => {
    const major = divisions === 12 || index % 5 === 0;
    const angle = index * (360 / divisions);
    return (
      <line
        key={index}
        x1="0"
        y1="-92"
        x2="0"
        y2={major ? -82 : -88}
        stroke={accent && major ? RED : INK}
        strokeWidth={major ? 2.3 : 0.8}
        strokeLinecap="round"
        opacity={featherOpacity(angle, rotation, center)}
        transform={`rotate(${angle})`}
      />
    );
  });
}

function DialNumerals({
  divisions,
  rotation,
  center,
  accent,
}: {
  divisions: 12 | 60;
  rotation: number;
  center: number;
  accent: boolean;
}) {
  const baseSize = divisions === 12 ? 14 : 11;

  return Array.from({ length: 12 }).map((_, index) => {
    const value = divisions === 12 ? index : index * 5;
    const angle = value * (360 / divisions);
    const point = polar(angle, 70);

    return (
      <g
        key={value}
        transform={`translate(${point.x} ${point.y}) rotate(${-rotation})`}
        opacity={featherOpacity(angle, rotation, center)}
      >
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={baseSize}
          fill={accent ? RED : INK}
        >
          {divisions === 12
            ? index === 0
              ? 12
              : index
            : String(value).padStart(2, "0")}
        </text>
      </g>
    );
  });
}

function RotatingDial({
  divisions,
  rotation,
  center,
  accent = false,
}: {
  divisions: 12 | 60;
  rotation: number;
  center: number;
  accent?: boolean;
}) {
  return (
    <g transform={`rotate(${rotation})`}>
      <DialTicks
        divisions={divisions}
        rotation={rotation}
        center={center}
        accent={accent}
      />
      <DialNumerals
        divisions={divisions}
        rotation={rotation}
        center={center}
        accent={accent}
      />
    </g>
  );
}

function FixedHand({
  angle,
  length,
  tail,
  width,
  color,
}: {
  angle: number;
  length: number;
  tail: number;
  width: number;
  color: string;
}) {
  return (
    <line
      x1="0"
      y1={tail}
      x2="0"
      y2={-length}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      transform={`rotate(${angle})`}
    />
  );
}

export default function ThirdsClock() {
  const now = useWallClock(32);
  const hours = (now?.getHours() ?? 0) % 12;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now
    ? now.getSeconds() + now.getMilliseconds() / 1000
    : 0;

  const hourRotation = HOUR_CENTER - (hours * 30 + minutes * 0.5 + seconds / 120);
  const minuteRotation = MINUTE_CENTER - (minutes * 6 + seconds * 0.1);
  const secondRotation = SECOND_CENTER - seconds * 6;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96"
      role="img"
      aria-label="Thirds clock with three fixed hands and rotating sector dials"
    >
      <defs>
        <clipPath id="thirds-hour-sector">
          <path d={sectorPath(-60, 60)} />
        </clipPath>
        <clipPath id="thirds-second-sector">
          <path d={sectorPath(60, 180)} />
        </clipPath>
        <clipPath id="thirds-minute-sector">
          <path d={sectorPath(180, 300)} />
        </clipPath>
      </defs>

      <circle cx="0" cy="0" r={RADIUS} fill={FACE} />

      {now && (
        <>
          <g clipPath="url(#thirds-hour-sector)">
            <RotatingDial
              divisions={12}
              rotation={hourRotation}
              center={HOUR_CENTER}
            />
          </g>
          <g clipPath="url(#thirds-minute-sector)">
            <RotatingDial
              divisions={60}
              rotation={minuteRotation}
              center={MINUTE_CENTER}
            />
          </g>
          <g clipPath="url(#thirds-second-sector)">
            <RotatingDial
              divisions={60}
              rotation={secondRotation}
              center={SECOND_CENTER}
              accent
            />
          </g>
        </>
      )}

      <circle cx="0" cy="0" r={RADIUS} fill="none" stroke={INK} strokeWidth="3" />
      <FixedHand
        angle={HOUR_CENTER}
        length={50}
        tail={10}
        width={5}
        color={INK}
      />
      <FixedHand
        angle={MINUTE_CENTER}
        length={74}
        tail={14}
        width={3}
        color={INK}
      />
      <FixedHand
        angle={SECOND_CENTER}
        length={84}
        tail={20}
        width={1.5}
        color={RED}
      />
      <circle cx="0" cy="0" r="4" fill={INK} />
    </svg>
  );
}
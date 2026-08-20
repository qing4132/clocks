"use client";

import { useWallClock } from "../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";

function signedAngularDistance(angle: number, reference: number) {
  return ((angle - reference + 540) % 360) - 180;
}

function warpAngle(angle: number, secondAngle: number) {
  const distance = signedAngularDistance(angle, secondAngle);
  return angle + 25 * Math.sin(distance * Math.PI / 180);
}

function polarPoint(angleDegrees: number, radius: number) {
  const radians = angleDegrees * Math.PI / 180;
  return {
    x: Math.round(Math.sin(radians) * radius * 1000) / 1000,
    y: Math.round(-Math.cos(radians) * radius * 1000) / 1000,
  };
}

export default function IllusionClock() {
  const now = useWallClock(32);
  const hours = (now?.getHours() ?? 0) % 12;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds / 120;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;
  const warpedHourAngle = warpAngle(hourAngle, secondAngle);
  const warpedMinuteAngle = warpAngle(minuteAngle, secondAngle);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96"
      role="img"
      aria-label="Illusion clock"
    >
      <circle r="96" fill={PAPER} stroke={INK} strokeWidth="3" />
      {Array.from({ length: 60 }, (_, index) => {
        const angle = warpAngle(index * 6, secondAngle);
        return (
          <line
            key={index}
            x1="0"
            y1={index % 5 === 0 ? -81 : -86}
            x2="0"
            y2="-92"
            stroke={INK}
            strokeWidth={index % 5 === 0 ? 2.3 : 0.9}
            strokeLinecap="round"
            transform={`rotate(${angle})`}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const point = polarPoint(warpAngle(index * 30, secondAngle), 68);
        return (
          <text
            key={index}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="12"
            fill={INK}
          >
            {index || 12}
          </text>
        );
      })}
      <line x1="0" y1="9" x2="0" y2="-49" stroke={INK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${warpedHourAngle})`} />
      <line x1="0" y1="13" x2="0" y2="-72" stroke={INK} strokeWidth="3" strokeLinecap="round" transform={`rotate(${warpedMinuteAngle})`} />
      <line x1="0" y1="-79" x2="0" y2="-93" stroke={RED} strokeWidth="2" strokeLinecap="round" transform={`rotate(${secondAngle})`} />
      <circle r="4" fill={INK} />
    </svg>
  );
}
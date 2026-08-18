"use client";

import { useWallClock } from "../../src/clocks/useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";

function signedAngularDistance(angle: number, reference: number) {
  return ((angle - reference + 540) % 360) - 180;
}

function attentionWarp(markAngle: number, focusAngle: number) {
  const distance = signedAngularDistance(markAngle, focusAngle);
  return focusAngle + distance + 25 * Math.sin((distance * Math.PI) / 180);
}

function polarPoint(angleDegrees: number, radius: number) {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: Math.sin(radians) * radius,
    y: -Math.cos(radians) * radius,
  };
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

export default function AttentionLensClock() {
  const now = useWallClock(32);
  const hours = (now?.getHours() ?? 0) % 12;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now
    ? now.getSeconds() + now.getMilliseconds() / 1000
    : 0;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds / 120;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96"
      role="img"
      aria-label="Attention lens clock giving more space to the present second"
    >
      <circle
        cx="0"
        cy="0"
        r="96"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
      />

      {Array.from({ length: 60 }).map((_, index) => (
        <line
          key={index}
          x1="0"
          y1={index % 5 === 0 ? -81 : -86}
          x2="0"
          y2="-92"
          stroke={INK}
          strokeWidth={index % 5 === 0 ? 2.3 : 0.9}
          strokeLinecap="round"
          transform={`rotate(${attentionWarp(index * 6, secondAngle)})`}
        />
      ))}

      {Array.from({ length: 12 }).map((_, index) => {
        const value = index === 0 ? 12 : index;
        const point = polarPoint(index * 30, 68);
        return (
          <text
            key={value}
            x={round(point.x)}
            y={round(point.y)}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="12"
            fill={INK}
          >
            {value}
          </text>
        );
      })}

      <line
        x1="0"
        y1="9"
        x2="0"
        y2="-49"
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${hourAngle})`}
      />
      <line
        x1="0"
        y1="13"
        x2="0"
        y2="-72"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle})`}
      />
      <line
        x1="0"
        y1="-79"
        x2="0"
        y2="-93"
        stroke={RED}
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${secondAngle})`}
      />
      <circle cx="0" cy="0" r="4" fill={INK} />
    </svg>
  );
}
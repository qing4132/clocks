"use client";

import type { ReactNode } from "react";
import { useWallClock } from "../../useWallClock";

type BurnState = {
  head: { x: number; y: number };
  burnFrac: number;
  hour: number;
  minute: number;
};

const R_OUTER = 86;
const R_INNER = 8;
const TURNS = 12;
const THETA_MAX = TURNS * 2 * Math.PI;
const A = (R_OUTER - R_INNER) / THETA_MAX;
const STEPS = 720;
const D_THETA = THETA_MAX / STEPS;
const round = (value: number) => Math.round(value * 1000) / 1000;

const arcLengths: number[] = [0];
for (let index = 1, total = 0; index <= STEPS; index += 1) {
  const theta = (index - 0.5) * D_THETA;
  const radius = R_OUTER - A * theta;
  total += Math.sqrt(radius * radius + A * A) * D_THETA;
  arcLengths.push(total);
}
const TOTAL_LENGTH = arcLengths[STEPS];

function thetaAtLength(length: number) {
  if (length <= 0) return 0;
  if (length >= TOTAL_LENGTH) return THETA_MAX;
  let low = 0;
  let high = STEPS;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (arcLengths[middle] < length) low = middle + 1;
    else high = middle;
  }
  const previous = Math.max(0, low - 1);
  const fraction = (length - arcLengths[previous]) / (arcLengths[low] - arcLengths[previous]);
  return (previous + fraction) * D_THETA;
}

function point(theta: number) {
  const radius = R_OUTER - A * theta;
  return { x: round(Math.sin(theta) * radius), y: round(-Math.cos(theta) * radius) };
}

const hourMarkers = Array.from({ length: 25 }, (_, hour) => {
  const theta = thetaAtLength((hour / 24) * TOTAL_LENGTH);
  const marker = point(theta);
  const radius = R_OUTER - A * theta;
  const tangentX = Math.sin(theta) * -A + Math.cos(theta) * radius;
  const tangentY = -Math.cos(theta) * -A + Math.sin(theta) * radius;
  const tangentLength = Math.hypot(tangentX, tangentY);
  const normalX = tangentY / tangentLength;
  const normalY = -tangentX / tangentLength;
  const sign = normalX * marker.x + normalY * marker.y > 0 ? 1 : -1;
  return { hour, marker, normalX: normalX * sign, normalY: normalY * sign, major: hour % 6 === 0 };
});

function IncenseBase({
  showHourMarkers = false,
  overlay,
}: {
  showHourMarkers?: boolean;
  overlay?: (state: BurnState) => ReactNode;
}) {
  const now = useWallClock(1000);
  const seconds = now ? now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() : 0;
  const burnFrac = seconds / 86400;
  const burnTheta = thetaAtLength(burnFrac * TOTAL_LENGTH);
  const head = point(burnTheta);
  const burned: string[] = [];
  const unburned: string[] = [];
  for (let index = 0; index <= STEPS; index += 1) {
    const theta = index * D_THETA;
    const spiralPoint = point(theta);
    if (theta <= burnTheta + 0.001) burned.push(`${spiralPoint.x},${spiralPoint.y}`);
    if (theta >= burnTheta - 0.001) unburned.push(`${spiralPoint.x},${spiralPoint.y}`);
  }
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Archived incense coil clock">
      <circle r="96" fill="#fafaf7" />
      {now && (
        <>
          {showHourMarkers && hourMarkers.map(({ hour, marker, normalX, normalY, major }) => {
            const tickLength = major ? 5 : 2.5;
            return (
              <g key={hour}>
                <line x1={marker.x} y1={marker.y} x2={round(marker.x + normalX * tickLength)} y2={round(marker.y + normalY * tickLength)} stroke="#1a1a1a" strokeWidth={major ? 1 : 0.5} strokeLinecap="round" opacity={major ? 0.8 : 0.45} />
                {major && <text x={round(marker.x + normalX * 9)} y={round(marker.y + normalY * 9)} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, serif" fontSize="6.5" fill="#1a1a1a">{hour}</text>}
              </g>
            );
          })}
          {overlay?.({ head, burnFrac, hour: now.getHours(), minute: now.getMinutes() })}
          {burned.length > 1 && <polyline points={burned.join(" ")} fill="none" stroke="#a0978a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" strokeDasharray="1 2" />}
          {unburned.length > 1 && <polyline points={unburned.join(" ")} fill="none" stroke="#5a3a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
          <circle cx={head.x} cy={head.y} r="3.5" fill="#c1121f" />
          <circle cx={head.x} cy={head.y} r="1.5" fill="#ffd166" />
          {[-1, 0, 1].map((offset, index) => <circle key={offset} cx={head.x + offset * 1.5} cy={head.y - 4 - index * 3} r={1.2 - index * 0.3} fill="#1a1a1a" opacity={0.18 - index * 0.05} />)}
        </>
      )}
    </svg>
  );
}

export function IncenseArchiveClock() {
  return <IncenseBase showHourMarkers />;
}

export function IncenseArchiveA() {
  return <IncenseBase />;
}

export function IncenseArchiveB() {
  return <IncenseBase overlay={({ head, hour }) => {
    const ringRadius = R_OUTER + 6;
    const hourAngle = ((hour % 12) * 30 - 90) * Math.PI / 180;
    return (
      <>
        <circle r={ringRadius} fill="none" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.35" />
        {Array.from({ length: 12 }, (_, index) => { const angle = (index * 30 - 90) * Math.PI / 180; return <text key={index} x={round(Math.cos(angle) * (ringRadius + 6))} y={round(Math.sin(angle) * (ringRadius + 6))} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, serif" fontSize="7" fill="#1a1a1a" opacity="0.55">{index || 12}</text>; })}
        <line x1="0" y1="0" x2={head.x * 1.3} y2={head.y * 1.3} stroke="#c1121f" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.7" />
        <circle cx={round(Math.cos(hourAngle) * ringRadius)} cy={round(Math.sin(hourAngle) * ringRadius)} r="2.4" fill="#c1121f" />
      </>
    );
  }} />;
}

export function IncenseArchiveC() {
  return <IncenseBase overlay={({ burnFrac }) => (
    <>
      <line x1="-80" y1="92" x2="80" y2="92" stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />
      <line x1="-80" y1="92" x2={-80 + 160 * burnFrac} y2="92" stroke="#c1121f" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 6, 12, 18, 24].map((hour) => { const x = -80 + 160 * hour / 24; return <g key={hour}><line x1={x} y1="89.5" x2={x} y2="94.5" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.6" /><text x={x} y="101" textAnchor="middle" fontFamily="Georgia, serif" fontSize="6" fill="#1a1a1a" opacity="0.6">{hour}</text></g>; })}
    </>
  )} />;
}

export function IncenseArchiveD() {
  return <IncenseBase overlay={({ head, hour, minute }) => {
    const length = Math.hypot(head.x, head.y) || 1;
    return <text x={head.x + head.x / length * 10} y={head.y + head.y / length * 10} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, serif" fontSize="8" fill="#c1121f" style={{ fontVariantNumeric: "tabular-nums" }}>{String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</text>;
  }} />;
}

export function IncenseArchiveE() {
  return <IncenseBase />;
}
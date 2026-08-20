"use client";

import type { ReactNode } from "react";
import { useWallClock } from "../../useWallClock";

const FACE = "#fafaf7";
const INK = "#1a1a1a";
const RED = "#c1121f";
const TRACK_RADIUS = 78;
const MIN_RADIUS = 18;
const MAX_RADIUS = 60;

function ClockShell({ children }: { children: ReactNode }) {
  const now = useWallClock(1000);
  const hours = now ? String(now.getHours()).padStart(2, "0") : "--";
  const minutes = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96">
      <circle r="96" fill={FACE} stroke={INK} strokeWidth="3" />
      {children}
      <text x="0" y="86" textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" fill={INK} fillOpacity="0.45" letterSpacing="3">{hours}:{minutes}</text>
    </svg>
  );
}

function usePhase(totalSeconds: number) {
  const now = useWallClock(50);
  return { ready: now !== null, elapsed: now ? now.getTime() / 1000 % totalSeconds : 0 };
}

function locatePhase(elapsed: number, durations: number[]) {
  let start = 0;
  for (let index = 0; index < durations.length; index += 1) {
    if (elapsed < start + durations[index]) return { index, fraction: (elapsed - start) / durations[index] };
    start += durations[index];
  }
  return { index: durations.length - 1, fraction: 1 };
}

export function BoxBreathArchiveClock() {
  const { ready, elapsed } = usePhase(16);
  const { index, fraction } = locatePhase(elapsed, [4, 4, 4, 4]);
  const radiusProgress = index === 0 ? fraction : index === 1 ? 1 : index === 2 ? 1 - fraction : 0;
  const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * radiusProgress;
  const side = 64;
  let dotX = 0;
  let dotY = 0;
  if (index === 0) { dotX = -side + 2 * side * fraction; dotY = -side; }
  else if (index === 1) { dotX = side; dotY = -side + 2 * side * fraction; }
  else if (index === 2) { dotX = side - 2 * side * fraction; dotY = side; }
  else { dotX = -side; dotY = side - 2 * side * fraction; }
  const edges = [
    { x1: -side, y1: -side, x2: side, y2: -side },
    { x1: side, y1: -side, x2: side, y2: side },
    { x1: side, y1: side, x2: -side, y2: side },
    { x1: -side, y1: side, x2: -side, y2: -side },
  ];
  const edge = edges[index];
  return (
    <ClockShell>
      <rect x={-side} y={-side} width={2 * side} height={2 * side} rx="6" fill="none" stroke={INK} strokeWidth="1" strokeOpacity="0.25" />
      {ready && <><line {...edge} stroke={RED} strokeWidth="2" strokeLinecap="round" strokeDasharray={index === 1 || index === 3 ? "2 4" : undefined} opacity="0.85" /><circle r={radius.toFixed(2)} fill={INK} fillOpacity="0.08" stroke={INK} strokeWidth="1" /><circle cx={dotX.toFixed(2)} cy={dotY.toFixed(2)} r="4" fill={RED} /></>}
    </ClockShell>
  );
}

export function ResonantBreathArchiveClock() {
  const { ready, elapsed } = usePhase(10);
  const phase = elapsed / 10 * 2 * Math.PI;
  const progress = 0.5 - 0.5 * Math.cos(phase);
  const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * progress;
  return (
    <ClockShell>
      <circle r={MAX_RADIUS} fill="none" stroke={INK} strokeWidth="0.7" strokeOpacity="0.18" /><circle r={MIN_RADIUS} fill="none" stroke={INK} strokeWidth="0.7" strokeOpacity="0.18" />
      {ready && <><circle r={radius.toFixed(2)} fill={INK} fillOpacity="0.08" stroke={INK} strokeWidth="1.2" /><circle cy={(-radius).toFixed(2)} r="3.5" fill={RED} /></>}
    </ClockShell>
  );
}

export function RelaxationBreathArchiveClock() {
  const durations = [4, 7, 8];
  const total = 19;
  const { ready, elapsed } = usePhase(total);
  const { index, fraction } = locatePhase(elapsed, durations);
  const radiusProgress = index === 0 ? fraction : index === 1 ? 1 : 1 - fraction;
  const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * radiusProgress;
  let startAngle = -90;
  const arcs = durations.map((duration, arcIndex) => {
    const sweep = duration / total * 360;
    const endAngle = startAngle + sweep;
    const radiansStart = startAngle * Math.PI / 180;
    const radiansEnd = endAngle * Math.PI / 180;
    const startX = (Math.cos(radiansStart) * TRACK_RADIUS).toFixed(2);
    const startY = (Math.sin(radiansStart) * TRACK_RADIUS).toFixed(2);
    const endX = (Math.cos(radiansEnd) * TRACK_RADIUS).toFixed(2);
    const endY = (Math.sin(radiansEnd) * TRACK_RADIUS).toFixed(2);
    const path = `M ${startX} ${startY} A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 ${sweep > 180 ? 1 : 0} 1 ${endX} ${endY}`;
    let progressPath: string | undefined;
    if (ready && arcIndex === index) {
      const progressSweep = sweep * fraction;
      const progressRadians = (startAngle + progressSweep) * Math.PI / 180;
      const progressX = (Math.cos(progressRadians) * TRACK_RADIUS).toFixed(2);
      const progressY = (Math.sin(progressRadians) * TRACK_RADIUS).toFixed(2);
      progressPath = `M ${startX} ${startY} A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 ${progressSweep > 180 ? 1 : 0} 1 ${progressX} ${progressY}`;
    }
    startAngle = endAngle;
    return { path, hold: arcIndex === 1, progressPath };
  });
  return (
    <ClockShell>
      {arcs.map((arc, arcIndex) => <g key={arcIndex}><path d={arc.path} fill="none" stroke={INK} strokeWidth="1" strokeOpacity="0.22" strokeDasharray={arc.hold ? "2 4" : undefined} strokeLinecap="round" />{arc.progressPath && <path d={arc.progressPath} fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={arc.hold ? "2 4" : undefined} />}</g>)}
      {ready && <circle r={radius.toFixed(2)} fill={INK} fillOpacity="0.08" stroke={INK} strokeWidth="1.2" />}
    </ClockShell>
  );
}
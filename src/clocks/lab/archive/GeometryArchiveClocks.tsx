"use client";

import { useWallClock } from "../../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";
const L = 96;

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

type RulerKind = "original" | "a" | "b" | "c" | "d" | "e";

function Ruler({ kind }: { kind: RulerKind }) {
  if (kind === "b") {
    return Array.from({ length: 12 }, (_, index) => {
      const value = index + 1;
      const y = round((-value / 12) * L);
      const major = value % 3 === 0;
      return (
        <g key={value}>
          <circle cy={y} r={major ? 2 : 1} fill={INK} />
          {major && <text x="8" y={y} dominantBaseline="central" fontFamily="Georgia, serif" fontSize="11" fill={INK}>{value}</text>}
        </g>
      );
    });
  }

  const majorOnly = kind === "e";
  const values = majorOnly ? [3, 6, 9, 12] : Array.from({ length: 12 }, (_, index) => index + 1);
  return (
    <>
      {(kind === "original" || kind === "c" || kind === "e") && <line x1="0" y1="0" x2="0" y2={-L} stroke={INK} strokeWidth={kind === "original" ? 1 : 0.7} />}
      {kind === "d" && <><line x1="-2" y1="0" x2="-2" y2={-L} stroke={INK} strokeWidth="0.6" /><line x1="2" y1="0" x2="2" y2={-L} stroke={INK} strokeWidth="0.6" /></>}
      {values.map((value) => {
        const y = round((-value / 12) * L);
        const major = value % 3 === 0;
        if (kind === "c") {
          const height = major ? 6 : 3.5;
          const width = major ? 3 : 1.6;
          return <g key={value}><polygon points={`0,${y} ${-width},${y - height} ${width},${y - height}`} fill={INK} />{major && <text x="12" y={y} dominantBaseline="central" fontFamily="Georgia, serif" fontSize="11" fill={INK}>{value}</text>}</g>;
        }
        const x1 = kind === "original" ? 0 : kind === "d" ? -2 : majorOnly ? -7 : major ? -5 : -3;
        const x2 = kind === "original" ? -(major ? 10 : 6) : kind === "d" ? 2 : majorOnly ? 7 : major ? 5 : 3;
        return (
          <g key={value}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={INK} strokeWidth={majorOnly ? 2 : major ? 2 : 1} strokeLinecap="round" />
            {major && <text x={kind === "original" ? 6 : majorOnly ? 14 : kind === "d" ? 8 : 12} y={y} dominantBaseline="central" fontFamily="Georgia, serif" fontSize={majorOnly ? 12 : 11} fill={INK}>{value}</text>}
          </g>
        );
      })}
    </>
  );
}

function ExpandingRings({ kind }: { kind: RulerKind }) {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const hourProgress = hours + minutes / 60;
  const minuteProgress = minutes + seconds / 60;
  const radii = [
    (hourProgress === 0 ? 1 : hourProgress / 12) * L,
    (minuteProgress === 0 ? 1 : minuteProgress / 60) * L,
    (seconds === 0 ? 1 : seconds / 60) * L,
  ];
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Archived Expanding Rings clock">
      <circle r="96" fill={PAPER} />
      <Ruler kind={kind} />
      <circle r={round(radii[0])} fill="none" stroke={INK} strokeWidth="2.4" />
      <circle r={round(radii[1])} fill="none" stroke={INK} strokeWidth="1.4" />
      <circle r={round(radii[2])} fill="none" stroke={RED} strokeWidth="1" />
      <circle r="2" fill={INK} />
    </svg>
  );
}

export function ExpandingRingsOriginal() { return <ExpandingRings kind="original" />; }
export function ExpandingRingsA() { return <ExpandingRings kind="a" />; }
export function ExpandingRingsB() { return <ExpandingRings kind="b" />; }
export function ExpandingRingsC() { return <ExpandingRings kind="c" />; }
export function ExpandingRingsD() { return <ExpandingRings kind="d" />; }
export function ExpandingRingsE() { return <ExpandingRings kind="e" />; }

function traceRadius(value: number, cycle: number) {
  return 10 + (value === 0 ? 1 : value / cycle) * 76;
}

export function ThreeTracesArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const traces = [
    { radius: traceRadius(hours + minutes / 60 + seconds / 3600, 12), rotation: -75, stroke: "#1b201d", width: 5.2, opacity: 0.78 },
    { radius: traceRadius(minutes + seconds / 60, 60), rotation: 45, stroke: "#52665a", width: 3, opacity: 0.68 },
    { radius: traceRadius(seconds, 60), rotation: 165, stroke: "#b44336", width: 1.35, opacity: 0.82 },
  ];
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label="Archived Three Traces clock">
      <circle r="96" fill="#f5f5f1" />
      {now && traces.map((trace, index) => <circle key={index} r={trace.radius} fill="none" stroke={trace.stroke} strokeWidth={trace.width} strokeLinecap="round" strokeDasharray="25 75" pathLength="100" opacity={trace.opacity} transform={`rotate(${trace.rotation})`} />)}
      <circle r="1.8" fill="#b44336" />
    </svg>
  );
}

type Plane = "xy" | "yz" | "xz";

export function OrbArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const angles = {
    xy: seconds / 60 * Math.PI * 2,
    yz: (minutes + seconds / 60) / 60 * Math.PI * 2,
    xz: (hours * 30 + minutes * 0.5) * Math.PI / 180,
  };
  const yaw = -32 * Math.PI / 180;
  const pitch = 22 * Math.PI / 180;
  const project = (x: number, y: number, z: number) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    return { x: round(x1), y: round(-y2) };
  };
  const point = (plane: Plane, angle: number, radius: number) => {
    const right = plane === "xy" ? [1, 0, 0] : plane === "yz" ? [0, 0, -1] : [1, 0, 0];
    const up = plane === "xy" || plane === "yz" ? [0, 1, 0] : [0, 0, -1];
    const across = Math.sin(angle) * radius;
    const upward = Math.cos(angle) * radius;
    return project(right[0] * across + up[0] * upward, right[1] * across + up[1] * upward, right[2] * across + up[2] * upward);
  };
  const renderDial = (plane: Plane) => (
    <g>
      <polyline points={Array.from({ length: 97 }, (_, index) => { const p = point(plane, index / 96 * Math.PI * 2, 96); return `${p.x} ${p.y}`; }).join(" ")} fill="none" stroke={INK} strokeWidth="1.5" />
      {[0, 3, 6, 9].map((index) => { const outer = point(plane, index / 12 * Math.PI * 2, 92); const inner = point(plane, index / 12 * Math.PI * 2, 82); return <line key={index} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke={INK} strokeWidth="2" />; })}
    </g>
  );
  const renderHand = (plane: Plane, tip: number, tail: number, width: number, color: string) => { const angle = angles[plane]; const start = point(plane, angle + Math.PI, tail); const end = point(plane, angle, tip); return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={width} strokeLinecap="round" />; };
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Archived Orb clock">
      <circle r="96" fill={PAPER} />
      {renderDial("xz")}{renderDial("yz")}{renderDial("xy")}
      {now && <>{renderHand("xz", 50, 10, 5, INK)}{renderHand("yz", 74, 14, 3, INK)}{renderHand("xy", 84, 20, 1.5, RED)}</>}
      <circle r="4" fill={INK} />
    </svg>
  );
}
import type { CSSProperties, ReactNode } from "react";
import { INK, PAPER, RED, TAU, clamp, pad, polar, round } from "../shared";
import type { ClockTime } from "../types";

export { INK, PAPER, RED, TAU, clamp, pad, polar, round };
export type { ClockTime };

export const PALE = "#d9d9d3";
export const SERIF = "Georgia, 'Times New Roman', serif";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export type Point = { x: number; y: number };
export type PointMap = (radius: number, fraction: number) => Point;
export type RendererProps = { time: ClockTime };
export type StudyRenderer = (props: RendererProps) => ReactNode;

export function hour12(time: ClockTime) {
  return time.h12 === 0 ? 12 : time.h12;
}

export function angles(time: ClockTime) {
  return {
    hour: time.hour,
    minute: time.minute,
    second: time.second,
  };
}

export function pathThrough(points: Point[], close = false) {
  if (points.length === 0) return "";
  return `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${round(point.x)} ${round(point.y)}`).join(" ")}${close ? " Z" : ""}`;
}

export function radialPath(map: PointMap, fraction: number, from: number, to: number, steps = 16) {
  return pathThrough(Array.from({ length: steps + 1 }, (_, index) => map(from + (to - from) * index / steps, fraction)));
}

export function circlePath(map: PointMap, radius = 96, samples = 120) {
  return pathThrough(Array.from({ length: samples }, (_, index) => map(radius, index / samples)), true);
}

export function shortestDifference(a: number, b: number) {
  return ((a - b + 1.5) % 1) - 0.5;
}

export function hsla(hue: number, saturation = 92, lightness = 56, alpha = 1) {
  return `hsla(${round((hue % 360 + 360) % 360)}, ${saturation}%, ${lightness}%, ${alpha})`;
}

export function ClassicFace({
  time,
  map = polar,
  faceFill = PAPER,
  rimColor = INK,
  tickColor = () => INK,
  numeralColor = () => INK,
  hourColor = INK,
  minuteColor = INK,
  secondColor = RED,
  showFace = true,
  showRim = true,
  showTicks = true,
  showNumerals = true,
  showHands = true,
  tickOpacity = 1,
  numeralOpacity = 1,
  groupOpacity = 1,
  groupStyle,
  before,
  after,
}: {
  time: ClockTime;
  map?: PointMap;
  faceFill?: string;
  rimColor?: string;
  tickColor?: (index: number) => string;
  numeralColor?: (index: number) => string;
  hourColor?: string;
  minuteColor?: string;
  secondColor?: string;
  showFace?: boolean;
  showRim?: boolean;
  showTicks?: boolean;
  showNumerals?: boolean;
  showHands?: boolean;
  tickOpacity?: number;
  numeralOpacity?: number;
  groupOpacity?: number;
  groupStyle?: CSSProperties;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const current = angles(time);
  const origin = map(0, 0);
  const handSpecs = [
    { key: "hour", fraction: current.hour, from: -10, to: 50, width: 5, color: hourColor },
    { key: "minute", fraction: current.minute, from: -14, to: 74, width: 3, color: minuteColor },
    { key: "second", fraction: current.second, from: -20, to: 84, width: 1.5, color: secondColor },
  ];

  return (
    <g opacity={groupOpacity} style={groupStyle}>
      {showFace && <path d={circlePath(map)} fill={faceFill} stroke="none" />}
      {before}
      {showRim && <path d={circlePath(map)} fill="none" stroke={rimColor} strokeWidth="3" />}
      {showTicks && Array.from({ length: 60 }, (_, index) => {
        const major = index % 5 === 0;
        const inner = map(major ? 82 : 88, index / 60);
        const outer = map(92, index / 60);
        return (
          <line
            key={index}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={tickColor(index)}
            strokeWidth={major ? 2.5 : 1}
            strokeLinecap="round"
            opacity={tickOpacity}
          />
        );
      })}
      {showNumerals && Array.from({ length: 12 }, (_, index) => {
        const point = map(70, index / 12);
        return (
          <text
            key={index}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={SERIF}
            fontSize="14"
            fill={numeralColor(index)}
            opacity={numeralOpacity}
          >
            {index || 12}
          </text>
        );
      })}
      {showHands && handSpecs.map((hand) => (
        <path
          key={hand.key}
          d={radialPath(map, hand.fraction, hand.from, hand.to)}
          fill="none"
          stroke={hand.color}
          strokeWidth={hand.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {showHands && <circle cx={origin.x} cy={origin.y} r="4" fill={INK} />}
      {after}
    </g>
  );
}

export function StandardFace({
  time,
  id,
  children,
  background = PAPER,
}: {
  time: ClockTime;
  id: string;
  children?: ReactNode;
  background?: string;
}) {
  return (
    <>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle r="96" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <circle r="96" fill={background} />
        {children}
      </g>
      <ClassicFace time={time} showFace={false} />
    </>
  );
}

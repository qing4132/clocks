import type { ReactNode } from "react";
import type { ClockTime } from "../types";
import { pad } from "../shared";

export { pad };
export type Point = { x: number; y: number };
export type FaceProps = { time: ClockTime; variant: number; uid: string };
export type Theme = { paper: string; ink: string; accent: string; second: string; pale: string };

const THEMES: Theme[] = [
  { paper: "#f5f6f1", ink: "#1d2828", accent: "#267569", second: "#c63a48", pale: "#dbe3dc" },
  { paper: "#f1f4f6", ink: "#182b42", accent: "#c94742", second: "#257d88", pale: "#d9e0e6" },
  { paper: "#f6f1ed", ink: "#2c2728", accent: "#a94353", second: "#297b74", pale: "#e7dada" },
  { paper: "#edf5f2", ink: "#223b35", accent: "#1d8278", second: "#ce6539", pale: "#d6e5dc" },
  { paper: "#f8f5e8", ink: "#292d30", accent: "#386794", second: "#c84735", pale: "#e4e0cd" },
  { paper: "#eef1f8", ink: "#282b39", accent: "#575b9f", second: "#d7485e", pale: "#dce0ed" },
  { paper: "#22292b", ink: "#eff3e8", accent: "#b4ce5c", second: "#ff795d", pale: "#465354" },
  { paper: "#f5eff2", ink: "#3c2836", accent: "#b04171", second: "#268477", pale: "#e6dbe1" },
  { paper: "#182e39", ink: "#f0f0de", accent: "#63c4c4", second: "#edb353", pale: "#375763" },
  { paper: "#eff4e9", ink: "#293124", accent: "#648744", second: "#c44a50", pale: "#dce5d1" },
];

export function theme(variant: number) { return THEMES[variant % THEMES.length]; }
export const SERIF = "Georgia, 'Times New Roman', serif";
export const MONO = "var(--font-geist-mono), ui-monospace, monospace";
export const TAU = Math.PI * 2;
export function point(radius: number, turns: number, centerX = 100, centerY = 100): Point {
  return { x: centerX + Math.sin(turns * TAU) * radius, y: centerY - Math.cos(turns * TAU) * radius };
}
export function poly(points: Point[], close = false) { return points.map((entry, index) => `${index ? "L" : "M"} ${entry.x.toFixed(3)} ${entry.y.toFixed(3)}`).join(" ") + (close ? " Z" : ""); }
export function arc(radius: number, start: number, end: number, centerX = 100, centerY = 100) {
  const span = Math.max(0, Math.min(.999999, end - start));
  const first = point(radius, start, centerX, centerY);
  const last = point(radius, start + span, centerX, centerY);
  return span <= 0 ? "" : `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${span > .5 ? 1 : 0} 1 ${last.x} ${last.y}`;
}
export function unitValues(time: ClockTime) { return [time.h24, time.minuteValue, time.secondValue]; }
export function unitFractions(time: ClockTime) { return [time.day, time.minute, time.second]; }
export function dialFractions(time: ClockTime) { return [time.hour, time.minute, time.second]; }
export function pathPoint(points: Point[], progress: number, closed = false): Point {
  const nodes = closed ? [...points, points[0]] : points;
  const lengths = nodes.slice(1).map((node, index) => Math.hypot(node.x - nodes[index].x, node.y - nodes[index].y));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = Math.max(0, Math.min(.9999999, progress)) * total;
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index] && lengths[index] > 0) {
      const amount = remaining / lengths[index];
      return { x: nodes[index].x + (nodes[index + 1].x - nodes[index].x) * amount, y: nodes[index].y + (nodes[index + 1].y - nodes[index].y) * amount };
    }
    remaining -= lengths[index];
  }
  return nodes.at(-1) ?? { x: 100, y: 100 };
}
export function regularPolygon(count: number, radius = 80, centerX = 100, centerY = 100) { return Array.from({ length: count }, (_, index) => point(radius, index / count, centerX, centerY)); }

export function Text({ x = 100, y = 100, children, size = 14, color = "#1d2828", anchor = "middle", mono = false, weight = 400, opacity = 1 }: {
  x?: number; y?: number; children: ReactNode; size?: number; color?: string; anchor?: "start" | "middle" | "end"; mono?: boolean; weight?: number; opacity?: number;
}) {
  return <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontFamily={mono ? MONO : SERIF} fontSize={size} fontWeight={weight} fill={color} opacity={opacity}>{children}</text>;
}
export function Ground({ colors, round = false }: { colors: Theme; round?: boolean }) {
  return round ? <circle cx="100" cy="100" r="94" fill={colors.paper} /> : <rect x="8" y="8" width="184" height="184" rx="3" fill={colors.paper} />;
}
export function Readout({ time, colors, y = 174, size = 15, seconds = true }: { time: ClockTime; colors: Theme; y?: number; size?: number; seconds?: boolean }) {
  return <Text y={y} size={size} color={colors.ink} mono>{pad(time.h24)}:{pad(time.minuteValue)}{seconds ? `:${pad(time.secondValue)}` : ""}</Text>;
}
export function Marks({ radius = 84, count = 60, centerX = 100, centerY = 100, colors, labels = true, turn = 0 }: {
  radius?: number; count?: number; centerX?: number; centerY?: number; colors: Theme; labels?: boolean; turn?: number;
}) {
  return <g>{Array.from({ length: count }, (_, index) => {
    const major = index % (count === 24 ? 2 : 5) === 0;
    const first = point(radius, index / count + turn, centerX, centerY);
    const last = point(radius - (major ? 7 : 3), index / count + turn, centerX, centerY);
    return <line key={index} x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke={colors.ink} strokeWidth={major ? 1.6 : .65} />;
  })}{labels && Array.from({ length: 12 }, (_, index) => { const label = point(radius - 19, index / 12 + turn, centerX, centerY); return <Text key={index} x={label.x} y={label.y} size={11} color={colors.ink}>{index || 12}</Text>; })}</g>;
}
export function Hands({ time, colors, centerX = 100, centerY = 100, lengths = [45, 65, 76], turn = 0, includeSeconds = true }: {
  time: ClockTime; colors: Theme; centerX?: number; centerY?: number; lengths?: number[]; turn?: number; includeSeconds?: boolean;
}) {
  return <g>{dialFractions(time).slice(0, includeSeconds ? 3 : 2).map((fraction, index) => {
    const start = point(-[8, 11, 14][index], fraction + turn, centerX, centerY);
    const end = point(lengths[index], fraction + turn, centerX, centerY);
    return <line key={index} data-unit={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={index === 2 ? colors.second : colors.ink} strokeWidth={[4.2, 2.5, 1.2][index]} strokeLinecap="round" />;
  })}<circle cx={centerX} cy={centerY} r="3" fill={colors.ink} /></g>;
}
export function ValueDot({ position, value, colors, size = 5, ink = false }: { position: Point; value?: string; colors: Theme; size?: number; ink?: boolean }) {
  return <g><circle cx={position.x} cy={position.y} r={size} fill={ink ? colors.ink : colors.accent} stroke={colors.paper} strokeWidth="1.2" />{value !== undefined && <Text x={position.x} y={position.y} size={size * .95} color={colors.paper} mono>{value}</Text>}</g>;
}
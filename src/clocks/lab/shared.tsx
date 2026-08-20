import type { ClockTime } from "./types";

export const TAU = Math.PI * 2;
export const PAPER = "#fafaf7";
export const INK = "#1a1a1a";
export const RED = "#c1121f";
export const BLUE = "#2f6f89";
export const GOLD = "#aa7a22";
export const PALE = "#deddd7";

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function frac(value: number) {
  return value - Math.floor(value);
}

export function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function polar(radius: number, fraction: number, phase = -0.25) {
  const angle = (fraction + phase) * TAU;
  return {
    x: round(Math.cos(angle) * radius),
    y: round(Math.sin(angle) * radius),
  };
}

export function pathFrom(points: { x: number; y: number }[], close = false) {
  if (points.length === 0) return "";
  const body = points.map((point) => `${point.x} ${point.y}`).join(" L ");
  return `M ${body}${close ? " Z" : ""}`;
}

export function arcPath(radius: number, start: number, end: number) {
  const span = clamp(end - start, 0, 0.999999);
  if (span <= 0) return "";
  const first = polar(radius, start);
  const last = polar(radius, start + span);
  return `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${span > 0.5 ? 1 : 0} 1 ${last.x} ${last.y}`;
}

export function pad(value: number) {
  return String(Math.floor(value)).padStart(2, "0");
}

export function wedgePath(radius: number, fraction: number) {
  const amount = clamp(fraction, 0, 0.999999);
  if (amount <= 0) return "";
  const first = polar(radius, 0);
  const last = polar(radius, amount);
  return `M 0 0 L ${first.x} ${first.y} A ${radius} ${radius} 0 ${amount > 0.5 ? 1 : 0} 1 ${last.x} ${last.y} Z`;
}

export function hash(seed: number) {
  return frac(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);
}

export function getClockTime(date: Date): ClockTime {
  const h24 = date.getHours();
  const h12 = h24 % 12;
  const minuteValue = date.getMinutes();
  const secondValue = date.getSeconds();
  const ms = date.getMilliseconds();
  const second = (secondValue + ms / 1000) / 60;
  const minute = (minuteValue + second) / 60;
  const hour = (h12 + minute) / 12;
  const day = (h24 + minuteValue / 60 + secondValue / 3600 + ms / 3_600_000) / 24;

  return {
    date,
    h24,
    h12,
    minuteValue,
    secondValue,
    ms,
    second,
    minute,
    hour,
    day,
  };
}
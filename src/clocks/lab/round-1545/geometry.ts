import { SEGMENTS } from "../../digital/segments";
import { ROD_SLOTS, rodEndpoints } from "../round-1537/reassembly";

export type Point2 = { x: number; y: number };
export type TimeStroke = { id: string; column: number; name: string; start: Point2; end: Point2 };
export const DIGIT_CENTERS = [-67, -27, 27, 67];
export const WORLD_SCALE = .026;

export function timeDigits(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
}

export function timeStrokes(date: Date): TimeStroke[] {
  return Array.from(timeDigits(date)).flatMap((digit, column) => SEGMENTS[digit].map(name => {
    const endpoints = rodEndpoints({ ...ROD_SLOTS[name], x: DIGIT_CENTERS[column] + ROD_SLOTS[name].x });
    return { id: `${column}-${name}`, column, name, ...endpoints };
  }));
}

export const GAP_WINDOWS = {
  a: { x: -14, y: -26, width: 28, height: 4, slideX: 0, slideY: -4 },
  b: { x: 10, y: -22, width: 4, height: 20, slideX: 4, slideY: 0 },
  c: { x: 10, y: 2, width: 4, height: 20, slideX: 4, slideY: 0 },
  d: { x: -14, y: 22, width: 28, height: 4, slideX: 0, slideY: 4 },
  e: { x: -14, y: 2, width: 4, height: 20, slideX: -4, slideY: 0 },
  f: { x: -14, y: -22, width: 4, height: 20, slideX: -4, slideY: 0 },
  g: { x: -14, y: -2, width: 28, height: 4, slideX: 0, slideY: -4 },
} as const;

export function gapState(date: Date) {
  const current = timeDigits(date);
  const elapsed = date.getSeconds() * 1000 + date.getMilliseconds();
  const previous = timeDigits(new Date(date.getTime() - elapsed - 1));
  const phase = Math.min(1, elapsed / 800);
  const progress = phase ** 3 * (10 - 15 * phase + 6 * phase ** 2);
  const shutters = Array.from(current).flatMap((digit, column) => Object.entries(GAP_WINDOWS).map(([name, window]) => {
    const before = SEGMENTS[previous[column]].includes(name) ? 1 : 0;
    const after = SEGMENTS[digit].includes(name) ? 1 : 0;
    const opening = before + (after - before) * progress;
    return {
      ...window, id: `${column}-${name}`, column, name, opening,
      x: window.x + DIGIT_CENTERS[column],
      offsetX: window.slideX * opening,
      offsetY: window.slideY * opening,
    };
  }));
  return { current, previous, progress, shutters };
}
import { SEGMENTS } from "../../digital/segments";

export type RodPose = { x: number; y: number; angle: number };

export const ROD_LENGTH = 22;
export const ROD_SLOTS: Record<string, RodPose> = {
  a: { x: 0, y: -24, angle: 0 },
  b: { x: 12, y: -12, angle: Math.PI / 2 },
  c: { x: 12, y: 12, angle: Math.PI / 2 },
  d: { x: 0, y: 24, angle: 0 },
  e: { x: -12, y: 12, angle: Math.PI / 2 },
  f: { x: -12, y: -12, angle: Math.PI / 2 },
  g: { x: 0, y: 0, angle: 0 },
};

const ROD_NAMES = Object.keys(ROD_SLOTS);
const DIGIT_CENTERS = [-67, -27, 27, 67];

export function glyphRods(digit: string): RodPose[] {
  const active = SEGMENTS[digit];
  return ROD_NAMES.map(name => {
    if (active.includes(name)) return ROD_SLOTS[name];
    const origin = ROD_SLOTS[name];
    const nearest = active.reduce((best, candidate) => {
      const cost = (slot: string) => Math.hypot(ROD_SLOTS[slot].x - origin.x, ROD_SLOTS[slot].y - origin.y) + (ROD_SLOTS[slot].angle === origin.angle ? 0 : 4);
      return cost(candidate) < cost(best) ? candidate : best;
    });
    return ROD_SLOTS[nearest];
  });
}

export function rodEndpoints(pose: RodPose) {
  const horizontal = Math.cos(pose.angle) * ROD_LENGTH / 2;
  const vertical = Math.sin(pose.angle) * ROD_LENGTH / 2;
  return {
    start: { x: pose.x - horizontal, y: pose.y - vertical },
    end: { x: pose.x + horizontal, y: pose.y + vertical },
  };
}

function reading(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
}

export function reassemblyState(date: Date) {
  const elapsed = date.getSeconds() * 1000 + date.getMilliseconds();
  const amount = Math.min(1, elapsed / 1800);
  const progress = amount ** 3 * (10 - 15 * amount + 6 * amount ** 2);
  const current = reading(date);
  const previous = reading(new Date(date.getTime() - elapsed - 1));
  const rods = Array.from(current).flatMap((digit, column) => {
    const start = glyphRods(previous[column]);
    return glyphRods(digit).map((target, index) => {
      const origin = start[index];
      const angleDelta = ((target.angle - origin.angle + Math.PI * 1.5) % Math.PI) - Math.PI / 2;
      return {
        id: column * 7 + index,
        column,
        x: DIGIT_CENTERS[column] + origin.x + (target.x - origin.x) * progress,
        y: origin.y + (target.y - origin.y) * progress,
        angle: origin.angle + angleDelta * progress,
      };
    });
  });
  return { rods, current, previous, progress };
}
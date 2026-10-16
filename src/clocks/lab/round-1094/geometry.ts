export type Point = { x: number; y: number };

export function radialPoint(radius: number, turns: number): Point {
  const angle = turns * Math.PI * 2;
  return { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
}

export function openRim(turns: number, gapDegrees = 8) {
  const halfGap = gapDegrees / 720;
  const start = radialPoint(96, turns + halfGap);
  const end = radialPoint(96, turns + 1 - halfGap);
  return `M ${start.x} ${start.y} A 96 96 0 1 1 ${end.x} ${end.y}`;
}

export function inwardHand(turns: number, length: number) {
  return { anchor: radialPoint(96, turns), end: radialPoint(96 - length, turns) };
}

export function courtesyBend(hour: number, minute: number) {
  return 9 * (1 + Math.cos((hour - minute) * Math.PI * 2));
}

export function bowedHand(turns: number, tip: number, tail: number, bend: number) {
  const start = radialPoint(-tail, turns);
  const end = radialPoint(tip, turns);
  const tangent = radialPoint(bend, turns + 0.25);
  const first = radialPoint(tip * 0.27, turns);
  const second = radialPoint(tip * 0.73, turns);
  return `M ${start.x} ${start.y} L 0 0 C ${first.x + tangent.x} ${first.y + tangent.y} ${second.x + tangent.x} ${second.y + tangent.y} ${end.x} ${end.y}`;
}

export function wanderingHand(turns: number, tip: number, tail: number, seconds: number) {
  const pivot = radialPoint(20, seconds);
  const end = radialPoint(tip, turns);
  const distance = Math.hypot(end.x - pivot.x, end.y - pivot.y);
  const start = {
    x: pivot.x - (end.x - pivot.x) / distance * tail,
    y: pivot.y - (end.y - pivot.y) / distance * tail,
  };
  return { pivot, start, end };
}

export function crosswiseHand(turns: number, radius: number) {
  const middle = radialPoint(radius, turns);
  const halfLength = Math.sqrt(92 ** 2 - radius ** 2);
  const tangent = radialPoint(halfLength, turns + 0.25);
  return {
    middle,
    start: { x: middle.x - tangent.x, y: middle.y - tangent.y },
    end: { x: middle.x + tangent.x, y: middle.y + tangent.y },
  };
}

export function stillHourMap(radius: number, turns: number, hour: number) {
  return radialPoint(radius, turns - hour);
}
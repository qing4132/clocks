export const PAPER = "#fafaf7";
export const INK = "#1a1a1a";
export const RED = "#c1121f";
export const SERIF = "Georgia, 'Times New Roman', serif";
export const TAU = Math.PI * 2;
export type Point = { x: number; y: number };

export function polar(radius: number, turns: number, centerX = 0, centerY = 0): Point {
  return { x: centerX + Math.sin(turns * TAU) * radius, y: centerY - Math.cos(turns * TAU) * radius };
}

export function path(points: Point[], close = false) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(4)} ${point.y.toFixed(4)}`).join(" ") + (close ? " Z" : "");
}

export function circleArc(radius: number, start: number, end: number, centerX = 0, centerY = 0) {
  const span = Math.max(0, Math.min(0.999999, end - start));
  if (span === 0) return "";
  const first = polar(radius, start, centerX, centerY);
  const last = polar(radius, start + span, centerX, centerY);
  return `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${span > .5 ? 1 : 0} 1 ${last.x} ${last.y}`;
}

export function polygon(sides: number, radius = 84, phase = 0) {
  return Array.from({ length: sides }, (_, index) => polar(radius, index / sides + phase));
}

export function onPath(points: Point[], fraction: number, close = true): Point {
  const vertices = close ? [...points, points[0]] : points;
  const lengths = vertices.slice(1).map((point, index) => Math.hypot(point.x - vertices[index].x, point.y - vertices[index].y));
  let remaining = Math.max(0, Math.min(1, fraction)) * lengths.reduce((sum, length) => sum + length, 0);
  for (let index = 0; index < lengths.length; index++) {
    const length = lengths[index];
    if (remaining <= length && length > 0) {
      const amount = remaining / length;
      return { x: vertices[index].x * (1 - amount) + vertices[index + 1].x * amount, y: vertices[index].y * (1 - amount) + vertices[index + 1].y * amount };
    }
    remaining -= length;
  }
  return vertices.at(-1) ?? { x: 0, y: 0 };
}

export function smooth(value: number) {
  const amount = Math.max(0, Math.min(1, value));
  return amount * amount * (3 - 2 * amount);
}

export function steppedSecond(second: number, milliseconds: number, mode: "hold" | "half" | "step") {
  if (mode === "step") return second / 60;
  if (mode === "half") return (second + (milliseconds >= 500 ? .5 : 0)) / 60;
  return (second + smooth((milliseconds - 500) / 500)) / 60;
}

export function mappedPoint(radius: number, turns: number, variant: number): Point {
  const angle = turns * TAU;
  const horizontal = Math.sin(angle);
  const vertical = -Math.cos(angle);
  let boundary = 96;
  if (variant === 0) boundary = Math.min(96, 77 / Math.max(1e-8, Math.abs(horizontal)));
  if (variant === 1) boundary = 92 / (Math.abs(horizontal) ** 1.25 + Math.abs(vertical) ** 1.25) ** (1 / 1.25);
  if (variant === 4 || variant === 6) {
    const sides = variant === 4 ? 8 : 6;
    const local = ((angle + Math.PI / sides) % (TAU / sides) + TAU / sides) % (TAU / sides) - Math.PI / sides;
    boundary = 95 * Math.cos(Math.PI / sides) / Math.cos(local);
  }
  if (variant === 5) boundary = 91 / (Math.abs(horizontal) ** 5 + Math.abs(vertical) ** 5) ** .2;
  if (variant === 9) boundary = 92 * (1 - .09 * Math.cos(angle * 4));
  const amount = radius / 96 * boundary;
  return {
    x: horizontal * amount * (variant === 2 ? .73 : variant === 7 ? .83 - .14 * Math.cos(angle) : variant === 8 ? .84 + .12 * horizontal : 1),
    y: vertical * amount * (variant === 3 ? .72 : 1),
  };
}

export const ROUTES = {
  meander: [{ x: -76, y: -66 }, { x: 76, y: -66 }, { x: 76, y: -22 }, { x: -76, y: -22 }, { x: -76, y: 22 }, { x: 76, y: 22 }, { x: 76, y: 66 }, { x: -76, y: 66 }],
  inward: [{ x: -76, y: 72 }, { x: -76, y: -72 }, { x: 76, y: -72 }, { x: 76, y: 48 }, { x: -47, y: 48 }, { x: -47, y: -42 }, { x: 46, y: -42 }, { x: 46, y: 17 }, { x: -17, y: 17 }, { x: -17, y: -12 }, { x: 15, y: -12 }],
  hours: Array.from({ length: 24 }, (_, index) => {
    const row = Math.floor(index / 8);
    const column = row % 2 ? 7 - index % 8 : index % 8;
    return { x: -77 + column * 22, y: -70 + row * 55 + (index % 2) * 25 };
  }),
  minuteU: [{ x: -60, y: -24 }, ...Array.from({ length: 81 }, (_, index) => polar(60, .75 - index / 160, 0, 6)), { x: 60, y: -24 }],
  detour: Array.from({ length: 120 }, (_, index) => {
    const point = polar(64, index / 120, 16, -10);
    return { x: 16 + (point.x - 16) * .8, y: point.y };
  }),
  course: [{ x: -48, y: -77 }, { x: 48, y: -77 }, { x: 77, y: -48 }, { x: 77, y: 48 }, { x: 48, y: 77 }, { x: -48, y: 77 }, { x: -77, y: 48 }, { x: -77, y: -48 }],
  corners: [{ x: -61, y: -61 }, { x: 61, y: -61 }, { x: 61, y: 61 }, { x: -61, y: 61 }],
  spiral: Array.from({ length: 241 }, (_, index) => polar(30 + index / 240 * 54, index / 120)),
};

export function splitCount(value: number, base: number) {
  return { groups: Math.floor(value / base), remainder: value % base };
}
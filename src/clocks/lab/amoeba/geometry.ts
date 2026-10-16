import { TAU, type Point } from "../ink-200/geometry";

export type AmoebaShape = {
  bend: Point;
  oval: Point;
  lobe: Point;
};

function travelingWave(milliseconds: number, seconds: number, amplitude: number, offset: number): Point {
  const angle = (milliseconds % (seconds * 1000)) / (seconds * 1000) * TAU + offset;
  return { x: amplitude * Math.cos(angle), y: amplitude * Math.sin(angle) };
}

function multiplyComplex(first: Point, second: Point): Point {
  return { x: first.x * second.x - first.y * second.y, y: first.x * second.y + first.y * second.x };
}

export function amoebaPoint(radius: number, turns: number, shape: AmoebaShape): Point {
  const angle = turns * TAU;
  const source = { x: Math.sin(angle) * radius / 96, y: -Math.cos(angle) * radius / 96 };
  const result = { x: source.x * 75, y: source.y * 75 };
  let power = source;
  for (const coefficient of [shape.bend, shape.oval, shape.lobe]) {
    power = multiplyComplex(power, source);
    const displacement = multiplyComplex(coefficient, power);
    result.x += displacement.x;
    result.y += displacement.y;
  }
  return result;
}

export function amoebaStroke(startRadius: number, endRadius: number, turns: number, shape: AmoebaShape, segments = 32): Point[] {
  const radii = Array.from({ length: segments + 1 }, (_, index) => startRadius + (endRadius - startRadius) * index / segments);
  if (startRadius < 0 && endRadius > 0) {
    const centerIndex = radii.findIndex(radius => radius >= 0);
    if (radii[centerIndex] !== 0) radii.splice(centerIndex, 0, 0);
  }
  return radii.map(radius => amoebaPoint(radius, turns, shape));
}

export function amoebaShape(milliseconds: number): AmoebaShape {
  return {
    bend: travelingWave(milliseconds, 37, 10, .6),
    oval: travelingWave(milliseconds, -53, 8, 1.4),
    lobe: travelingWave(milliseconds, 71, 3, -.8),
  };
}
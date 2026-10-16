export type Point = { x: number; y: number };
export type Ring = { center: Point; radius: number; tip: Point };

export function bearing(radius: number, turns: number): Point {
  const angle = turns * Math.PI * 2;
  return { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
}

export function handRing(reach: number, turns: number): Ring {
  return { center: bearing(reach / 2, turns), radius: reach / 2, tip: bearing(reach, turns) };
}

export function outerCrossing(first: Ring, second: Ring): Point | null {
  const delta = { x: second.center.x - first.center.x, y: second.center.y - first.center.y };
  const distance = Math.hypot(delta.x, delta.y);
  if (distance < 1e-8 || distance > first.radius + second.radius + 1e-8 || distance < Math.abs(first.radius - second.radius) - 1e-8) return null;
  const along = (first.radius ** 2 - second.radius ** 2 + distance ** 2) / (2 * distance);
  const across = Math.sqrt(Math.max(0, first.radius ** 2 - along ** 2));
  const middle = { x: first.center.x + delta.x * along / distance, y: first.center.y + delta.y * along / distance };
  const candidates = [-1, 1].map((side) => ({
    x: middle.x - side * delta.y * across / distance,
    y: middle.y + side * delta.x * across / distance,
  }));
  const point = candidates.reduce((furthest, candidate) => Math.hypot(candidate.x, candidate.y) > Math.hypot(furthest.x, furthest.y) ? candidate : furthest);
  return Math.hypot(point.x, point.y) > 10 ? point : null;
}

export function weaveGeometry(hour: number, minute: number, second: number) {
  const rings = [handRing(50, hour), handRing(74, minute), handRing(84, second)];
  const crossings = [[0, 1], [1, 2], [2, 0]].flatMap(([over, under]) => {
    const point = outerCrossing(rings[over], rings[under]);
    return point ? [{ over, under, point }] : [];
  });
  return { rings, crossings };
}
import * as THREE from "three";
import { timeStrokes, WORLD_SCALE } from "./geometry";

export type TrianglePoints = [THREE.Vector3, THREE.Vector3, THREE.Vector3];
export type IntersectionSegment = { start: THREE.Vector3; end: THREE.Vector3 };

export function sectionRibbons(date: Date) {
  const phase = date.getTime() % 60_000 / 60_000 * Math.PI * 2;
  return timeStrokes(date).map(stroke => {
    const start = new THREE.Vector2(stroke.start.x * WORLD_SCALE, -stroke.start.y * WORLD_SCALE);
    const end = new THREE.Vector2(stroke.end.x * WORLD_SCALE, -stroke.end.y * WORLD_SCALE);
    const center = start.clone().add(end).multiplyScalar(.5);
    const halfLength = start.distanceTo(end) / 2;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const seed = stroke.column * 7 + "abcdefg".indexOf(stroke.name);
    const sections = [-1.35, -.7, 0, .7, 1.35].map(depth => {
      const rotation = angle + depth * (.45 + .27 * Math.sin(seed * 1.37 + phase));
      const centerX = center.x + depth * .12 * Math.sin(seed * 2.17 + phase) + depth ** 2 * .07 * Math.cos(seed * .9 + phase);
      const centerY = center.y + depth * .18 * Math.cos(seed * 1.9 - phase) + depth ** 2 * .05 * Math.sin(seed * 1.3 + phase);
      return [
        new THREE.Vector3(centerX - Math.cos(rotation) * halfLength, centerY - Math.sin(rotation) * halfLength, depth),
        new THREE.Vector3(centerX + Math.cos(rotation) * halfLength, centerY + Math.sin(rotation) * halfLength, depth),
      ];
    });
    const triangles: TrianglePoints[] = sections.slice(1).flatMap((section, index) => [
      [sections[index][0], sections[index][1], section[0]],
      [sections[index][1], section[1], section[0]],
    ] as TrianglePoints[]);
    return { id: stroke.id, triangles, sections };
  });
}

export function intersectTriangles(triangles: TrianglePoints[], plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)): IntersectionSegment[] {
  const segments = new Map<string, IntersectionSegment>();
  for (const triangle of triangles) {
    const points: THREE.Vector3[] = [];
    const add = (point: THREE.Vector3) => {
      if (!points.some(existing => existing.distanceToSquared(point) < 1e-14)) points.push(point.clone());
    };
    for (let index = 0; index < 3; index++) {
      const start = triangle[index];
      const end = triangle[(index + 1) % 3];
      const from = plane.distanceToPoint(start);
      const to = plane.distanceToPoint(end);
      if (Math.abs(from) < 1e-7) add(start);
      if (from * to < -1e-14) add(start.clone().lerp(end, from / (from - to)));
    }
    if (points.length !== 2 || points[0].distanceToSquared(points[1]) < 1e-14) continue;
    const key = points.map(point => point.toArray().map(value => value.toFixed(6)).join(",")).sort().join("/");
    segments.set(key, { start: points[0], end: points[1] });
  }
  return [...segments.values()];
}
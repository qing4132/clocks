import * as THREE from "three";
import { timeStrokes, WORLD_SCALE } from "./geometry";

export const MIRROR_NORMAL = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2);
export const MIRROR_DEPTH = 1.25;

export function mirrorTime(date: Date) {
  return timeStrokes(date).map(stroke => {
    const reflected = ["a", "b", "f"].includes(stroke.name);
    const targets = [stroke.start, stroke.end].map(point => new THREE.Vector3(point.x * WORLD_SCALE, -point.y * WORLD_SCALE, .035));
    const endpoints = targets.map(point => reflected
      ? new THREE.Vector3(point.x, point.y + MIRROR_DEPTH, -point.y)
      : point.clone());
    return { id: stroke.id, name: stroke.name, reflected, targets, start: endpoints[0], end: endpoints[1] };
  });
}

export function mirrorIntersection(source: THREE.Vector3) {
  const virtual = source.clone().reflect(MIRROR_NORMAL);
  return new THREE.Vector3(virtual.x, virtual.y, -virtual.y);
}
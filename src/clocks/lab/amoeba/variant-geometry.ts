import type { ClockTime } from "../types";
import { polar, smooth, TAU, type Point } from "../ink-200/geometry";

export function sculptedRadius(turns: number, hour: number, minute: number) {
  const hourReach = 30 * Math.exp((Math.cos((turns - hour) * TAU) - 1) * 5);
  const minuteReach = 52 * Math.exp((Math.cos((turns - minute) * TAU) - 1) * 21);
  return 21 + Math.pow(hourReach ** 6 + minuteReach ** 6, 1 / 6);
}

export function sculptedTime(time: ClockTime) {
  const bearings = [...Array.from({ length: 240 }, (_, index) => index / 240), time.hour, time.minute].sort((first, second) => first - second);
  const radius = (turns: number) => sculptedRadius(turns, time.hour, time.minute);
  return {
    outline: bearings.map(turns => polar(radius(turns), turns)),
    hourTip: polar(radius(time.hour) - 9, time.hour),
    minuteTip: polar(radius(time.minute) - 2, time.minute),
    second: polar(94, time.second),
  };
}

function pointAt(center: Point, radius: number, radians: number): Point {
  return { x: center.x + Math.cos(radians) * radius, y: center.y + Math.sin(radians) * radius };
}

function coordinates(point: Point) {
  return `${point.x} ${point.y}`;
}

function circlePath(center: Point, radius: number) {
  return `M ${center.x + radius} ${center.y} a ${radius} ${radius} 0 1 0 ${-2 * radius} 0 a ${radius} ${radius} 0 1 0 ${2 * radius} 0 Z`;
}

export function coalescentTime(time: ClockTime) {
  const hour = polar(38, time.hour);
  const minute = polar(64, time.minute);
  const hourRadius = 20;
  const minuteRadius = 13;
  const distance = Math.hypot(minute.x - hour.x, minute.y - hour.y);
  const join = 1 - smooth((distance - hourRadius - minuteRadius) / 25);
  if (join < 1e-8) {
    const fill = `${circlePath(hour, hourRadius)} ${circlePath(minute, minuteRadius)}`;
    return { hour, minute, fill, edges: fill, neck: "", join: 0, distance };
  }
  const bearing = Math.atan2(minute.y - hour.y, minute.x - hour.x);
  const tangent = Math.acos((hourRadius - minuteRadius) / distance);
  const hourAngle = tangent * join;
  const minuteAngle = Math.PI - (Math.PI - tangent) * join;
  const hourLower = pointAt(hour, hourRadius, bearing + hourAngle);
  const hourUpper = pointAt(hour, hourRadius, bearing - hourAngle);
  const minuteLower = pointAt(minute, minuteRadius, bearing + minuteAngle);
  const minuteUpper = pointAt(minute, minuteRadius, bearing - minuteAngle);
  const handle = Math.min(join * 2.4, Math.hypot(hourLower.x - minuteLower.x, hourLower.y - minuteLower.y) / (hourRadius + minuteRadius));
  const lowerBridge = `C ${coordinates(pointAt(hourLower, hourRadius * handle, bearing + hourAngle - Math.PI / 2))} ${coordinates(pointAt(minuteLower, minuteRadius * handle, bearing + minuteAngle + Math.PI / 2))} ${coordinates(minuteLower)}`;
  const upperBridge = `C ${coordinates(pointAt(minuteUpper, minuteRadius * handle, bearing - minuteAngle - Math.PI / 2))} ${coordinates(pointAt(hourUpper, hourRadius * handle, bearing - hourAngle + Math.PI / 2))} ${coordinates(hourUpper)}`;
  const minuteArc = `A ${minuteRadius} ${minuteRadius} 0 ${minuteAngle > Math.PI / 2 ? 1 : 0} 0 ${coordinates(minuteUpper)}`;
  const hourArc = `A ${hourRadius} ${hourRadius} 0 ${hourAngle < Math.PI / 2 ? 1 : 0} 0 ${coordinates(hourLower)}`;
  return {
    hour, minute, distance, join,
    fill: `M ${coordinates(hourLower)} ${lowerBridge} ${minuteArc} ${upperBridge} ${hourArc} Z`,
    edges: `M ${coordinates(minuteLower)} ${minuteArc} M ${coordinates(hourUpper)} ${hourArc}`,
    neck: `M ${coordinates(hourLower)} ${lowerBridge} M ${coordinates(minuteUpper)} ${upperBridge}`,
  };
}

export const TRANSFER_CENTERS = {
  hour: polar(44, -.135),
  minute: polar(41, .135),
  second: { x: 0, y: 37 },
};

export function carryWindow(elapsed: number, period: number) {
  const relative = elapsed > period - 1.4 ? elapsed - period : elapsed;
  const active = relative >= -1.4 && relative <= 1.8;
  const progress = active ? (relative + 1.4) / 3.2 : 0;
  return { active, progress, strength: active ? Math.sin(progress * Math.PI) ** 2 : 0 };
}

function bezierPoint(start: Point, first: Point, last: Point, end: Point, progress: number): Point {
  const remaining = 1 - progress;
  return {
    x: remaining ** 3 * start.x + 3 * remaining ** 2 * progress * first.x + 3 * remaining * progress ** 2 * last.x + progress ** 3 * end.x,
    y: remaining ** 3 * start.y + 3 * remaining ** 2 * progress * first.y + 3 * remaining * progress ** 2 * last.y + progress ** 3 * end.y,
  };
}

export function transferTime(time: ClockTime) {
  const minute = carryWindow(time.second * 60, 60);
  const hour = carryWindow(time.minute * 3600, 3600);
  const outline = Array.from({ length: 240 }, (_, index) => {
    const turns = index / 240;
    const hourReach = (57 + hour.strength * 3) * Math.exp((Math.cos((turns + .135) * TAU) - 1) * 6);
    const minuteReach = (50 + minute.strength * 3 - hour.strength * 2) * Math.exp((Math.cos((turns - .135) * TAU) - 1) * 6);
    const secondReach = (39 - minute.strength * 5) * Math.exp((Math.cos((turns - .5) * TAU) - 1) * 9);
    return polar(15 + Math.pow(hourReach ** 6 + minuteReach ** 6 + secondReach ** 6, 1 / 6), turns);
  });
  const minuteRoute = (progress: number) => bezierPoint({ x: 0, y: 21 }, { x: 0, y: 7 }, { x: 3, y: -3 }, { x: 25, y: -5 }, progress);
  const hourRoute = (progress: number) => bezierPoint({ x: 20, y: 0 }, { x: 5, y: -12 }, { x: -7, y: -12 }, { x: -22, y: 0 }, progress);
  const trail = (progress: number, route: (fraction: number) => Point) => Array.from({ length: 12 }, (_, index) => route(smooth(Math.max(0, progress - .12 + index / 11 * .12))));
  return {
    outline,
    minute: { ...minute, point: minuteRoute(smooth(minute.progress)), trail: trail(minute.progress, minuteRoute) },
    hour: { ...hour, point: hourRoute(smooth(hour.progress)), trail: trail(hour.progress, hourRoute) },
  };
}

export function viscousRadius(turns: number, second: number) {
  const leading = Math.exp((Math.cos((turns - second) * TAU) - 1) * 28);
  let wake = 0;
  let weight = 0;
  for (let index = 1; index <= 8; index++) {
    const amount = Math.exp(-index / 3);
    wake += amount * Math.exp((Math.cos((turns - second + index * .012) * TAU) - 1) * 28);
    weight += amount;
  }
  return 88 + leading * 7 - wake / weight * 6;
}

export function viscousPoint(radius: number, turns: number, second: number): Point {
  const bearing = turns + (radius < 0 ? .5 : 0);
  return polar(Math.abs(radius) / 96 * viscousRadius(bearing, second), bearing);
}

export function viscousNeedle(time: ClockTime, unit: "hour" | "minute" | "second", tip: number, tail: number) {
  const delay = { hour: .12, minute: .18, second: .2 }[unit];
  const radii = [...Array.from({ length: 49 }, (_, index) => -tail + (tip + tail) * index / 48), 0].sort((first, second) => first - second);
  return radii.map(radius => {
    const distance = Math.max(0, radius / tip);
    const bearing = time[unit] - delay * (1 - distance) ** 2;
    return viscousPoint(radius, bearing, time.second);
  });
}
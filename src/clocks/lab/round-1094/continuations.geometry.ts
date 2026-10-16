import { radialPoint } from "./geometry";

export function loopHand(turns: number, reach: number) {
  return {
    center: radialPoint(reach / 2, turns),
    radius: reach / 2,
    tip: radialPoint(reach, turns),
  };
}

export function splitPinHand(turns: number, reach: number, tail: number, anchorX: number) {
  const anchor = { x: anchorX, y: 0 };
  const tip = radialPoint(reach, turns);
  const distance = Math.hypot(tip.x - anchor.x, tip.y - anchor.y);
  return {
    anchor,
    tip,
    start: {
      x: anchor.x - (tip.x - anchor.x) / distance * tail,
      y: anchor.y - (tip.y - anchor.y) / distance * tail,
    },
  };
}

export function rightAngleHand(turns: number, reach: number, horizontalFirst: boolean) {
  const tip = radialPoint(reach, turns);
  const corner = horizontalFirst ? { x: tip.x, y: 0 } : { x: 0, y: tip.y };
  return { tip, corner, path: `M 0 0 L ${corner.x} ${corner.y} L ${tip.x} ${tip.y}` };
}

export function regardingTick(index: number, minute: number) {
  const anchor = radialPoint(92, index / 60);
  const focus = radialPoint(74, minute);
  const length = index % 5 === 0 ? 10 : 4;
  const distance = Math.hypot(focus.x - anchor.x, focus.y - anchor.y);
  return {
    anchor,
    end: {
      x: anchor.x + (focus.x - anchor.x) / distance * length,
      y: anchor.y + (focus.y - anchor.y) / distance * length,
    },
    focus,
  };
}

export function sharedStem(hour: number, minute: number) {
  const hourTip = radialPoint(50, hour);
  const minuteTip = radialPoint(74, minute);
  return {
    hourTip,
    minuteTip,
    joint: { x: (hourTip.x + minuteTip.x) / 4, y: (hourTip.y + minuteTip.y) / 4 },
  };
}

export function betweenHands(hour: number, minute: number) {
  const span = ((minute - hour) % 1 + 1) % 1;
  const start = radialPoint(99, hour);
  const end = radialPoint(99, hour + span);
  return {
    span,
    path: span < 1e-12 ? "" : `M 0 0 L ${start.x} ${start.y} A 99 99 0 ${span > 0.5 ? 1 : 0} 1 ${end.x} ${end.y} Z`,
  };
}

export function numeralParting(index: number, second: number) {
  const difference = ((second - index / 12 + 1.5) % 1) - 0.5;
  const window = Math.max(0, 1 - (difference / 0.026) ** 2);
  const distance = 4.2 * window ** 2;
  return {
    center: radialPoint(70, index / 12),
    displacement: radialPoint(distance, index / 12 + 0.25),
    distance,
  };
}

export function roundTripPoint(hour: number, minute: number, second: number) {
  const progress = (1 - Math.cos(second * Math.PI * 2)) / 2;
  const distance = progress * 124;
  return distance <= 50
    ? radialPoint(50 - distance, hour)
    : radialPoint(distance - 50, minute);
}
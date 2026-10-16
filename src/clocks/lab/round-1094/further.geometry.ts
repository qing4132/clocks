import { radialPoint, type Point } from "./geometry";

export function plumbHand(turns: number, reach: number) {
  const tip = radialPoint(reach, turns);
  return {
    tip,
    foot: { x: tip.x, y: Math.sqrt(92 ** 2 - tip.x ** 2) },
  };
}

export function spanHands(hour: number, minute: number) {
  return {
    hourTip: radialPoint(50, hour),
    minuteTip: radialPoint(74, minute),
  };
}

export function bypassHand(turns: number, reach: number, clockwise: boolean) {
  const start = radialPoint(-18, turns);
  const exit = radialPoint(18, turns);
  const tip = radialPoint(reach, turns);
  return {
    start,
    exit,
    tip,
    path: `M ${start.x} ${start.y} A 18 18 0 0 ${clockwise ? 1 : 0} ${exit.x} ${exit.y} L ${tip.x} ${tip.y}`,
  };
}

export function faultOffset(second: number, side: -1 | 1) {
  return radialPoint(2 * side, second + 0.25);
}

export function neighborOpacity(index: number, hour: number) {
  const distance = Math.abs(((hour * 12 - index + 18) % 12) - 6);
  return Math.sqrt(Math.max(0, 1 - distance));
}

export function supportedHand(turns: number, reach: number, tail: number, anchor: Point) {
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

export function balancedHand(turns: number, reach: number) {
  return { front: radialPoint(reach, turns), back: radialPoint(-reach, turns) };
}

export function relayTick(index: number, minute: number) {
  const distance = Math.abs(((minute * 60 - index + 90) % 60) - 30);
  const weight = Math.max(0, 1 - distance);
  const rest = index % 5 === 0 ? 82 : 88;
  return {
    weight,
    outer: radialPoint(92, index / 60),
    inner: radialPoint(rest + (10 - rest) * weight, index / 60),
    width: (index % 5 === 0 ? 2.5 : 1) + weight * (index % 5 === 0 ? 0.5 : 2),
  };
}

export function crescentHand(turns: number, reach: number, width: number) {
  const stations = Array.from({ length: 49 }, (_, index) => {
    const progress = index / 48;
    const angle = turns - 0.5 + progress * 0.5;
    return {
      outer: radialPoint(reach + progress * width / 2, angle),
      inner: radialPoint(reach - progress * width / 2, angle),
    };
  });
  const points = [
    ...stations.map((station) => station.outer),
    ...stations.toReversed().map((station) => station.inner),
  ];
  return {
    tip: radialPoint(reach, turns),
    points,
    path: `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} Z`,
  };
}
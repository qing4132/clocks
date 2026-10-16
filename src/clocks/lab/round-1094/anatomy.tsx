import { ClassicFace, INK, RED, type ClockTime } from "../round-1020/shared";
import { radialPoint } from "./geometry";

export { INK, PAPER, RED, SERIF } from "../round-1020/shared";
export type { ClockTime } from "../types";

export type FaceProps = {
  time: ClockTime;
  instanceId: string;
};

export const HANDS = [
  { key: "hour", tip: 50, tail: 10, width: 5, color: INK },
  { key: "minute", tip: 74, tail: 14, width: 3, color: INK },
  { key: "second", tip: 84, tail: 20, width: 1.5, color: RED },
] as const;

export function FixedDial({ time, rim = true, numerals = true, ticks = true }: {
  time: ClockTime;
  rim?: boolean;
  numerals?: boolean;
  ticks?: boolean;
}) {
  return <ClassicFace time={time} showHands={false} showRim={rim} showNumerals={numerals} showTicks={ticks} />;
}

export function Hand({ time, index, color, tip, tail }: {
  time: ClockTime;
  index: 0 | 1 | 2;
  color?: string;
  tip?: number;
  tail?: number;
}) {
  const hand = HANDS[index];
  const first = radialPoint(-(tail ?? hand.tail), time[hand.key]);
  const last = radialPoint(tip ?? hand.tip, time[hand.key]);
  return (
    <line
      data-hand={hand.key}
      x1={first.x}
      y1={first.y}
      x2={last.x}
      y2={last.y}
      stroke={color ?? hand.color}
      strokeWidth={hand.width}
      strokeLinecap="round"
    />
  );
}

export function Hub({ color = INK }: { color?: string }) {
  return <circle r="4" fill={color} />;
}
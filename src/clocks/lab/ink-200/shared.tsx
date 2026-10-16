import type { ReactNode } from "react";
import type { ClockTime } from "../types";
import { pad } from "../shared";
import { INK, PAPER, RED, SERIF, polar } from "./geometry";

export { pad, INK, PAPER, RED, SERIF };
export type FaceProps = { time: ClockTime; variant: number; uid: string };
export const HANDS = [
  { key: "hour", tip: 50, tail: 10, width: 5, color: INK },
  { key: "minute", tip: 74, tail: 14, width: 3, color: INK },
  { key: "second", tip: 84, tail: 20, width: 1.5, color: RED },
] as const;
export function values(time: ClockTime) { return [time.h24, time.minuteValue, time.secondValue]; }
export function fractions(time: ClockTime) { return [time.hour, time.minute, time.second]; }
export function dayFractions(time: ClockTime) { return [time.day, time.minute, time.second]; }

export function Text({ x = 0, y = 0, size = 14, ink = INK, weight = 400, anchor = "middle", opacity = 1, children }: {
  x?: number; y?: number; size?: number; ink?: string; weight?: number; anchor?: "start" | "middle" | "end"; opacity?: number; children: ReactNode;
}) {
  return <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontFamily={SERIF} fontSize={size} fontWeight={weight} fill={ink} opacity={opacity}>{children}</text>;
}

export function Face({ rim = true, radius = 96, children }: { rim?: boolean; radius?: number; children?: ReactNode }) {
  return <g><circle r={radius} fill={PAPER} stroke={rim ? INK : "none"} strokeWidth="3" />{children}</g>;
}

export function Ticks({ radius = 92, minor = 88, major = 82, count = 60, offset = 0, opacity = 1 }: {
  radius?: number; minor?: number; major?: number; count?: number; offset?: number; opacity?: number;
}) {
  return <g opacity={opacity}>{Array.from({ length: count }, (_, index) => {
    const large = index % 5 === 0;
    const start = polar(radius, index / count + offset);
    const end = polar(large ? major : minor, index / count + offset);
    return <line key={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth={large ? 2.5 : 1} strokeLinecap="round" />;
  })}</g>;
}

export function Numerals({ radius = 70, size = 14, offset = 0, count = 12, minute = false }: { radius?: number; size?: number; offset?: number; count?: number; minute?: boolean }) {
  return <g>{Array.from({ length: count }, (_, index) => {
    const position = polar(radius, index / count + offset);
    return <Text key={index} x={position.x} y={position.y} size={size}>{minute ? index * 5 : index || count}</Text>;
  })}</g>;
}

export function Dial({ ticks = true, numerals = true, rim = true }: { ticks?: boolean; numerals?: boolean; rim?: boolean }) {
  return <><Face rim={rim} />{ticks && <Ticks />}{numerals && <Numerals />}</>;
}

export function Hand({ time, unit, tip, tail, ink, width, offset = 0 }: { time: ClockTime; unit: 0 | 1 | 2; tip?: number; tail?: number; ink?: string; width?: number; offset?: number }) {
  const hand = HANDS[unit];
  const start = polar(-(tail ?? hand.tail), time[hand.key] + offset);
  const end = polar(tip ?? hand.tip, time[hand.key] + offset);
  return <line data-hand={hand.key} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={ink ?? hand.color} strokeWidth={width ?? hand.width} strokeLinecap="round" />;
}

export function Hub({ radius = 4 }: { radius?: number }) { return <circle r={radius} fill={INK} />; }
export function AllHands({ time, seconds = true }: { time: ClockTime; seconds?: boolean }) { return <><Hand time={time} unit={0} /><Hand time={time} unit={1} />{seconds && <Hand time={time} unit={2} />}<Hub /></>; }
export function Readout({ time, y = 76, size = 19, seconds = false }: { time: ClockTime; y?: number; size?: number; seconds?: boolean }) { return <Text y={y} size={size}>{pad(time.h24)}:{pad(time.minuteValue)}{seconds ? `:${pad(time.secondValue)}` : ""}</Text>; }
export function SecondDot({ time, radius = 92, size = 2.4 }: { time: ClockTime; radius?: number; size?: number }) { const dot = polar(radius, time.second); return <circle cx={dot.x} cy={dot.y} r={size} fill={RED} />; }
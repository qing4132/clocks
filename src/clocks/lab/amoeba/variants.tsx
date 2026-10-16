"use client";

import { useWallClock } from "../../useWallClock";
import { getClockTime, pad } from "../shared";
import type { ClockTime } from "../types";
import { HANDS, Hub, INK, PAPER, RED, Numerals, SecondDot, Text, Ticks } from "../ink-200/shared";
import { path } from "../ink-200/geometry";
import type { AmoebaVariant } from "./entry";
import { coalescentTime, sculptedTime, transferTime, TRANSFER_CENTERS, viscousNeedle, viscousPoint } from "./variant-geometry";

export function SculptedFace({ time }: { time: ClockTime }) {
  const geometry = sculptedTime(time);
  return <g>
    <Ticks radius={94} major={91} minor={92.5} />
    <Numerals radius={82} size={12} />
    <path data-sculpted-body d={path(geometry.outline, true)} fill={PAPER} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <circle data-hour-tip cx={geometry.hourTip.x} cy={geometry.hourTip.y} r="3" fill={INK} />
    <circle data-minute-tip cx={geometry.minuteTip.x} cy={geometry.minuteTip.y} r="1.6" fill={INK} />
    <circle cx={geometry.second.x} cy={geometry.second.y} r="2" fill={RED} />
  </g>;
}

export function CoalescentFace({ time }: { time: ClockTime }) {
  const geometry = coalescentTime(time);
  return <g data-coalescence={geometry.join}>
    <Ticks radius={94} major={91} minor={92.5} />
    <path data-liquid-body d={geometry.fill} fill={PAPER} />
    <path d={geometry.edges} fill="none" stroke={INK} strokeWidth="2" />
    <path data-liquid-neck d={geometry.neck} fill="none" stroke={INK} strokeWidth="2" opacity={Math.min(1, geometry.join * 4)} />
    <Text x={geometry.hour.x} y={geometry.hour.y} size={20}>{pad(time.h24)}</Text>
    <Text x={geometry.minute.x} y={geometry.minute.y} size={13}>{pad(time.minuteValue)}</Text>
    <SecondDot time={time} radius={94} size={2} />
  </g>;
}

export function TransferFace({ time }: { time: ClockTime }) {
  const geometry = transferTime(time);
  return <g data-minute-transfer={geometry.minute.strength} data-hour-transfer={geometry.hour.strength}>
    <path data-transfer-body d={path(geometry.outline, true)} fill={PAPER} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    {[{ packet: geometry.minute, ink: RED, unit: "minute" }, { packet: geometry.hour, ink: INK, unit: "hour" }].map(({ packet, ink, unit }) => <g key={unit} data-flow={unit}>
      <path d={path(packet.trail)} fill="none" stroke={ink} strokeWidth={packet.strength * 9} strokeLinecap="round" />
      <circle cx={packet.point.x} cy={packet.point.y} r={packet.strength * 5.5} fill={ink} />
    </g>)}
    <Text x={TRANSFER_CENTERS.hour.x} y={TRANSFER_CENTERS.hour.y} size={30}>{pad(time.h24)}</Text>
    <Text x={TRANSFER_CENTERS.minute.x} y={TRANSFER_CENTERS.minute.y} size={27}>{pad(time.minuteValue)}</Text>
    <Text x={TRANSFER_CENTERS.second.x} y={TRANSFER_CENTERS.second.y} size={18} ink={RED}>{pad(time.secondValue)}</Text>
  </g>;
}

export function ViscousFace({ time }: { time: ClockTime }) {
  const outline = Array.from({ length: 240 }, (_, index) => viscousPoint(96, index / 240, time.second));
  return <g>
    <path data-viscous-body d={path(outline, true)} fill={PAPER} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    {Array.from({ length: 60 }, (_, index) => <path key={index} d={path([viscousPoint(92, index / 60, time.second), viscousPoint(index % 5 === 0 ? 82 : 88, index / 60, time.second)])} fill="none" stroke={INK} strokeWidth={index % 5 === 0 ? 2.5 : 1} strokeLinecap="round" />)}
    {Array.from({ length: 12 }, (_, index) => {
      const position = viscousPoint(70, index / 12, time.second);
      return <Text key={index} x={position.x} y={position.y}>{index || 12}</Text>;
    })}
    {Array.from({ length: 15 }, (_, index) => <path key={index} d={path([viscousPoint(84, time.second - index * .006, time.second), viscousPoint(84, time.second - (index + 1) * .006, time.second)])} fill="none" stroke={RED} strokeWidth="1" opacity={.28 * (1 - index / 15)} />)}
    {HANDS.map(hand => <path key={hand.key} data-viscous-hand={hand.key} d={path(viscousNeedle(time, hand.key, hand.tip, hand.tail))} fill="none" stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" strokeLinejoin="round" />)}
    <Hub />
  </g>;
}

const renderers = { sculpted: SculptedFace, coalescent: CoalescentFace, transfer: TransferFace, viscous: ViscousFace };

export function AmoebaVariantClock({ id, name, variant }: { id: number; name: string; variant: AmoebaVariant }) {
  const date = useWallClock(20);
  const time = date ? getClockTime(date) : null;
  const Component = renderers[variant];
  const reading = time ? `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}` : "--:--:--";
  return <svg
    viewBox="-100 -100 200 200"
    className="h-72 w-72 sm:h-96 sm:w-96 drop-shadow-xl"
    role="img"
    aria-label={`${name} ${reading}`}
    data-amoeba-variant={id}
    data-rendered-time={date?.getTime()}
  >
    {time && <Component time={time} />}
  </svg>;
}
"use client";

import { useWallClock } from "../../useWallClock";
import { getClockTime, pad } from "../shared";
import { HANDS, Hub, INK, PAPER, Text } from "../ink-200/shared";
import { path } from "../ink-200/geometry";
import { amoebaPoint, amoebaShape, amoebaStroke } from "./geometry";

export function AmoebaFace({ date }: { date: Date }) {
  const time = getClockTime(date);
  const shape = amoebaShape(date.getTime());
  const outline = Array.from({ length: 240 }, (_, index) => amoebaPoint(96, index / 240, shape));

  return <g>
    <path data-amoeba-outline d={path(outline, true)} fill={PAPER} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    {Array.from({ length: 60 }, (_, index) => {
      const major = index % 5 === 0;
      const points = amoebaStroke(92, major ? 82 : 88, index / 60, shape, 4);
      return <path key={index} data-tick={index} d={path(points)} fill="none" stroke={INK} strokeWidth={major ? 2.5 : 1} strokeLinecap="round" />;
    })}
    {Array.from({ length: 12 }, (_, index) => {
      const position = amoebaPoint(70, index / 12, shape);
      return <Text key={index} x={position.x} y={position.y} size={14}>{index || 12}</Text>;
    })}
    {HANDS.map(hand => {
      const points = amoebaStroke(-hand.tail, hand.tip, time[hand.key], shape);
      return <path key={hand.key} data-hand={hand.key} d={path(points)} fill="none" stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" strokeLinejoin="round" />;
    })}
    <Hub />
  </g>;
}

export function AmoebaClock() {
  const now = useWallClock(16);
  const reading = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--";

  return <svg
    viewBox="-100 -100 200 200"
    className="h-72 w-72 sm:h-96 sm:w-96 drop-shadow-xl"
    role="img"
    aria-label={`Amoeba ${reading}`}
    data-amoeba-clock="1532"
    data-rendered-time={now?.getTime()}
  >
    {now && <AmoebaFace date={now} />}
  </svg>;
}
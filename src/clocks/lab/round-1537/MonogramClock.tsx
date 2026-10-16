"use client";

import { useWallClock } from "../../useWallClock";
import { INK, RED } from "../ink-200/shared";
import { monogramSegments } from "./monogram";

export function MonogramFace({ date }: { date: Date }) {
  const segments = monogramSegments(date.getHours(), date.getMinutes());
  const second = (date.getSeconds() + date.getMilliseconds() / 1000) / 60;
  return <g>
    <line x1="0" y1="-64" x2="0" y2="64" stroke={INK} strokeWidth="3.5" strokeLinecap="square" />
    {segments.map((segment, index) => <line key={index} data-quadrant={segment.quadrant} x1={segment.start.x} y1={segment.start.y} x2={segment.end.x} y2={segment.end.y} stroke={INK} strokeWidth="3.5" strokeLinecap="square" />)}
    <circle cy={-64 + second * 128} r="2.5" fill={RED} />
  </g>;
}

export function MonogramClock() {
  const date = useWallClock(100);
  const reading = date ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : "--:--";
  return <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`Single Sign ${reading}`} data-study="1539" data-rendered-time={date?.getTime()}>
    {date && <MonogramFace date={date} />}
  </svg>;
}
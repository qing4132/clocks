"use client";

import { useId } from "react";
import { useWallClock } from "../../useWallClock";
import { INK, PAPER, RED } from "../ink-200/geometry";
import { DIGIT_CENTERS, gapState } from "./geometry";

export function GapsFace({ date, uid }: { date: Date; uid: string }) {
  const state = gapState(date);
  return <g data-gap-progress={state.progress}>
    <rect x="-85" y="-33" width="170" height="66" fill={PAPER} />
    {DIGIT_CENTERS.map(center => <g key={center}>
      <path d={`M ${center - 18} -33 H ${center + 18} V 33 H ${center - 18} Z M ${center - 13.88} -25.88 V 25.88 H ${center + 13.88} V -25.88 Z`} fill={INK} fillRule="evenodd" />
      <rect x={center - 10.12} y="-22.12" width="20.24" height="20.24" fill={INK} />
      <rect x={center - 10.12} y="1.88" width="20.24" height="20.24" fill={INK} />
    </g>)}
    <defs>{state.shutters.map(shutter => <clipPath key={shutter.id} id={`${uid}-${shutter.id}`}>
      <rect x={shutter.x} y={shutter.y} width={shutter.width} height={shutter.height} />
    </clipPath>)}</defs>
    {state.shutters.map(shutter => <g key={shutter.id} clipPath={`url(#${uid}-${shutter.id})`}>
      <rect data-gap-shutter={shutter.id} data-opening={shutter.opening} x={shutter.x + shutter.offsetX} y={shutter.y + shutter.offsetY} width={shutter.width} height={shutter.height} fill={INK} />
    </g>)}
    <circle cy="-7" r="1.8" fill={RED} />
    <circle cy="7" r="1.8" fill={RED} />
    <circle cx={-80 + (date.getSeconds() + date.getMilliseconds() / 1000) / 60 * 160} cy="44" r="1.4" fill={RED} />
  </g>;
}

export function GapsClock() {
  const date = useWallClock(20);
  const uid = useId().replaceAll(":", "");
  const reading = date ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : "--:--";
  return <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`Interstices ${reading}`} data-relation-clock="1545" data-rendered-time={date?.getTime()}>
    {date && <GapsFace date={date} uid={uid} />}
  </svg>;
}
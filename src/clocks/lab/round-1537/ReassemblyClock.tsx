"use client";

import { useWallClock } from "../../useWallClock";
import { INK, RED } from "../ink-200/shared";
import { reassemblyState, rodEndpoints } from "./reassembly";

export function ReassemblyFace({ date }: { date: Date }) {
  const state = reassemblyState(date);
  return <g data-reassembly={state.progress}>
    {state.rods.map(rod => {
      const { start, end } = rodEndpoints(rod);
      return <line key={rod.id} data-rod={rod.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth="3.2" strokeLinecap="square" />;
    })}
    <circle cy="-7" r="1.8" fill={RED} />
    <circle cy="7" r="1.8" fill={RED} />
  </g>;
}

export function ReassemblyClock() {
  const date = useWallClock(20);
  const reading = date ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : "--:--";
  return <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`Reassembly ${reading}`} data-study="1537" data-rendered-time={date?.getTime()}>
    {date && <ReassemblyFace date={date} />}
  </svg>;
}
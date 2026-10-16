"use client";

import { useId } from "react";
import { useWallClock } from "../../useWallClock";
import { getClockTime, pad } from "../shared";
import type { Family } from "./catalog";
import type { FaceProps } from "./shared";
import { DialsFace, TypeFace } from "./type-dials";
import { RadialFace, TracksFace } from "./tracks-radial";
import { InstrumentsFace, TilesFace } from "./tiles-instruments";
import { CurvesFace, PaperFace } from "./curves-paper";
import { CalendarFace, SignalsFace } from "./signals-calendar";
import { ArithmeticFace, BinaryFace } from "./binary-arithmetic";
import { ArchitectureFace, OrbitsFace } from "./orbits-architecture";
import { ContoursFace, WavesFace } from "./waves-contours";
import { LatticesFace, OpticsFace } from "./lattices-optics";
import { IntervalsFace, MotionFace } from "./motion-intervals";

const renderers: Record<Family, (props: FaceProps) => React.ReactNode> = {
  type: TypeFace, dials: DialsFace, tracks: TracksFace, radial: RadialFace, tiles: TilesFace, instruments: InstrumentsFace,
  curves: CurvesFace, paper: PaperFace,
  signals: SignalsFace, calendar: CalendarFace,
  binary: BinaryFace, arithmetic: ArithmeticFace,
  orbits: OrbitsFace, architecture: ArchitectureFace,
  waves: WavesFace, contours: ContoursFace,
  lattices: LatticesFace, optics: OpticsFace,
  motion: MotionFace, intervals: IntervalsFace,
};
export const implementedFamilies = Object.keys(renderers) as Family[];

export function OpenClock({ family, variant, id, name }: { family: Family; variant: number; id: number; name: string }) {
  const now = useWallClock(100);
  const uid = useId().replaceAll(":", "");
  const time = now ? getClockTime(now) : null;
  const Face = renderers[family];
  const reading = time ? `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}` : "--:--:--";
  return (
    <svg viewBox="0 0 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`${name}: ${reading}`} data-open-clock={id} data-family={family}>
      {time && Face ? <Face time={time} variant={variant} uid={uid} /> : null}
    </svg>
  );
}
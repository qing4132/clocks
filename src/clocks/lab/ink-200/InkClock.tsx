"use client";

import { useId, type ComponentType } from "react";
import { useWallClock } from "../../useWallClock";
import { getClockTime, pad } from "../shared";
import type { Family } from "./catalog";
import type { FaceProps } from "./shared";
import { HingesFace, NeedlesFace } from "./needles-hinges";
import { RimsFace, TicksFace, WindowsFace } from "./dial-parts";
import { StencilsFace, TypographyFace } from "./type-stencils";
import { NumeralsFace } from "./numerals";
import { AbsenceFace, SecondsFace } from "./absence-seconds";
import { CadenceFace, RulersFace } from "./cadence-rulers";
import { CompassesFace, DuetsFace } from "./compasses-duets";
import { PolygonsFace, SweepsFace } from "./polygons-sweeps";
import { CountsFace, PathsFace } from "./paths-counts";
import { CivilFace, IntervalsFace } from "./civil-intervals";

const renderers: Record<Family, ComponentType<FaceProps>> = {
  needles: NeedlesFace, hinges: HingesFace, ticks: TicksFace, rims: RimsFace, windows: WindowsFace,
  typography: TypographyFace, stencils: StencilsFace, numerals: NumeralsFace, absence: AbsenceFace, seconds: SecondsFace,
  cadence: CadenceFace, rulers: RulersFace, compasses: CompassesFace, duets: DuetsFace,
  polygons: PolygonsFace, sweeps: SweepsFace,
  paths: PathsFace, counts: CountsFace,
  civil: CivilFace, intervals: IntervalsFace,
};
export const implementedFamilies = Object.keys(renderers) as Family[];

export function InkClock({ id, name, family, variant }: { id: number; name: string; family: Family; variant: number }) {
  const now = useWallClock(100);
  const uid = useId().replaceAll(":", "");
  const time = now ? getClockTime(now) : null;
  const Component = renderers[family];
  const reading = time ? `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}` : "--:--:--";
  return <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96 drop-shadow-xl" role="img" aria-label={`${name} ${reading}`} data-ink-clock={id} data-family={family}>
    {time ? <Component time={time} variant={variant} uid={uid} /> : null}
  </svg>;
}
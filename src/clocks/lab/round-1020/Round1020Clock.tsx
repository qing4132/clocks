"use client";

import { useWallClock } from "../../useWallClock";
import { getClockTime } from "../shared";
import { setARenderers } from "./set-a.renderers";
import { setBRenderers } from "./set-b.renderers";
import { setCRenderers } from "./set-c.renderers";
import { setDRenderers } from "./set-d.renderers";
import { setERenderers } from "./set-e.renderers";
import { tripleEclipseRenderers } from "./triple-eclipse";
import type { StudyRenderer } from "./shared";

const renderers: Record<number, StudyRenderer> = {
  ...setARenderers,
  ...setBRenderers,
  ...setCRenderers,
  ...setDRenderers,
  ...setERenderers,
  ...tripleEclipseRenderers,
};

export function Round1020Clock({ id, name }: { id: number; name: string }) {
  const now = useWallClock(50);
  const Renderer = renderers[id];

  return (
    <svg
      viewBox="-110 -110 220 220"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label={`${name} psychedelic clock study`}
    >
      {now && Renderer ? <Renderer time={getClockTime(now)} /> : null}
    </svg>
  );
}

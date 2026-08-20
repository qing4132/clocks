"use client";

import { useWallClock } from "../useWallClock";
import { INK, PAPER, getClockTime } from "./shared";
import { renderExperiment } from "./renderers";
import type { LabExperiment } from "./types";

export function ExperimentalClock({ design }: { design: LabExperiment }) {
  const now = useWallClock(50);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96"
      role="img"
      aria-label={`${design.nameEn} clock experiment`}
    >
      <circle cx="0" cy="0" r="96" fill={PAPER} />
      {now ? renderExperiment(design.id, getClockTime(now)) : null}
      <circle cx="0" cy="0" r="96" fill="none" stroke={INK} strokeWidth="0.75" opacity="0.12" />
    </svg>
  );
}
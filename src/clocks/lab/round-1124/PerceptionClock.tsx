"use client";

import { useId, type ComponentType } from "react";
import { useWallClock } from "../../useWallClock";
import { getClockTime, pad } from "../shared";
import { PhantomFace, ReversibleFace, WeaveFace, type PerceptionProps } from "./spatial";
import { FieldClock } from "./FieldClock";
import type { FieldKind } from "./fields";
import { BlindSpotFace, NestedTimeFace } from "./attention";

const faces: Record<number, ComponentType<PerceptionProps>> = {
  1124: WeaveFace,
  1125: ReversibleFace,
  1126: PhantomFace,
  1130: NestedTimeFace,
  1131: BlindSpotFace,
};
const fields: Record<number, FieldKind> = { 1127: "organic", 1128: "caustic", 1129: "stress" };

export function PerceptionClock({ id, name }: { id: number; name: string }) {
  const now = useWallClock(fields[id] ? 100 : 50);
  const instanceId = useId().replaceAll(":", "");
  const Face = faces[id];
  const time = now ? getClockTime(now) : null;
  const reading = time ? `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}` : "--:--:--";

  if (fields[id]) return <FieldClock kind={fields[id]} time={time} id={id} name={name} />;

  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`${name}: ${reading}`} data-perception={id}>
      {time && Face ? <Face time={time} instanceId={instanceId} /> : null}
    </svg>
  );
}
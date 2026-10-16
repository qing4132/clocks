"use client";

import { useId, type ComponentType } from "react";
import { useWallClock } from "../../useWallClock";
import { getClockTime, pad } from "../shared";
import { FixedDial, Hub, type FaceProps } from "./anatomy";
import { BorrowedNumeralFace, OpenRimFace, StillHourFace } from "./quiet";
import { CourtesyFace, CrosswiseFace, HandInHandFace, InwardFace, WanderingPivotFace } from "./relations";
import { CutoutFace, TwoSidesFace } from "./figure-ground";
import { CommonStemFace, DistantFace, LoopFace, RightAngleFace, SplitPinFace } from "./open-hands";
import { InboardFace, PartingFace, RegardFace } from "./attentive-dial";
import { InterspaceFace, RoundTripFace } from "./held-space";
import { BypassFace, CarrierFace, CounterpoiseFace, CrescentFace, PlumbFace, SpanFace } from "./suspended";
import { CancellationFace, FaultFace, HandoverFace, NeighborsFace } from "./nearby";

const renderers: Record<number, ComponentType<FaceProps>> = {
  1094: OpenRimFace,
  1095: InwardFace,
  1096: HandInHandFace,
  1097: CourtesyFace,
  1098: WanderingPivotFace,
  1099: TwoSidesFace,
  1100: CrosswiseFace,
  1101: StillHourFace,
  1102: BorrowedNumeralFace,
  1103: CutoutFace,
  1104: LoopFace,
  1105: SplitPinFace,
  1106: RightAngleFace,
  1107: RegardFace,
  1108: CommonStemFace,
  1109: DistantFace,
  1110: InterspaceFace,
  1111: InboardFace,
  1112: PartingFace,
  1113: RoundTripFace,
  1114: PlumbFace,
  1115: SpanFace,
  1116: BypassFace,
  1117: FaultFace,
  1118: NeighborsFace,
  1119: CarrierFace,
  1120: CounterpoiseFace,
  1121: CancellationFace,
  1122: HandoverFace,
  1123: CrescentFace,
};
const STATIC_TIME = getClockTime(new Date(0));

export function BackTo001Clock({ id, name }: { id: number; name: string }) {
  const now = useWallClock(40);
  const instanceId = useId().replaceAll(":", "");
  const time = now ? getClockTime(now) : null;
  const Face = renderers[id];
  const reading = time ? `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}` : "--:--:--";

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 sm:h-96 sm:w-96 drop-shadow-xl"
      role="img"
      aria-label={`${name}: ${reading}`}
      data-study={id}
    >
      {time && Face ? <Face time={time} instanceId={instanceId} /> : <><FixedDial time={STATIC_TIME} /><Hub /></>}
    </svg>
  );
}
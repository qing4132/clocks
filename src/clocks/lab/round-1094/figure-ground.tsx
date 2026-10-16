import { ClassicFace } from "../round-1020/shared";
import { FixedDial, Hand, Hub, INK, PAPER, type FaceProps } from "./anatomy";

export function TwoSidesFace({ time, instanceId }: FaceProps) {
  const halfId = `${instanceId}-other-side`;
  return (
    <g>
      <defs>
        <clipPath id={halfId} clipPathUnits="userSpaceOnUse">
          <path d="M 0 -98 A 98 98 0 0 1 0 98 Z" transform={`rotate(${time.second * 360})`} />
        </clipPath>
      </defs>
      <ClassicFace time={time} />
      <g clipPath={`url(#${halfId})`}>
        <ClassicFace
          time={time}
          faceFill={INK}
          tickColor={() => PAPER}
          numeralColor={() => PAPER}
          hourColor={PAPER}
          minuteColor={PAPER}
        />
        <Hub color={PAPER} />
      </g>
    </g>
  );
}

export function CutoutFace({ time, instanceId }: FaceProps) {
  const maskId = `${instanceId}-absent-hands`;
  const edgeId = `${instanceId}-cut-edges`;
  return (
    <g>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
          <rect x="-100" y="-100" width="200" height="200" fill="white" />
          <Hand time={time} index={0} color="black" />
          <Hand time={time} index={1} color="black" />
          <Hub color="black" />
        </mask>
        <filter id={edgeId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="1" dy="1.3" stdDeviation="0.8" floodColor={INK} floodOpacity="0.72" />
        </filter>
      </defs>
      <g filter={`url(#${edgeId})`}>
        <g mask={`url(#${maskId})`}>
          <FixedDial time={time} />
        </g>
      </g>
      <Hand time={time} index={2} />
    </g>
  );
}
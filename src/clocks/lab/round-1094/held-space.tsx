import { ClassicFace } from "../round-1020/shared";
import { FixedDial, Hand, Hub, INK, PAPER, RED, type FaceProps } from "./anatomy";
import { betweenHands, roundTripPoint } from "./continuations.geometry";

export function InterspaceFace({ time, instanceId }: FaceProps) {
  const aperture = betweenHands(time.hour, time.minute);
  const apertureId = `${instanceId}-between-hands`;
  return (
    <g>
      <defs>
        <clipPath id={apertureId} clipPathUnits="userSpaceOnUse">
          <path d={aperture.path} />
        </clipPath>
      </defs>
      <ClassicFace time={time} faceFill={INK} tickColor={() => PAPER} numeralColor={() => PAPER} hourColor={PAPER} minuteColor={PAPER} />
      <Hub color={PAPER} />
      <g clipPath={`url(#${apertureId})`} data-between-span={aperture.span}>
        <ClassicFace time={time} />
      </g>
    </g>
  );
}

export function RoundTripFace({ time }: FaceProps) {
  const point = roundTripPoint(time.hour, time.minute, time.second);
  return (
    <g>
      <FixedDial time={time} />
      <Hand time={time} index={0} />
      <Hand time={time} index={1} />
      <Hub />
      <circle data-round-trip="true" cx={point.x} cy={point.y} r="3.3" fill={RED} stroke={PAPER} strokeWidth="1.1" />
    </g>
  );
}
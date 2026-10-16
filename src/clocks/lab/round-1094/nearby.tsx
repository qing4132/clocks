import { ClassicFace } from "../round-1020/shared";
import { FixedDial, Hand, Hub, INK, PAPER, SERIF, type FaceProps } from "./anatomy";
import { faultOffset, neighborOpacity, relayTick } from "./further.geometry";
import { radialPoint } from "./geometry";

export function FaultFace({ time, instanceId }: FaceProps) {
  return (
    <g>
      {([-1, 1] as const).map((side) => {
        const clipId = `${instanceId}-fault-${side}`;
        const offset = faultOffset(time.second, side);
        return (
          <g key={side} data-fault-side={side} transform={`translate(${offset.x} ${offset.y})`}>
            <defs>
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                <rect x={side === -1 ? -110 : 0} y="-110" width="110" height="220" transform={`rotate(${time.second * 360})`} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <ClassicFace time={time} secondColor="transparent" />
            </g>
          </g>
        );
      })}
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function NeighborsFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} numerals={false} />
      {Array.from({ length: 12 }, (_, index) => {
        const point = radialPoint(70, index / 12);
        return <text key={index} data-neighbor={index || 12} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="14" fill={INK} opacity={neighborOpacity(index, time.hour)}>{index || 12}</text>;
      })}
      <Hand time={time} index={0} />
      <Hand time={time} index={1} />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function CancellationFace({ time, instanceId }: FaceProps) {
  const hourMask = `${instanceId}-cancel-hour`;
  const minuteMask = `${instanceId}-cancel-minute`;
  const hourTip = radialPoint(50, time.hour);
  const minuteTip = radialPoint(74, time.minute);
  return (
    <g>
      <defs>
        <mask id={hourMask} maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
          <rect x="-100" y="-100" width="200" height="200" fill="white" />
          <Hand time={time} index={1} color="black" />
        </mask>
        <mask id={minuteMask} maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
          <rect x="-100" y="-100" width="200" height="200" fill="white" />
          <Hand time={time} index={0} color="black" />
        </mask>
      </defs>
      <FixedDial time={time} />
      <g mask={`url(#${hourMask})`} data-cancel-hand="hour"><Hand time={time} index={0} /></g>
      <g mask={`url(#${minuteMask})`} data-cancel-hand="minute"><Hand time={time} index={1} /></g>
      <circle cx={hourTip.x} cy={hourTip.y} r="2.8" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <circle cx={minuteTip.x} cy={minuteTip.y} r="1.9" fill={INK} />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function HandoverFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} ticks={false} />
      {Array.from({ length: 60 }, (_, index) => {
        const tick = relayTick(index, time.minute);
        return <line key={index} data-relay-tick={index} data-reach-weight={tick.weight} x1={tick.outer.x} y1={tick.outer.y} x2={tick.inner.x} y2={tick.inner.y} stroke={INK} strokeWidth={tick.width} strokeLinecap="round" />;
      })}
      <Hand time={time} index={0} />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}
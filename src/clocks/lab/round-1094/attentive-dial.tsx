import { FixedDial, Hand, Hub, INK, PAPER, SERIF, type FaceProps } from "./anatomy";
import { numeralParting, regardingTick } from "./continuations.geometry";
import { radialPoint } from "./geometry";

export function RegardFace({ time }: FaceProps) {
  const focus = radialPoint(74, time.minute);
  return (
    <g>
      <FixedDial time={time} ticks={false} />
      {Array.from({ length: 60 }, (_, index) => {
        const tick = regardingTick(index, time.minute);
        return <line key={index} data-regarding-tick={index} x1={tick.anchor.x} y1={tick.anchor.y} x2={tick.end.x} y2={tick.end.y} stroke={INK} strokeWidth={index % 5 === 0 ? 2.5 : 1} strokeLinecap="round" />;
      })}
      <Hand time={time} index={0} />
      <circle data-minute-focus="true" cx={focus.x} cy={focus.y} r="2.4" fill={INK} stroke={PAPER} strokeWidth="0.8" />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function InboardFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} ticks={false} numerals={false} />
      {Array.from({ length: 60 }, (_, index) => {
        const major = index % 5 === 0;
        const outer = radialPoint(51, index / 60);
        const inner = radialPoint(major ? 42 : 47, index / 60);
        return <line key={index} data-inboard-tick={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={INK} strokeWidth={major ? 2 : 0.8} strokeLinecap="round" />;
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const point = radialPoint(32, index / 12);
        return <text key={index} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="11" fill={INK}>{index || 12}</text>;
      })}
      <Hand time={time} index={0} />
      <Hand time={time} index={1} />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function PartingFace({ time, instanceId }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} numerals={false} />
      {Array.from({ length: 12 }, (_, index) => {
        const state = numeralParting(index, time.second);
        const leftId = `${instanceId}-parting-${index}-left`;
        const rightId = `${instanceId}-parting-${index}-right`;
        const numeral = (
          <text textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="14" fill={INK}>{index || 12}</text>
        );
        return (
          <g key={index} transform={`translate(${state.center.x} ${state.center.y})`} data-parting-numeral={index || 12}>
            <defs>
              <clipPath id={leftId} clipPathUnits="userSpaceOnUse">
                <rect x="-24" y="-24" width="24" height="48" transform={`rotate(${index * 30})`} />
              </clipPath>
              <clipPath id={rightId} clipPathUnits="userSpaceOnUse">
                <rect x="0" y="-24" width="24" height="48" transform={`rotate(${index * 30})`} />
              </clipPath>
            </defs>
            <g transform={`translate(${-state.displacement.x} ${-state.displacement.y})`}>
              <g clipPath={`url(#${leftId})`}>{numeral}</g>
            </g>
            <g transform={`translate(${state.displacement.x} ${state.displacement.y})`}>
              <g clipPath={`url(#${rightId})`}>{numeral}</g>
            </g>
          </g>
        );
      })}
      <Hand time={time} index={0} />
      <Hand time={time} index={1} />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}
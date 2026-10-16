import { ClassicFace } from "../round-1020/shared";
import { FixedDial, Hand, Hub, INK, PAPER, RED, SERIF, type FaceProps } from "./anatomy";
import { openRim, radialPoint, stillHourMap } from "./geometry";

export function OpenRimFace({ time }: FaceProps) {
  const marker = radialPoint(96, time.second);
  return (
    <g>
      <FixedDial time={time} rim={false} />
      <path d={openRim(time.second)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx={marker.x} cy={marker.y} r="1.4" fill={RED} />
      <Hand time={time} index={0} />
      <Hand time={time} index={1} />
      <Hub />
    </g>
  );
}

export function StillHourFace({ time }: FaceProps) {
  return <ClassicFace time={time} map={(radius, turns) => stillHourMap(radius, turns, time.hour)} />;
}

export function BorrowedNumeralFace({ time }: FaceProps) {
  const active = radialPoint(50, time.hour);
  return (
    <g>
      <FixedDial time={time} numerals={false} />
      {Array.from({ length: 12 }, (_, index) => {
        if (index === time.h12) return null;
        const point = radialPoint(70, index / 12);
        return <text key={index} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="14" fill={INK}>{index || 12}</text>;
      })}
      <Hand time={time} index={1} />
      <Hand time={time} index={2} />
      <Hub />
      <text
        data-hour-numeral="true"
        x={active.x}
        y={active.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={SERIF}
        fontSize="18"
        fill={INK}
        stroke={PAPER}
        strokeWidth="2.5"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {time.h12 || 12}
      </text>
    </g>
  );
}
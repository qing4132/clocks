import { ClassicFace, INK, PAPER, RED } from "../round-1020/shared";
import type { ClockTime } from "../types";
import { bearing, weaveGeometry } from "./geometry";

export type PerceptionProps = { time: ClockTime; instanceId: string };

export function WeaveFace({ time, instanceId }: PerceptionProps) {
  const state = weaveGeometry(time.hour, time.minute, time.second);
  const colors = [INK, "#285a97", RED];
  const widths = [8, 6, 4];

  return (
    <g>
      <ClassicFace time={time} showHands={false} />
      {state.rings.map((ring, index) => <circle key={index} data-weave-ring={index} cx={ring.center.x} cy={ring.center.y} r={ring.radius} stroke={colors[index]} strokeWidth={widths[index]} fill="none" />)}
      {state.crossings.map(({ over, under, point }) => {
        const clipId = `${instanceId}-weave-${over}`;
        const ring = state.rings[over];
        return (
          <g key={over} data-weave-over={over} data-weave-under={under}>
            <defs><clipPath id={clipId}><circle cx={point.x} cy={point.y} r="10" /></clipPath></defs>
            <g clipPath={`url(#${clipId})`}>
              <circle cx={ring.center.x} cy={ring.center.y} r={ring.radius} fill="none" stroke={PAPER} strokeWidth={widths[over] + 4} />
              <circle cx={ring.center.x} cy={ring.center.y} r={ring.radius} fill="none" stroke={colors[over]} strokeWidth={widths[over]} />
              <circle cx={ring.center.x} cy={ring.center.y} r={ring.radius - widths[over] / 3} fill="none" stroke="white" strokeWidth="0.6" opacity="0.48" />
            </g>
          </g>
        );
      })}
      {state.rings.map((ring, index) => <circle key={index} data-weave-tip={index} cx={ring.tip.x} cy={ring.tip.y} r={index === 2 ? 2.5 : 3.3} fill={colors[index]} stroke={PAPER} strokeWidth="1.3" />)}
      <circle r="5.3" fill={INK} />
    </g>
  );
}

const PRISM_VERTICES = Array.from({ length: 12 }, (_, index) => bearing(84, index / 12));
const PRISM_PATH = `${PRISM_VERTICES.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} Z`;

export function ReversibleFace({ time }: PerceptionProps) {
  return (
    <g>
      <circle r="97" fill="#f3f6f1" />
      <g data-ambiguous-prism="true" fill="none" stroke="#394f54" strokeWidth="1.25" strokeLinejoin="round">
        <path d={PRISM_PATH} transform="translate(-8 8)" />
        <path d={PRISM_PATH} transform="translate(8 -8)" />
        {PRISM_VERTICES.map((point, index) => <line key={index} x1={point.x - 8} y1={point.y + 8} x2={point.x + 8} y2={point.y - 8} />)}
      </g>
      <g transform="translate(-8 8) scale(.82)">
        <ClassicFace time={time} showFace={false} showRim={false} tickColor={() => "#394f54"} numeralColor={() => "#253d41"} />
      </g>
    </g>
  );
}

const INDUCTION_GRID = Array.from({ length: 15 }, (_, row) => Array.from({ length: 15 }, (_, column) => {
  const centerX = (column - 7) * 9;
  const centerY = (row - 7) * 9;
  return Math.hypot(centerX, centerY) < 66
    ? `M ${centerX - 3.7} ${centerY} h 7.4 M ${centerX} ${centerY - 3.7} v 7.4`
    : "";
}).join(" ")).join(" ");

export function PhantomFace({ time, instanceId }: PerceptionProps) {
  const hands = [
    { name: "hour", turns: time.hour, reach: 49, width: 17, color: "#eb336b" },
    { name: "minute", turns: time.minute, reach: 65, width: 13, color: "#006bc7" },
  ];
  const secondTip = bearing(89, time.second);
  const secondTail = bearing(82, time.second);

  return (
    <g>
      <ClassicFace time={time} showHands={false} showNumerals={false} faceFill="#ffffff" />
      {Array.from({ length: 12 }, (_, index) => {
        const point = bearing(78, index / 12);
        return <text key={index} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" fill={INK}>{index || 12}</text>;
      })}
      <path d={INDUCTION_GRID} fill="none" stroke="#303236" strokeWidth="0.9" />
      {hands.map((hand) => {
        const clipId = `${instanceId}-phantom-${hand.name}`;
        return (
          <g key={hand.name} data-phantom-hand={hand.name}>
            <defs>
              <clipPath id={clipId}>
                <path d={`M ${-hand.width / 2} 7 V ${-hand.reach + 10} L 0 ${-hand.reach} L ${hand.width / 2} ${-hand.reach + 10} V 7 Z`} transform={`rotate(${hand.turns * 360})`} />
              </clipPath>
            </defs>
            <path d={INDUCTION_GRID} fill="none" stroke={hand.color} strokeWidth="0.9" clipPath={`url(#${clipId})`} data-colored-inducers={hand.name} />
          </g>
        );
      })}
      <line x1={secondTail.x} y1={secondTail.y} x2={secondTip.x} y2={secondTip.y} stroke={RED} strokeWidth="2" strokeLinecap="round" />
      <circle r="1.6" fill={INK} />
    </g>
  );
}
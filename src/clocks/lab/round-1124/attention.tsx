import { INK, RED } from "../round-1020/shared";
import { pad } from "../shared";
import { bearing } from "./geometry";
import type { PerceptionProps } from "./spatial";

export function NestedTimeFace({ time, instanceId }: PerceptionProps) {
  const hourMask = `${instanceId}-macro-hour`;
  const secondsClip = `${instanceId}-micro-second`;
  const minuteLine = Array.from({ length: 12 }, () => pad(time.minuteValue)).join(" ");
  const rows = Array.from({ length: 24 }, (_, index) => index);
  const microtype = rows.map((row) => (
    <text key={row} x="-90" y={-77 + row * 6.7} fontFamily="var(--font-geist-mono), ui-monospace, monospace" fontSize="5.8" fontWeight="500" textLength="180" lengthAdjust="spacingAndGlyphs">{minuteLine}</text>
  ));

  return (
    <g>
      <rect x="-96" y="-96" width="192" height="192" fill="#e9edaa" />
      <defs>
        <mask id={hourMask} maskUnits="userSpaceOnUse" x="-96" y="-96" width="192" height="192">
          <rect x="-96" y="-96" width="192" height="192" fill="black" />
          <text x="0" y="-26" textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="154" textLength="178" lengthAdjust="spacingAndGlyphs" fill="white" data-macro-hour={pad(time.h24)}>{pad(time.h24)}</text>
        </mask>
        <clipPath id={secondsClip}><rect x={-94 + time.second * 188} y="-94" width="9" height="188" /></clipPath>
      </defs>
      <g mask={`url(#${hourMask})`} data-micro-minute={pad(time.minuteValue)}>
        <g fill={INK}>{microtype}</g>
        <g fill={RED} clipPath={`url(#${secondsClip})`}>{microtype}</g>
      </g>
    </g>
  );
}

const MOVING_GRID = Array.from({ length: 17 }, (_, row) => Array.from({ length: 17 }, (_, column) => {
  const centerX = (column - 8) * 13;
  const centerY = (row - 8) * 13;
  return `M ${centerX - 2.1} ${centerY} h 4.2 M ${centerX} ${centerY - 2.1} v 4.2`;
}).join(" ")).join(" ");

export function BlindSpotFace({ time, instanceId }: PerceptionProps) {
  const clipId = `${instanceId}-moving-grid`;
  const rotation = (time.date.getTime() % 120_000) / 120_000 * 360;
  const secondTip = bearing(92, time.second);
  const secondTail = bearing(84, time.second);

  return (
    <g>
      <circle r="97" fill="#0b0d13" stroke="#27375a" strokeWidth="1" />
      <defs><clipPath id={clipId}><circle r="81" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        <path data-motion-grid="true" d={MOVING_GRID} transform={`rotate(${rotation})`} fill="none" stroke="#215cbd" strokeWidth="1.15" />
      </g>
      {Array.from({ length: 12 }, (_, index) => {
        const point = bearing(90, index / 12);
        return <text key={index} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, 'Times New Roman', serif" fontSize="9" fill="#c3c9d6">{index || 12}</text>;
      })}
      {[
        { name: "hour", turns: time.hour, reach: 49, width: 2.4, radius: 3.4 },
        { name: "minute", turns: time.minute, reach: 70, width: 1.3, radius: 2.8 },
      ].map((hand) => {
        const tip = bearing(hand.reach, hand.turns);
        return (
          <g key={hand.name} data-always-drawn={hand.name} opacity="1">
            <line x1="0" y1="0" x2={tip.x} y2={tip.y} stroke="#f9df39" strokeWidth={hand.width} strokeLinecap="round" />
            <circle cx={tip.x} cy={tip.y} r={hand.radius} fill="#f9df39" />
          </g>
        );
      })}
      <line x1={secondTail.x} y1={secondTail.y} x2={secondTip.x} y2={secondTip.y} stroke="#f24a64" strokeWidth="2" strokeLinecap="round" />
      <circle r="2.3" fill="#ff6452" data-fixation="true" />
    </g>
  );
}
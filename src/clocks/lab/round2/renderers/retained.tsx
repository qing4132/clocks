import type { ReactNode } from "react";
import {
  BLUE,
  GOLD,
  INK,
  PALE,
  PAPER,
  RED,
  TAU,
  arcPath,
  hash,
  pad,
  pathFrom,
  polar,
  round,
} from "../../shared";
import type { ClockTime } from "../../types";

function RadicalCenter({ t }: { t: ClockTime }) {
  const centers = [polar(61, t.hour), polar(70, t.minute), polar(79, t.second)];
  const target = {
    x: round(centers[0].x * 0.5 + centers[1].x * 0.32 + centers[2].x * 0.18),
    y: round(centers[0].y * 0.5 + centers[1].y * 0.32 + centers[2].y * 0.18),
  };
  const colors = [INK, BLUE, RED];

  return (
    <>
      {centers.map((center, index) => {
        const radius = Math.hypot(center.x - target.x, center.y - target.y);
        return (
          <circle
            key={index}
            cx={center.x}
            cy={center.y}
            r={round(radius)}
            fill="none"
            stroke={colors[index]}
            strokeWidth={index === 2 ? 1.3 : 0.8}
            opacity="0.65"
          />
        );
      })}
      <path d={pathFrom(centers, true)} fill="none" stroke={PALE} />
      {centers.map((center, index) => (
        <circle key={index} cx={center.x} cy={center.y} r="3" fill={colors[index]} />
      ))}
      <circle cx={target.x} cy={target.y} r="5" fill={RED} stroke={PAPER} strokeWidth="2" />
    </>
  );
}

function Palimpsest({ t }: { t: ClockTime }) {
  return (
    <>
      {Array.from({ length: 12 }, (_, index) => {
        const date = new Date(t.date.getTime() - (11 - index) * 60_000);
        const text = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        return (
          <text
            key={index}
            x={round((hash(index * 13) - 0.5) * 18)}
            y={round(7 + (hash(index * 19) - 0.5) * 20)}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="35"
            fill={index === 11 ? RED : INK}
            opacity={0.04 + index / 15}
            transform={`rotate(${round((hash(index * 29) - 0.5) * 9)})`}
          >
            {text}
          </text>
        );
      })}
      <rect x="-76" y="-49" width="152" height="98" fill="none" stroke={INK} strokeWidth="0.6" />
    </>
  );
}

function TrafficSignal({ t }: { t: ClockTime }) {
  const phase = t.secondValue < 35 ? 0 : t.secondValue < 40 ? 1 : 2;
  const boundaries = [35, 40, 60];
  const start = phase === 0 ? 0 : boundaries[phase - 1];
  const progress = (t.secondValue + t.ms / 1000 - start) / (boundaries[phase] - start);
  const colors = ["#2f7d4a", GOLD, RED];

  return (
    <>
      <rect x="-34" y="-78" width="68" height="156" rx="8" fill={INK} />
      {colors.map((color, index) => (
        <g key={color}>
          <circle
            cy={-48 + index * 48}
            r="16"
            fill={phase === index ? color : "#333"}
            stroke={PAPER}
            strokeOpacity="0.15"
          />
          <path
            d={arcPath(20, 0, phase === index ? progress : 0)}
            fill="none"
            stroke={color}
            strokeWidth="3"
            transform={`translate(0 ${-48 + index * 48})`}
          />
        </g>
      ))}
      <text x="0" y="91" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7" fill={INK}>
        {boundaries[phase] - t.secondValue}s
      </text>
    </>
  );
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function OrdinalDay({ t }: { t: ClockTime }) {
  const ordinal = dayOfYear(t.date);
  const days = new Date(t.date.getFullYear(), 1, 29).getMonth() === 1 ? 366 : 365;

  return (
    <>
      {Array.from({ length: days }, (_, index) => {
        const angle = index / days * TAU;
        const radius = 54 + (index % 7) * 3.3;
        const point = {
          x: round(Math.cos(angle) * radius),
          y: round(Math.sin(angle) * radius),
        };
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index + 1 === ordinal ? 3.2 : 0.7}
            fill={index + 1 === ordinal ? RED : index < ordinal ? INK : PALE}
            opacity={index + 1 === ordinal ? 1 : 0.5}
          />
        );
      })}
      <text x="0" y="2" textAnchor="middle" dominantBaseline="middle" fontFamily="ui-monospace, monospace" fontSize="27" fill={INK}>
        {ordinal}
      </text>
      <text x="0" y="23" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7" fill={INK}>
        OF {days}
      </text>
    </>
  );
}

export function renderRoundTwoExperiment(id: number, time: ClockTime): ReactNode {
  switch (id) {
    case 102: return <RadicalCenter t={time} />;
    case 137: return <Palimpsest t={time} />;
    case 162: return <TrafficSignal t={time} />;
    case 172: return <OrdinalDay t={time} />;
    default: return null;
  }
}
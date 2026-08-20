import type { ReactNode } from "react";
import { BLUE, INK, PALE, RED, TAU, pad, round } from "../shared";
import type { ClockTime } from "../types";

function Overprint({ time }: { time: ClockTime }) {
  const digits = `${pad(time.h24)}${pad(time.minuteValue)}${pad(time.secondValue)}`.split("");

  return (
    <>
      {digits.map((digit, index) => {
        const angle = -42 + index * 17 + (Number(digit) - 4.5) * 3;
        const x = (index - 2.5) * 10;
        const y = (Number(digit) - 4.5) * 4;
        return (
          <text
            key={index}
            x={round(x)}
            y={round(y + 22)}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="78"
            fontWeight="700"
            fill={index === 5 ? RED : index >= 4 ? BLUE : INK}
            opacity={index === 5 ? 0.7 : 0.18}
            transform={`rotate(${round(angle)} ${round(x)} ${round(y)})`}
            style={{ mixBlendMode: "multiply" }}
          >
            {digit}
          </text>
        );
      })}
      <text x="0" y="77" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill={INK}>
        {digits.slice(0, 2).join("")}:{digits.slice(2, 4).join("")}:{digits.slice(4).join("")}
      </text>
    </>
  );
}

function ReverseGravity({ time }: { time: ClockTime }) {
  const digits = `${pad(time.h24)}${pad(time.minuteValue)}${pad(time.secondValue)}`.split("").map(Number);

  return (
    <>
      {digits.map((digit, index) => {
        const angle = digit / 10 * TAU + index * 0.35;
        const distance = 12 + time.second * (26 + digit * 2);
        const baseX = -55 + index * 22;
        const x = baseX + Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <g key={index}>
            <line x1={baseX} y1="0" x2={round(x)} y2={round(y)} stroke={index >= 4 ? RED : PALE} />
            <text
              x={round(x)}
              y={round(y + 7)}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="20"
              fontWeight="800"
              fill={index === 5 ? RED : INK}
            >
              {digit}
            </text>
          </g>
        );
      })}
      <circle cx="-11" cy="0" r="3" fill={RED} />
      <circle cx="11" cy="0" r="3" fill={RED} />
    </>
  );
}

function Typequake({ time }: { time: ClockTime }) {
  const text = `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}`;
  const waveY = -65 + time.second * 130;

  return (
    <>
      {Array.from({ length: 24 }, (_, index) => {
        const y = -55 + index * 4.8;
        const distance = (y - waveY) / 12;
        const offset = Math.sin(index * 1.7 + time.second * TAU) * (8 + time.minute * 15) * Math.exp(-distance * distance);
        const active = Math.abs(distance) < 0.45;
        return (
          <text
            key={index}
            x={round(offset)}
            y={round(y)}
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="12"
            fontWeight="800"
            fill={active ? RED : INK}
            opacity={active ? 1 : 0.08 + index / 35}
          >
            {text}
          </text>
        );
      })}
      <line x1="-76" y1={round(waveY)} x2="76" y2={round(waveY)} stroke={RED} strokeWidth="1" />
    </>
  );
}

export function renderRoundSixExperiment(id: number, time: ClockTime): ReactNode {
  switch (id) {
    case 560: return <Overprint time={time} />;
    case 569: return <ReverseGravity time={time} />;
    case 586: return <Typequake time={time} />;
    default: return null;
  }
}
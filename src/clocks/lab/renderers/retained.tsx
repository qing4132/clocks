import type { ReactNode } from "react";
import {
  GOLD,
  INK,
  PALE,
  PAPER,
  RED,
  TAU,
  frac,
  hash,
  polar,
  round,
  wedgePath,
} from "../shared";
import type { ClockTime } from "../types";

function buildCliffordOrbit(t: ClockTime) {
  const a = -1.7 + t.hour * 0.35;
  const b = 1.3 + t.minute * 0.45;
  const c = -1.15 + t.second * 0.28;
  const d = -1.6 + t.day * 0.2;
  let x = 0.1;
  let y = 0.1;

  return Array.from({ length: 520 }, () => {
    const nextX = Math.sin(a * y) + c * Math.cos(a * x);
    const nextY = Math.sin(b * x) + d * Math.cos(b * y);
    x = nextX;
    y = nextY;
    return { x: round(x * 38), y: round(y * 38) };
  });
}

function CliffordDust({ t }: { t: ClockTime }) {
  return (
    <>
      {buildCliffordOrbit(t).map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={index % 17 === 0 ? 1.1 : 0.55}
          fill={index % 59 === t.secondValue ? RED : INK}
          opacity="0.55"
        />
      ))}
    </>
  );
}

function Eclipse({ t }: { t: ClockTime }) {
  const moonX = -72 + t.minute * 144;
  const corona = 31 + Math.sin(t.second * TAU * 9) * 2;

  return (
    <>
      {Array.from({ length: 36 }, (_, index) => (
        <line
          key={index}
          x1="0"
          y1={round(-corona)}
          x2="0"
          y2={round(-corona - 5 - (index % 3) * 3)}
          stroke={RED}
          strokeWidth="0.8"
          opacity="0.5"
          transform={`rotate(${index * 10 + t.second * 8})`}
        />
      ))}
      <circle r="30" fill={GOLD} opacity="0.75" />
      <circle
        cx={round(moonX)}
        cy={round(Math.sin(t.minute * Math.PI) * -5)}
        r="29"
        fill={INK}
      />
      <circle r="67" fill="none" stroke={PALE} />
      {Array.from({ length: 12 }, (_, index) => {
        const point = polar(75, index / 12);
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === t.h12 ? 3 : 1}
            fill={index === t.h12 ? RED : INK}
          />
        );
      })}
    </>
  );
}

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

function RomanRuin({ t }: { t: ClockTime }) {
  return (
    <>
      {ROMAN.map((label, index) => {
        const point = polar(72, index / 12);
        const passed = index !== t.h12 && ((t.h12 - index + 12) % 12) < 6;
        const fall = passed ? 9 + t.minute * 22 : 0;
        return (
          <text
            key={label}
            x={point.x}
            y={round(point.y + fall)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Georgia, serif"
            fontSize={index === t.h12 ? 16 : 10}
            fill={index === t.h12 ? RED : INK}
            opacity={passed ? 0.22 : 0.85}
            transform={passed ? `rotate(${round((hash(index) - 0.5) * 28)} ${point.x} ${point.y})` : undefined}
          >
            {label}
          </text>
        );
      })}
      <path d="M -63 80 Q 0 69 63 80" fill="none" stroke={INK} strokeWidth="1" opacity="0.25" />
      <line
        x1="0"
        y1="0"
        x2={polar(48, t.minute).x}
        y2={polar(48, t.minute).y}
        stroke={INK}
        strokeWidth="2"
      />
    </>
  );
}

function LunarPhase({ t }: { t: ClockTime }) {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const phase = frac((t.date.getTime() - knownNewMoon) / 86_400_000 / 29.530588853);
  const waxing = phase < 0.5;
  const illumination = (1 - Math.cos(phase * TAU)) / 2;
  const offset = Math.cos(phase * TAU) * 46;

  return (
    <>
      <circle r="50" fill={waxing ? INK : PAPER} stroke={INK} strokeWidth="1.5" />
      <ellipse cx={round(offset)} cy="0" rx="46" ry="50" fill={waxing ? PAPER : INK} />
      <circle r="50" fill="none" stroke={INK} strokeWidth="1.5" />
      <text x="0" y="72" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill={INK}>
        {Math.round(illumination * 100)}% LIT
      </text>
      <circle cx={polar(82, phase).x} cy={polar(82, phase).y} r="3" fill={RED} />
    </>
  );
}

function TimezoneChorus({ t }: { t: ClockTime }) {
  const utc = t.date.getUTCHours() + t.date.getUTCMinutes() / 60;

  return (
    <>
      {Array.from({ length: 24 }, (_, index) => {
        const point = polar(index % 2 ? 77 : 70, index / 24);
        const hour = (Math.floor(utc) + index - 12 + 24) % 24;
        const local = hour === t.h24;
        return (
          <text
            key={index}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="ui-monospace, monospace"
            fontSize={local ? 10 : 6.5}
            fill={local ? RED : INK}
            opacity={local ? 1 : 0.5}
          >
            {String(hour).padStart(2, "0")}
          </text>
        );
      })}
      <circle r="49" fill="none" stroke={PALE} />
      <text x="0" y="-4" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill={INK}>UTC</text>
      <text x="0" y="15" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="18" fill={INK}>
        {String(Math.floor(utc)).padStart(2, "0")}
      </text>
    </>
  );
}

function NumberEater({ t }: { t: ClockTime }) {
  const progress = (t.h12 + t.minute) / 12;

  return (
    <>
      {Array.from({ length: 12 }, (_, index) => {
        const point = polar(72, index / 12);
        const eaten = index / 12 < progress;
        return (
          <text
            key={index}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Georgia, serif"
            fontSize="12"
            fill={eaten ? PALE : INK}
          >
            {index || 12}
          </text>
        );
      })}
      <path d={wedgePath(87, progress)} fill={INK} opacity="0.82" />
      <circle r="38" fill={PAPER} />
      <path d="M 0 0 L 35 -14 L 35 14 Z" fill={PAPER} transform={`rotate(${round(progress * 360)})`} />
      <circle cx={polar(40, progress).x} cy={polar(40, progress).y} r="3" fill={RED} />
    </>
  );
}

export function renderRetainedExperiment(id: number, t: ClockTime): ReactNode {
  switch (id) {
    case 20: return <CliffordDust t={t} />;
    case 26: return <Eclipse t={t} />;
    case 34: return <RomanRuin t={t} />;
    case 61: return <LunarPhase t={t} />;
    case 64: return <TimezoneChorus t={t} />;
    case 85: return <NumberEater t={t} />;
    default: return null;
  }
}
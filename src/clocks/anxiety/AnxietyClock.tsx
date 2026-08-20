"use client";

import { useWallClock } from "../useWallClock";

const INK = "#1a1a1a";
const RED = "#c1121f";

type AnxietyClockProps = {
  color: string;
  label: string;
};

function AnxietyHand({ color, angle }: { color: string; angle: number }) {
  return (
    <g transform={`rotate(${angle})`}>
      <line
        x1="0"
        y1="18"
        x2="0"
        y2="-90"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
}

function AnxietyDial({ color, label }: AnxietyClockProps) {
  const now = useWallClock(16);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;
  const anxietyAngle = now ? (now.getTime() % 1000) * 0.36 : 0;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label={label}
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke={INK} strokeWidth="3" />

      {Array.from({ length: 60 }).map((_, i) => {
        const isHour = i % 5 === 0;
        return (
          <line
            key={i}
            x1="0"
            y1={-92}
            x2="0"
            y2={isHour ? -82 : -88}
            stroke={INK}
            strokeWidth={isHour ? 2.5 : 1}
            strokeLinecap="round"
            transform={`rotate(${i * 6})`}
          />
        );
      })}

      {Array.from({ length: 12 }).map((_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = ((i * 30) - 90) * (Math.PI / 180);
        const r = 70;
        const x = Math.round(Math.cos(angle) * r * 1000) / 1000;
        const y = Math.round(Math.sin(angle) * r * 1000) / 1000;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="14"
            fill={INK}
          >
            {num}
          </text>
        );
      })}

      {now && (
        <>
          <AnxietyHand color={color} angle={anxietyAngle} />
          <line
            x1="0"
            y1="10"
            x2="0"
            y2="-50"
            stroke={INK}
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${hourAngle})`}
          />
          <line
            x1="0"
            y1="14"
            x2="0"
            y2="-74"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle})`}
          />
          <line
            x1="0"
            y1="20"
            x2="0"
            y2="-84"
            stroke={RED}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${secondAngle})`}
          />
          <circle cx="0" cy="0" r="1.5" fill={RED} />
        </>
      )}

      <circle cx="0" cy="0" r="4" fill={INK} />
    </svg>
  );
}

export default function AnxietyClock() {
  return <AnxietyDial color="#ff8a00" label="Anxiety hot orange clock" />;
}
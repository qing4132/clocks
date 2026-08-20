import type { ReactNode } from "react";
import { BLUE, INK, PALE, PAPER, RED, TAU, round } from "../shared";
import type { ClockTime } from "../types";

function SphericalCoordinates({ time }: { time: ClockTime }) {
  const longitude = time.hour * TAU - Math.PI;
  const latitude = (time.minute - 0.5) * Math.PI;
  const point = {
    x: Math.cos(latitude) * Math.sin(longitude),
    y: -Math.sin(latitude),
    z: Math.cos(latitude) * Math.cos(longitude),
  };
  const screen = {
    x: round(point.x * 65),
    y: round(point.y * 65),
  };
  const heading = time.second * TAU;

  return (
    <>
      <circle r="66" fill={BLUE} fillOpacity="0.04" stroke={INK} />
      {[-60, -30, 0, 30, 60].map((degree) => (
        <ellipse
          key={`longitude-${degree}`}
          rx={round(66 * Math.cos(degree * Math.PI / 180))}
          ry="66"
          fill="none"
          stroke={PALE}
          strokeWidth="0.6"
        />
      ))}
      {[-60, -30, 0, 30, 60].map((degree) => (
        <ellipse
          key={`latitude-${degree}`}
          rx="66"
          ry={round(66 * Math.cos(degree * Math.PI / 180))}
          fill="none"
          stroke={PALE}
          strokeWidth="0.6"
          transform={`translate(0 ${round(-66 * Math.sin(degree * Math.PI / 180))})`}
        />
      ))}
      <circle
        cx={screen.x}
        cy={screen.y}
        r="6"
        fill={point.z >= 0 ? RED : PAPER}
        stroke={RED}
        strokeWidth="2"
        opacity={point.z >= 0 ? 1 : 0.55}
      />
      <line
        x1={screen.x}
        y1={screen.y}
        x2={round(screen.x + Math.cos(heading) * 18)}
        y2={round(screen.y + Math.sin(heading) * 18)}
        stroke={RED}
        strokeWidth="2"
      />
    </>
  );
}

export function renderRoundFiveExperiment(id: number, time: ClockTime): ReactNode {
  return id === 497 ? <SphericalCoordinates time={time} /> : null;
}
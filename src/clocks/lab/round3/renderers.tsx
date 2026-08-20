import type { ReactNode } from "react";
import { BLUE, INK, PALE, RED, pathFrom, polar, round } from "../shared";
import type { ClockTime } from "../types";

type Point = { x: number; y: number };

function pointOnLoop(vertices: Point[], progress: number) {
  const edges = vertices.map((point, index) => {
    const next = vertices[(index + 1) % vertices.length];
    return { point, next, length: Math.hypot(next.x - point.x, next.y - point.y) };
  });
  const total = edges.reduce((sum, edge) => sum + edge.length, 0);
  let distance = progress * total;

  for (const edge of edges) {
    if (distance <= edge.length) {
      const amount = distance / edge.length;
      return {
        x: round(edge.point.x + (edge.next.x - edge.point.x) * amount),
        y: round(edge.point.y + (edge.next.y - edge.point.y) * amount),
      };
    }
    distance -= edge.length;
  }

  return vertices[0];
}

function CornerRelay({ time }: { time: ClockTime }) {
  const triangle = [polar(68, 0), polar(68, 1 / 3), polar(68, 2 / 3)];
  const square = [
    { x: -43, y: -43 },
    { x: 43, y: -43 },
    { x: 43, y: 43 },
    { x: -43, y: 43 },
  ];
  const hexagon = Array.from({ length: 6 }, (_, index) => polar(25, index / 6));
  const tracks = [
    { vertices: triangle, value: time.hour, color: RED },
    { vertices: square, value: time.minute, color: INK },
    { vertices: hexagon, value: time.second, color: BLUE },
  ];

  return (
    <>
      {tracks.map(({ vertices, value, color }, index) => {
        const point = pointOnLoop(vertices, value);
        return (
          <g key={index}>
            <path d={pathFrom(vertices, true)} fill="none" stroke={color} strokeWidth="1" opacity="0.45" />
            <circle cx={point.x} cy={point.y} r={index === 2 ? 3 : 4} fill={color} />
          </g>
        );
      })}
      <circle r="2" fill={PALE} />
    </>
  );
}

export function renderRoundThreeExperiment(id: number, time: ClockTime): ReactNode {
  return id === 304 ? <CornerRelay time={time} /> : null;
}
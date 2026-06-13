"use client";

import { create } from "qrcode";
import { useWallClock } from "../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";
const QUIET = 4;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function squarePoint(size: number, center: number, value: number, domain: number) {
  const start = Math.round(center - (size - 1) / 2);
  const end = start + size - 1;
  const span = end - start;
  const half = span / 2;
  const perimeter = span * 4;
  const pos = (value / domain) * perimeter;

  let x: number;
  let y: number;
  if (pos < half) {
    x = center + pos;
    y = start;
  } else if (pos < half + span) {
    x = end;
    y = start + (pos - half);
  } else if (pos < half + span * 2) {
    x = end - (pos - half - span);
    y = end;
  } else if (pos < half + span * 3) {
    x = start;
    y = end - (pos - half - span * 2);
  } else {
    x = start + (pos - half - span * 3);
    y = start;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

function Marker({ cell }: { cell: { x: number; y: number } }) {
  return <rect x={cell.x} y={cell.y} width="2" height="2" fill={RED} />;
}

export default function QRClock() {
  const now = useWallClock(1000);
  const h = now ? now.getHours() : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const time = `${pad(h)}:${pad(m)}:${pad(s)}`;
  const qr = create(time, { errorCorrectionLevel: "H", version: 7 });
  const size = qr.modules.size;
  const total = size + QUIET * 2;
  const qrSize = 188;
  const qrOffset = -qrSize / 2;
  const moduleSize = qrSize / total;
  const center = QUIET + (size - 1) / 2;

  const hour = squarePoint(11, center, h % 12, 12);
  const minute = squarePoint(17, center, m, 60);
  const second = squarePoint(23, center, s, 60);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label={`QR clock encoding ${time}`}
      shapeRendering="crispEdges"
    >
      <rect x="-94" y="-94" width="188" height="188" rx="10" fill={PAPER} />
      <g transform={`translate(${qrOffset} ${qrOffset}) scale(${moduleSize})`}>
        {Array.from({ length: size }).map((_, y) =>
          Array.from({ length: size }).map((__, x) =>
            qr.modules.get(y, x) ? <rect key={`${x}-${y}`} x={x + QUIET} y={y + QUIET} width="1" height="1" fill={INK} /> : null
          )
        )}

        <Marker cell={hour} />
        <Marker cell={minute} />
        <Marker cell={second} />
      </g>
    </svg>
  );
}
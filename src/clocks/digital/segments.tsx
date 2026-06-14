"use client";

/**
 * Shared 7-segment digit + colon renderers used by the digital clock
 * family (#011 digital, #012 30-hour, etc.). Keeping them in one place
 * means every digital-family clock looks identical at the segment level.
 */

const SEGMENTS: Record<string, string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  // hex extensions (used by some variants)
  A: ["a", "b", "c", "e", "f", "g"],
  b: ["c", "d", "e", "f", "g"],
  C: ["a", "d", "e", "f"],
  d: ["b", "c", "d", "e", "g"],
  E: ["a", "d", "e", "f", "g"],
  F: ["a", "e", "f", "g"],
  // blank
  " ": [],
  "-": ["g"],
};

export const Digit = ({
  x,
  width,
  d,
  color,
}: {
  x: number;
  width: number;
  d: string;
  color: string;
}) => {
  const h = width * 1.85;
  const segT = Math.max(1.5, width * 0.13);
  const lit = new Set(SEGMENTS[d] ?? []);
  const w = width;
  const halfH = (h - segT) / 2;
  const segHorizW = w - segT * 2;
  const segVertH = halfH - segT;

  const segs: { which: string; x: number; y: number; w: number; h: number }[] = [
    { which: "a", x: segT, y: 0, w: segHorizW, h: segT },
    { which: "b", x: w - segT, y: segT, w: segT, h: segVertH },
    { which: "c", x: w - segT, y: segT + segVertH + segT, w: segT, h: segVertH },
    { which: "d", x: segT, y: h - segT, w: segHorizW, h: segT },
    { which: "e", x: 0, y: segT + segVertH + segT, w: segT, h: segVertH },
    { which: "f", x: 0, y: segT, w: segT, h: segVertH },
    { which: "g", x: segT, y: halfH, w: segHorizW, h: segT },
  ];

  return (
    <g transform={`translate(${x} ${-h / 2})`}>
      {segs.map((s) => (
        <rect
          key={s.which}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={Math.min(s.w, s.h) / 2}
          ry={Math.min(s.w, s.h) / 2}
          fill={color}
          opacity={lit.has(s.which) ? 1 : 0.08}
        />
      ))}
    </g>
  );
};

export const Colon = ({
  x,
  width,
  on,
  color = "#1a1a1a",
}: {
  x: number;
  width: number;
  on: boolean;
  color?: string;
}) => (
  <g transform={`translate(${x + width / 2} 0)`}>
    <circle cx="0" cy="-7" r="1.8" fill={color} opacity={on ? 1 : 0.08} />
    <circle cx="0" cy="7" r="1.8" fill={color} opacity={on ? 1 : 0.08} />
  </g>
);

/** Default panel + digit layout helpers used by every digital-family clock. */
export const DigitalPanel = ({
  children,
  fill = "#fafaf7",
  stroke = "#1a1a1a",
}: {
  children: React.ReactNode;
  fill?: string;
  stroke?: string;
}) => (
  <>
    <rect
      x="-94"
      y="-30"
      width="188"
      height="60"
      rx="10"
      ry="10"
      fill={fill}
      stroke={stroke}
      strokeWidth="3"
      style={{ transition: "fill 900ms ease, stroke 900ms ease" }}
    />
    {children}
  </>
);

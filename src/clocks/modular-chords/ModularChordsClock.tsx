"use client";

import { useWallClock } from "../useWallClock";

/**
 * #010 — Modular times-table clock.
 *
 *   The dial is dominated by the inner chord figure
 *       chord_i : point i  →  point (i · k) mod 60   with k = s.
 *   Every second the figure crisply hops to the next integer k.
 *
 *   No clock hands cross the figure. Time is read off three concentric
 *   rings around the rim:
 *     - hours   : 12 evenly-spaced small dots; the dot at position h is
 *                 a big black disc.
 *     - minutes : 60 tiny dots; the dot at position m is a medium black disc.
 *     - seconds : the same 60 ring of chord-endpoints; the dot at position
 *                 s is a red disc.
 *
 *   So h / m / s are read by which dot is "lit" on each ring.
 */
export default function ModularChordsClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const round = (n: number) => Math.round(n * 1000) / 1000;

  // Three concentric rings, evenly spaced 10 SVG units apart:
  const R_CHORDS = 72; // chord endpoints (= seconds ring)
  const R_MINS = 82; // minute dots
  const R_HRS = 92; // hour dots

  const polar = (frac: number, r: number) => {
    const a = (frac * 2 * Math.PI) - Math.PI / 2;
    return { x: round(Math.cos(a) * r), y: round(Math.sin(a) * r) };
  };

  const N = 60;
  const ptsChord = Array.from({ length: N }).map((_, i) => polar(i / N, R_CHORDS));
  const ptsMin = Array.from({ length: N }).map((_, i) => polar(i / N, R_MINS));
  const ptsHr = Array.from({ length: 12 }).map((_, i) => polar(i / 12, R_HRS));

  const k = s;
  const chords = Array.from({ length: N }).map((_, i) => {
    const j = (i * k) % N;
    const b = ptsChord[j];
    return { x1: ptsChord[i].x, y1: ptsChord[i].y, x2: b.x, y2: b.y };
  });

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Modular times-table clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      {/* the chord pattern */}
      <g opacity="0.7">
        {chords.map((c, i) => (
          <line
            key={i}
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke="#1a1a1a"
            strokeWidth="0.4"
          />
        ))}
      </g>

      {/* seconds ring = chord endpoints; the current s is red and bigger */}
      {ptsChord.map((p, i) => (
        <circle
          key={`c${i}`}
          cx={p.x}
          cy={p.y}
          r={i === s ? 2.4 : 0.7}
          fill={i === s ? "#c1121f" : "#1a1a1a"}
        />
      ))}

      {/* minutes ring */}
      {ptsMin.map((p, i) => (
        <circle
          key={`m${i}`}
          cx={p.x}
          cy={p.y}
          r={i === m ? 2.4 : 0.6}
          fill="#1a1a1a"
          opacity={i === m ? 1 : 0.45}
        />
      ))}

      {/* hours ring: 12 dots; the current h is a big disc */}
      {ptsHr.map((p, i) => (
        <circle
          key={`h${i}`}
          cx={p.x}
          cy={p.y}
          r={i === h ? 3.2 : 1.1}
          fill="#1a1a1a"
          opacity={i === h ? 1 : 0.55}
        />
      ))}
    </svg>
  );
}

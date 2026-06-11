"use client";

import { useWallClock } from "../useWallClock";
import { SnarkDial } from "./GameOfLifeClock";

/**
 * #019 — Game of Life. The living dial (a Snark loop: four reflectors bouncing
 * one glider round a circuit) with the hour and minute written in the empty
 * centre as italic Georgia numerals (HH over MM), in the #001 type voice.
 * Continuous letterforms read unmistakably as type, never as live cells, and
 * sit in the cell-free core so they never overlap the dots. The red glider
 * stays the living second hand (one lap = 60 s). #001 palette.
 */

function useHM() {
  const now = useWallClock(1000);
  const HH = now ? String(now.getHours()).padStart(2, "0") : "--";
  const MM = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  return { now, HH, MM };
}

const SERIF = "Georgia, 'Times New Roman', serif";

export function GameOfLifeClock() {
  const { now, HH, MM } = useHM();
  // Nudge the pair up ~2 units: two stacked rows read as sitting low even when
  // geometrically centred, so a small optical lift makes them look centred.
  return (
    <SnarkDial fieldOpacity={0.14}>
      {now && (
        <g
          fontFamily={SERIF}
          fontStyle="italic"
          fontSize="18"
          fill="#1a1a1a"
          textAnchor="middle"
        >
          <text x="0" y="-11" dominantBaseline="central">{HH}</text>
          <text x="0" y="7" dominantBaseline="central">{MM}</text>
        </g>
      )}
    </SnarkDial>
  );
}

"use client";

import { useWallClock } from "../useWallClock";

// Two black dots on a yellow disc — the hour hand is the left pupil, the
// minute hand is the right one. Each dot orbits its own eye centre on a
// PUPIL_ORBIT-radius circle, so at 12:00 both dots sit at the top of their
// eyes, at 3:00 the right one is on the right, etc. The narrow smile below
// has its endpoints pulled in to x = ±EYE_CX, giving each mouth corner a
// clean vertical sightline to the pupil above it.
const EYE_CX = 30;
const EYE_CY = -25;
const PUPIL_R = 7;
const PUPIL_ORBIT = 12;

const MOUTH_Y = 36;
const MOUTH_WIDTH = 30;
const MOUTH_CURVE = 28;

export default function SmileClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  // Second-level sub-steps: 0.1°/s on the minute pupil, ~0.0083°/s on the
  // hour pupil. At the pupil's 12-unit orbit that's ~0.02 px / s — below the
  // human noticeable threshold, so the eyes read as continuously drifting
  // even though we only re-render once per wall-clock second.
  const hourAngle = h * 30 + m * 0.5 + s * (0.5 / 60);
  const minuteAngle = m * 6 + s * 0.1;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Smile clock"
    >
      <circle
        cx="0"
        cy="0"
        r="96"
        fill="#ffd93d"
        stroke="#1a1a1a"
        strokeWidth={3}
      />

      <path
        d={`M ${-MOUTH_WIDTH} ${MOUTH_Y} Q 0 ${MOUTH_Y + MOUTH_CURVE} ${MOUTH_WIDTH} ${MOUTH_Y}`}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={7}
        strokeLinecap="round"
      />

      {now && (
        <>
          <g
            transform={`translate(${-EYE_CX}, ${EYE_CY}) rotate(${hourAngle})`}
          >
            <circle cx={0} cy={-PUPIL_ORBIT} r={PUPIL_R} fill="#1a1a1a" />
          </g>
          <g transform={`translate(${EYE_CX}, ${EYE_CY}) rotate(${minuteAngle})`}>
            <circle cx={0} cy={-PUPIL_ORBIT} r={PUPIL_R} fill="#1a1a1a" />
          </g>
        </>
      )}
    </svg>
  );
}

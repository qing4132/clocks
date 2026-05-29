"use client";

import { useWallClock } from "../useWallClock";

/**
 * #016~#018 — Breath clocks (visual-guided).
 *
 *   #001 family aesthetics. No numbers, no countdown — just shapes that
 *   move at the breath cadence. The user follows the motion.
 *
 *   A faint serif HH:MM still sits at the south rim so the clock still
 *   "is" a clock, but reading time is not the goal.
 */

const FACE = "#fafaf7";
const INK = "#1a1a1a";
const RED = "#c1121f";
const R_RIM = 96;
const R_TRACK = 78;
const R_MIN = 18;
const R_MAX = 60;

function ClockShell({ children }: { children: React.ReactNode }) {
  const now = useWallClock(1000);
  const HH = now ? String(now.getHours()).padStart(2, "0") : "--";
  const MM = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
    >
      <circle cx="0" cy="0" r={R_RIM} fill={FACE} stroke={INK} strokeWidth="3" />
      {children}
      <text
        x="0"
        y="86"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="11"
        fill={INK}
        fillOpacity="0.45"
        letterSpacing="3"
      >
        {HH}:{MM}
      </text>
    </svg>
  );
}

function usePhase(total: number) {
  const now = useWallClock(50);
  if (!now) return { ready: false as const, t: 0 };
  return { ready: true as const, t: (now.getTime() / 1000) % total };
}

// ------------------------------------------------------------------
// #016 Box breath (4-4-4-4): a dot traces a rounded square; the current
// edge lights up red. Top edge = inhale, right = hold, bottom = exhale,
// left = hold (hold edges are dashed). A central disc breathes too.
// ------------------------------------------------------------------
export function BoxBreath() {
  const phases = [4, 4, 4, 4];
  const total = 16;
  const { ready, t } = usePhase(total);

  let acc = 0;
  let idx = 0;
  let frac = 0;
  for (let i = 0; i < phases.length; i++) {
    if (t < acc + phases[i]) {
      idx = i;
      frac = (t - acc) / phases[i];
      break;
    }
    acc += phases[i];
  }

  let rNorm = 0;
  if (idx === 0) rNorm = frac;
  else if (idx === 1) rNorm = 1;
  else if (idx === 2) rNorm = 1 - frac;
  else rNorm = 0;
  const r = R_MIN + (R_MAX - R_MIN) * rNorm;

  const S = 64;
  let dx = 0, dy = 0;
  if (idx === 0) { dx = -S + 2 * S * frac; dy = -S; }
  else if (idx === 1) { dx = S; dy = -S + 2 * S * frac; }
  else if (idx === 2) { dx = S - 2 * S * frac; dy = S; }
  else { dx = -S; dy = S - 2 * S * frac; }

  return (
    <ClockShell>
      <rect
        x={-S}
        y={-S}
        width={2 * S}
        height={2 * S}
        rx="6"
        ry="6"
        fill="none"
        stroke={INK}
        strokeWidth="1"
        strokeOpacity="0.25"
      />

      {ready && (() => {
        const edges = [
          { x1: -S, y1: -S, x2: S, y2: -S },
          { x1: S, y1: -S, x2: S, y2: S },
          { x1: S, y1: S, x2: -S, y2: S },
          { x1: -S, y1: S, x2: -S, y2: -S },
        ];
        const e = edges[idx];
        const isHold = idx === 1 || idx === 3;
        return (
          <line
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={RED}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={isHold ? "2 4" : undefined}
            opacity="0.85"
          />
        );
      })()}

      {ready && (
        <circle
          cx="0"
          cy="0"
          r={r.toFixed(2)}
          fill={INK}
          fillOpacity="0.08"
          stroke={INK}
          strokeWidth="1"
        />
      )}

      {ready && (
        <circle cx={dx.toFixed(2)} cy={dy.toFixed(2)} r="4" fill={RED} />
      )}
    </ClockShell>
  );
}

// ------------------------------------------------------------------
// #017 Resonant breath (5-5): pure sine. Disc smoothly inflates and
// deflates; a small red dot rides the top of the disc.
// ------------------------------------------------------------------
export function ResonantBreath() {
  const total = 10;
  const { ready, t } = usePhase(total);

  const phase = (t / total) * 2 * Math.PI;
  const k = 0.5 - 0.5 * Math.cos(phase);
  const r = R_MIN + (R_MAX - R_MIN) * k;

  return (
    <ClockShell>
      <circle
        cx="0"
        cy="0"
        r={R_MAX}
        fill="none"
        stroke={INK}
        strokeWidth="0.7"
        strokeOpacity="0.18"
      />
      <circle
        cx="0"
        cy="0"
        r={R_MIN}
        fill="none"
        stroke={INK}
        strokeWidth="0.7"
        strokeOpacity="0.18"
      />

      {ready && (
        <>
          <circle
            cx="0"
            cy="0"
            r={r.toFixed(2)}
            fill={INK}
            fillOpacity="0.08"
            stroke={INK}
            strokeWidth="1.2"
          />
          <circle cx="0" cy={(-r).toFixed(2)} r="3.5" fill={RED} />
        </>
      )}
    </ClockShell>
  );
}

// ------------------------------------------------------------------
// #018 Relaxation (4-7-8): rim split into 3 arcs sized by phase length.
// The active arc fills red as it progresses; the disc grows / holds /
// shrinks accordingly. Hold arc is dashed.
// ------------------------------------------------------------------
export function RelaxationBreath() {
  const phases = [4, 7, 8];
  const total = 19;
  const { ready, t } = usePhase(total);

  let acc = 0;
  let idx = 0;
  let frac = 0;
  for (let i = 0; i < phases.length; i++) {
    if (t < acc + phases[i]) {
      idx = i;
      frac = (t - acc) / phases[i];
      break;
    }
    acc += phases[i];
  }

  let rNorm = 0;
  if (idx === 0) rNorm = frac;
  else if (idx === 1) rNorm = 1;
  else rNorm = 1 - frac;
  const r = R_MIN + (R_MAX - R_MIN) * rNorm;

  const arcs: { d: string; isHold: boolean; progressD?: string }[] = [];
  let a0 = -90;
  for (let i = 0; i < phases.length; i++) {
    const sweep = (phases[i] / total) * 360;
    const a1 = a0 + sweep;
    const r0 = (a0 * Math.PI) / 180;
    const r1 = (a1 * Math.PI) / 180;
    const R = R_TRACK;
    const x0 = (Math.cos(r0) * R).toFixed(2);
    const y0 = (Math.sin(r0) * R).toFixed(2);
    const x1 = (Math.cos(r1) * R).toFixed(2);
    const y1 = (Math.sin(r1) * R).toFixed(2);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`;

    let progressD: string | undefined;
    if (i === idx && ready) {
      const subSweep = sweep * frac;
      const a1p = a0 + subSweep;
      const rp = (a1p * Math.PI) / 180;
      const xp = (Math.cos(rp) * R).toFixed(2);
      const yp = (Math.sin(rp) * R).toFixed(2);
      const largeP = subSweep > 180 ? 1 : 0;
      progressD = `M ${x0} ${y0} A ${R} ${R} 0 ${largeP} 1 ${xp} ${yp}`;
    }

    arcs.push({ d, isHold: i === 1, progressD });
    a0 = a1;
  }

  return (
    <ClockShell>
      {arcs.map((a, i) => (
        <g key={i}>
          <path
            d={a.d}
            fill="none"
            stroke={INK}
            strokeWidth="1"
            strokeOpacity="0.22"
            strokeDasharray={a.isHold ? "2 4" : undefined}
            strokeLinecap="round"
          />
          {a.progressD && (
            <path
              d={a.progressD}
              fill="none"
              stroke={RED}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={a.isHold ? "2 4" : undefined}
            />
          )}
        </g>
      ))}

      {ready && (
        <circle
          cx="0"
          cy="0"
          r={r.toFixed(2)}
          fill={INK}
          fillOpacity="0.08"
          stroke={INK}
          strokeWidth="1.2"
        />
      )}
    </ClockShell>
  );
}

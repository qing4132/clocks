"use client";

import IncenseBase, { type BurnState } from "./IncenseBase";

const round = (n: number) => Math.round(n * 1000) / 1000;

/* ─────── A: nothing extra (the variant we have now, minus markers) ─────── */
export function IncenseA() {
  return <IncenseBase />;
}

/* ─────── B: faint outer clock face — radial cue projects the head onto it ─────── */
export function IncenseB() {
  return (
    <IncenseBase
      renderOverlay={({ head, hour, R_OUTER }) => {
        // outer ring just outside the spiral
        const Rring = R_OUTER + 6;
        // current hour angle as a standard 12-hour clock
        const h12 = hour % 12;
        const a = ((h12 * 30) - 90) * (Math.PI / 180);
        const xh = round(Math.cos(a) * Rring);
        const yh = round(Math.sin(a) * Rring);
        return (
          <>
            <circle cx="0" cy="0" r={Rring} fill="none" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.35" />
            {Array.from({ length: 12 }).map((_, i) => {
              const ang = ((i * 30) - 90) * (Math.PI / 180);
              const num = i === 0 ? 12 : i;
              const tx = round(Math.cos(ang) * (Rring + 6));
              const ty = round(Math.sin(ang) * (Rring + 6));
              return (
                <text
                  key={i}
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontSize="7"
                  fill="#1a1a1a"
                  opacity="0.55"
                >
                  {num}
                </text>
              );
            })}
            {/* dashed ray from centre through head to outer ring */}
            <line x1="0" y1="0" x2={head.x * 1.3} y2={head.y * 1.3} stroke="#c1121f" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.7" />
            {/* current-hour marker on outer ring */}
            <circle cx={xh} cy={yh} r="2.4" fill="#c1121f" />
          </>
        );
      }}
    />
  );
}

/* ─────── C: progress bar under the dial ─────── */
export function IncenseC() {
  return (
    <IncenseBase
      renderOverlay={({ burnFrac }) => {
        const xL = -80;
        const xR = 80;
        const y = 92;
        const w = (xR - xL) * burnFrac;
        return (
          <>
            <line x1={xL} y1={y} x2={xR} y2={y} stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />
            <line x1={xL} y1={y} x2={xL + w} y2={y} stroke="#c1121f" strokeWidth="2.5" strokeLinecap="round" />
            {[0, 6, 12, 18, 24].map((h) => {
              const x = xL + ((xR - xL) * h) / 24;
              return (
                <g key={h}>
                  <line x1={x} y1={y - 2.5} x2={x} y2={y + 2.5} stroke="#1a1a1a" strokeWidth="0.6" opacity="0.6" />
                  <text x={x} y={y + 9} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="6" fill="#1a1a1a" opacity="0.6">
                    {h}
                  </text>
                </g>
              );
            })}
          </>
        );
      }}
    />
  );
}

/* ─────── D: small label following the burn head ─────── */
export function IncenseD() {
  return (
    <IncenseBase
      renderOverlay={({ head, hour, minute }) => {
        const hh = String(hour).padStart(2, "0");
        const mm = String(minute).padStart(2, "0");
        // position the label outside the head, away from the centre
        const len = Math.hypot(head.x, head.y) || 1;
        const lx = head.x + (head.x / len) * 10;
        const ly = head.y + (head.y / len) * 10;
        return (
          <text
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="8"
            fill="#c1121f"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {hh}:{mm}
          </text>
        );
      }}
    />
  );
}

/* ─────── E: nothing — pure incense, zen mode ─────── */
export function IncenseE() {
  return <IncenseBase />;
}

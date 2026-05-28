"use client";

import { useEffect, useState } from "react";

/**
 * #008 — Orb clock.
 *
 *   Three full #001-style dials sit on the three orthogonal planes of a
 *   shared 3D coordinate system:
 *     - second hand:  XY plane
 *     - minute hand:  YZ plane
 *     - hour   hand:  XZ plane
 *
 *   Looking head-on at any one plane reproduces #001 exactly (face circle,
 *   60 tick marks, 12 numerals, the matching hand), minus the other two
 *   hands. The three dials are rendered with a fixed orthographic camera
 *   tilted so all three are simultaneously visible.
 *
 *   Numerals are billboarded (drawn upright in screen space) at their
 *   projected positions, so they stay readable regardless of how edge-on
 *   their plane appears.
 */
export default function OrbClock({
  yawDeg = -32,
  pitchDeg = 22,
}: {
  yawDeg?: number;
  pitchDeg?: number;
} = {}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const secAng = (s / 60) * 2 * Math.PI;
  const minAng = ((m + s / 60) / 60) * 2 * Math.PI;
  const hourAng = ((h * 30 + m * 0.5) * Math.PI) / 180;

  // ----- camera -----
  const YAW = (yawDeg * Math.PI) / 180;
  const PITCH = (pitchDeg * Math.PI) / 180;
  const cy = Math.cos(YAW),
    sy_ = Math.sin(YAW);
  const cp = Math.cos(PITCH),
    sp = Math.sin(PITCH);
  const round = (n: number) => Math.round(n * 1000) / 1000;
  /** Linear projection (works for points and direction vectors). */
  const project = (x: number, y: number, z: number) => {
    const x1 = x * cy + z * sy_;
    const z1 = -x * sy_ + z * cy;
    const y2 = y * cp - z1 * sp;
    return { sx: round(x1), sy: round(-y2) };
  };

  // ----- per-plane geometry helpers -----
  // For each plane we choose a "natural front view": the dial reads like
  // #001 when looked at from that direction.
  //   - xy (z=0): viewed from +Z. screen-right = +X, screen-up = +Y.
  //   - yz (x=0): viewed from +X. screen-right = -Z, screen-up = +Y.
  //   - xz (y=0): viewed from +Y (above). screen-right = +X, screen-up = -Z.
  // Local convention on every dial: angle 0 = 12 o'clock (up), CW increasing.
  type Plane = "xy" | "yz" | "xz";
  const planeBasis = (plane: Plane) => {
    if (plane === "xy") return { rx: 1, ry: 0, rz: 0, ux: 0, uy: 1, uz: 0 };
    if (plane === "yz") return { rx: 0, ry: 0, rz: -1, ux: 0, uy: 1, uz: 0 };
    return { rx: 1, ry: 0, rz: 0, ux: 0, uy: 0, uz: -1 };
  };
  /** 3D point at the given dial angle (rad, 0 = 12 o'clock, CW), radius r. */
  const planePoint = (plane: Plane, ang: number, r: number) => {
    const b = planeBasis(plane);
    const c = Math.sin(ang) * r;
    const s = Math.cos(ang) * r;
    return { x: b.rx * c + b.ux * s, y: b.ry * c + b.uy * s, z: b.rz * c + b.uz * s };
  };
  const planeScreen = (plane: Plane, ang: number, r: number) => {
    const p = planePoint(plane, ang, r);
    return project(p.x, p.y, p.z);
  };

  // Same #001 dial constants:
  const FACE_R = 96;
  const TICK_OUTER = 92;
  const TICK_HOUR_INNER = 82;
  const TICK_MIN_INNER = 88;
  const NUMERAL_R = 70;

  // Render a slimmed-down dial laid flat on one plane:
  //   - rim circle
  //   - 4 cardinal ticks (12 / 3 / 6 / 9) only
  const Dial = ({ plane }: { plane: Plane }) => (
    <g>
      {/* face rim (ellipse) */}
      <polyline
        points={Array.from({ length: 97 })
          .map((_, i) => {
            const ang = (i / 96) * 2 * Math.PI;
            const p = planeScreen(plane, ang, FACE_R);
            return `${p.sx} ${p.sy}`;
          })
          .join(" ")}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      {/* 4 cardinal ticks (12 / 3 / 6 / 9) */}
      {[0, 3, 6, 9].map((i) => {
        const ang = (i / 12) * 2 * Math.PI;
        const outer = planeScreen(plane, ang, TICK_OUTER);
        const inner = planeScreen(plane, ang, TICK_HOUR_INNER);
        return (
          <line
            key={i}
            x1={outer.sx}
            y1={outer.sy}
            x2={inner.sx}
            y2={inner.sy}
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );

  // Render one hand: from -tail in its plane through center to +tip in its plane.
  const Hand = ({
    plane,
    ang,
    tip,
    tail,
    color,
    width,
  }: {
    plane: Plane;
    ang: number;
    tip: number;
    tail: number;
    color: string;
    width: number;
  }) => {
    const a = planeScreen(plane, ang + Math.PI, tail);
    const b = planeScreen(plane, ang, tip);
    return (
      <line
        x1={a.sx}
        y1={a.sy}
        x2={b.sx}
        y2={b.sy}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Orb clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" />

      <Dial plane="xz" />
      <Dial plane="yz" />
      <Dial plane="xy" />

      {now && (
        <>
          {/* #001 hand sizes: hour tip=50 tail=10, minute tip=74 tail=14,
              second tip=84 tail=20 — applied within each plane. */}
          <Hand plane="xz" ang={hourAng} tip={50} tail={10} color="#1a1a1a" width={5} />
          <Hand plane="yz" ang={minAng} tip={74} tail={14} color="#1a1a1a" width={3} />
          <Hand plane="xy" ang={secAng} tip={84} tail={20} color="#c1121f" width={1.5} />
          <circle cx="0" cy="0" r="1.5" fill="#c1121f" />
        </>
      )}

      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </svg>
  );
}

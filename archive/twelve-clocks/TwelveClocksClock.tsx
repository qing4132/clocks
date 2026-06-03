"use client";

import { useEffect, useRef, type JSX } from "react";

/**
 * #019 — Twelve Clocks (seamless fractal zoom, cycling through the dozen).
 *
 *   A #001 dial holds 12 mini-clocks at its numeral positions; each mini
 *   holds 12 of its own, and so on. Every clock shows the real time. Each
 *   5-second window the camera dives into one child; over a minute it works
 *   its way around all twelve.
 *
 *   The irreducible trade-off
 *   -------------------------
 *   With NO view rotation, you cannot have all of: (a) dive into a DIFFERENT
 *   child each cycle, (b) a perfectly seamless wrap, and (c) zero velocity
 *   discontinuity. Proof sketch: a no-rotation camera is x ↦ s·x + t. A
 *   seamless, smooth wrap forces the post-wrap motion (after the dived-into
 *   child is relabelled as the new main) to keep heading toward that main's
 *   TOP child — so to stay smooth every cycle must dive into the same
 *   relative child, i.e. it can't cycle. Cycling therefore costs either a
 *   small kink or a rotation. We keep the view upright and accept the kink.
 *
 *   Per-child fixed-point zoom (kills the big bounce)
 *   -------------------------------------------------
 *   Within a window we zoom about the child's accumulation point
 *       p = c / (1 − k)        (c = child centre, k = child scale)
 *   which is where that child's own nested top-children converge. A pure
 *   scale about p,
 *       T_u(x) = p + s·(x − p),   s = (1/k)^u,   u = (sec mod 5)/5,
 *   is the identity at u=0 (full upright dial) and at u=1 sends the child's
 *   centre to the origin scaled by exactly 1/k, so the child fills the frame
 *   as a self-similar full dial — seamless. Because log(s) is linear in time
 *   the PERCEIVED zoom speed is constant across the wrap (no zoom pulse).
 *   The only residual is a gentle change of pan direction at the wrap as the
 *   focus hops to the next child — the unavoidable kink above.
 *
 *   Hands: one extra nested level is rendered (down to HAND_DEPTH) so that a
 *   child growing toward main size already contains hand-bearing grand- and
 *   great-grand-children — the hands are simply THERE as they swell into
 *   view instead of popping into existence.
 */
export default function TwelveClocksClock() {
  const cameraRef = useRef<SVGGElement | null>(null);
  const hourRefs = useRef<(SVGGElement | null)[]>([]);
  const minRefs = useRef<(SVGGElement | null)[]>([]);

  // Geometry.
  const R = 66; // radius of the ring of children
  const k = 0.16; // child scale ratio
  const INV_K = 1 / k; // self-similar zoom factor (6.25)

  // Recursion. Hands are rendered one level deeper than before so they never
  // pop in. MAX_DEPTH = HAND_DEPTH here so the deepest hand-bearing clocks
  // are also the leaves (their missing children are sub-pixel anyway).
  const MAX_DEPTH = 3; // 1 + 12 + 144 + 1728 nodes
  const HAND_DEPTH = 3;

  // Radius of every child's accumulation point (where its own nested top-
  // children converge) — the per-window fixed point the camera zooms about.
  const ACCUM_R = R / (1 - k);
  // Fraction of each 5-second window spent rounding the direction corner. The
  // 30° change of dive direction is eased through here (smoothstep, zero
  // velocity at both ends) right after the wrap, while the zoom is still ~1×
  // so the off-centre aim is imperceptible; the rest of the window dives dead
  // straight into the child. This turns the velocity kink into a small arc.
  const CORNER = 0.18;

  useEffect(() => {
    let raf = 0;

    const loop = () => {
      const now = new Date();
      const sFrac = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      // Which child this window dives into (one per 5 s, all twelve a minute).
      const wf = sFrac / 5;
      const w = Math.floor(wf);
      const u = wf - w;

      // Dive-direction angle: held at this child (θ_w = w·30 − 90) for most of
      // the window, but eased up from the previous child's angle during the
      // first CORNER fraction so the corner at the wrap becomes a smooth arc.
      // At u=1 the angle is exactly θ_w, so the self-similar wrap is preserved.
      const ease = u < CORNER ? (() => {
        const x = u / CORNER;
        return x * x * (3 - 2 * x); // smoothstep, zero slope at 0 and 1
      })() : 1;
      const angle = ((w * 30 - 90 - 30 + 30 * ease) * Math.PI) / 180;
      const px = Math.cos(angle) * ACCUM_R;
      const py = Math.sin(angle) * ACCUM_R;

      // Pure exponential scale about that fixed point.
      const s = Math.pow(INV_K, u); // 1 → 1/k
      const tx = px * (1 - s);
      const ty = py * (1 - s);
      cameraRef.current?.setAttribute(
        "transform",
        `translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${s.toFixed(5)})`,
      );

      // Every hand at every level reads the true time.
      const hourAngle = h * 30 + m * 0.5 + sFrac * (0.5 / 60);
      const minuteAngle = m * 6 + sFrac * 0.1;
      const ht = `rotate(${hourAngle.toFixed(3)})`;
      const mt = `rotate(${minuteAngle.toFixed(3)})`;
      for (const r of hourRefs.current) r?.setAttribute("transform", ht);
      for (const r of minRefs.current) r?.setAttribute("transform", mt);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [INV_K, ACCUM_R]);

  const round = (n: number) => Math.round(n * 1000) / 1000;

  const childPositions = Array.from({ length: 12 }).map((_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    return { x: round(Math.cos(a) * R), y: round(Math.sin(a) * R) };
  });

  // Reset hand-ref arrays on every render; ref callbacks repopulate them.
  hourRefs.current = [];
  minRefs.current = [];
  const register = (el: SVGGElement | null, kind: "h" | "m") => {
    if (kind === "h") hourRefs.current.push(el);
    else minRefs.current.push(el);
  };

  // The dial is just a filled disc (no border).
  const dial = (key: string): JSX.Element => (
    <circle key={key} cx="0" cy="0" r="96" fill="#fafaf7" />
  );

  const hands = (key: string): JSX.Element => (
    <g key={key}>
      <g ref={(el) => register(el, "h")}>
        <line x1="0" y1="7" x2="0" y2="-32" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g ref={(el) => register(el, "m")}>
        <line x1="0" y1="10" x2="0" y2="-46" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </g>
  );

  // Recursive self-similar node. Built once at mount; the loop only updates
  // the camera transform and the hand rotations.
  const renderNode = (depth: number, key: string): JSX.Element => (
    <g key={key}>
      {dial(`${key}-d`)}
      {depth < MAX_DEPTH &&
        childPositions.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${k})`}>
            {renderNode(depth + 1, `${key}-${i}`)}
          </g>
        ))}
      {depth <= HAND_DEPTH && hands(`${key}-h`)}
    </g>
  );

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Twelve clocks — seamless fractal zoom diving through twelve self-similar clocks"
    >
      <defs>
        <clipPath id="twelve-clocks-clip">
          <circle cx="0" cy="0" r="96" />
        </clipPath>
      </defs>

      <g clipPath="url(#twelve-clocks-clip)">
        <g ref={cameraRef}>{renderNode(0, "n")}</g>
      </g>
    </svg>
  );
}

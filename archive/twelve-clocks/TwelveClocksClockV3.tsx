"use client";

import { useEffect, useMemo, useRef, type JSX } from "react";

/**
 * Twelve Clocks — an endless self-similar dive that cycles through
 * all twelve children, one every five seconds.
 *
 * A #001 face whose twelve hour marks aren't numerals but twelve tiny
 * copies of the same face; each tiny copy holds twelve of its own; and
 * so on. Every 5 seconds the camera zooms exponentially by 1/k about
 * the accumulation point of ONE of the twelve children — over a full
 * minute it dives through all twelve in turn. Because the dial is
 * 12-fold rotationally symmetric (twelve identical ticks, no numerals),
 * a dive into any child is just a rotated copy of the dive into any
 * other, so all twelve dives use the same animation with only the
 * destination parameters changed.
 *
 * There is NO red second hand. The dive itself IS the second hand:
 * every 5-second slot chooses a numeral position and plunges toward
 * it. Watching which child is being dived into tells you which of
 * the twelve 5-second slots the current second falls in.
 *
 * Every dial on every level shows the real hour and minute.
 *
 * Two design details that keep the wrap a visual no-op:
 *
 * 1. Exp zoom about EACH child's accumulation point p = c/(1−k). At
 *    u=1 that child fills the frame in the same pixels the whole dial
 *    filled at u=0 — self-similarity — so the u=1 → u=0 wrap is
 *    invisible even though the camera transform jumps.
 *
 * 2. Fade the L0 hands (opacity ∝ (1−u)^1.5). Without the fade, L0's
 *    hands would balloon to 6.25× and swamp the child right before
 *    the wrap. With it, the dive-target child's own hands grow
 *    smoothly into the same screen slot (self-similarity again), so
 *    the "current time" reading of the dial never breaks.
 */

const INK = "#1a1a1a";
const PAPER = "#fafaf7";

const RIM_R = 96;
const RING_R = 64;
const K = 0.16;
const INV_K = 1 / K; // 6.25
const MAX_DEPTH = 3; // face circles at 4 levels: 1 + 12 + 144 + 1728 = 1885
const HAND_DEPTH = 2; // hands at 3 levels — L3 would be sub-pixel

// The twelve children sit on a ring at RING_R, indexed clockwise from
// 12 o'clock. child[w] is the target during 5-second window w.
const CHILD_POSITIONS = Array.from({ length: 12 }).map((_, i) => {
  const a = ((i * 30 - 90) * Math.PI) / 180;
  return {
    x: Math.round(Math.cos(a) * RING_R * 1000) / 1000,
    y: Math.round(Math.sin(a) * RING_R * 1000) / 1000,
  };
});

// Accumulation point for each child: where its own 12-o'clock spine
// (child, grand-child-at-12, …) converges. Exp zoom is centred here so
// perceived pan speed stays constant across the seam.
const ACCUM_POSITIONS = CHILD_POSITIONS.map((p) => ({
  x: p.x / (1 - K),
  y: p.y / (1 - K),
}));

export default function TwelveClocksClock() {
  const cameraRef = useRef<SVGGElement | null>(null);
  const rootHandsRef = useRef<SVGGElement | null>(null);
  const hourRefs = useRef<(SVGGElement | null)[]>([]);
  const minRefs = useRef<(SVGGElement | null)[]>([]);

  const tree = useMemo(() => {
    let hIdx = 0;
    let mIdx = 0;

    // A dial's face + 12 hour ticks. Deliberately 12-fold symmetric (no
    // numerals) so the recursion is literally self-similar AND all
    // twelve dive destinations are geometrically equivalent. Strokes
    // scale with the transform — a 2.5-unit tick becomes 0.4 at L1,
    // 0.064 at L2, sub-pixel at L3. That softening IS the Droste optic.
    const dialFace = (key: string): JSX.Element => (
      <g key={key}>
        <circle cx="0" cy="0" r={RIM_R} fill={PAPER} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={-92}
            x2="0"
            y2={-82}
            stroke={INK}
            strokeWidth={2.5}
            strokeLinecap="round"
            transform={`rotate(${i * 30})`}
          />
        ))}
      </g>
    );

    const hands = (depth: number, key: string): JSX.Element => {
      const myH = hIdx++;
      const myM = mIdx++;
      // L0's hand group gets an extra ref so its opacity can be faded
      // as the dive progresses (see the rAF loop). Depths ≥ 1 draw
      // plainly — for the dive-target child those ARE the visible
      // main hands at u=1.
      const groupRef = depth === 0 ? rootHandsRef : undefined;
      return (
        <g key={key} ref={groupRef}>
          <g ref={(el) => { hourRefs.current[myH] = el; }}>
            <line x1="0" y1="10" x2="0" y2="-50" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          </g>
          <g ref={(el) => { minRefs.current[myM] = el; }}>
            <line x1="0" y1="14" x2="0" y2="-74" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="0" cy="0" r="4" fill={INK} />
        </g>
      );
    };

    // Order: face → hands → children. Children drawn last so that at
    // u→1 the blown-up dive target buries the parent's dial face and
    // (now-faded) hand tails behind it.
    const renderNode = (depth: number, key: string): JSX.Element => (
      <g key={key}>
        {dialFace(`${key}-f`)}
        {depth <= HAND_DEPTH && hands(depth, `${key}-h`)}
        {depth < MAX_DEPTH &&
          CHILD_POSITIONS.map((p, i) => (
            <g key={`c${i}`} transform={`translate(${p.x} ${p.y}) scale(${K})`}>
              {renderNode(depth + 1, `${key}-${i}`)}
            </g>
          ))}
      </g>
    );

    return renderNode(0, "n");
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = new Date();
      const sFrac = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      // Which of the twelve children this 5-second slot is diving into,
      // and how far through the dive we are.
      //   w = 0 for sec ∈ [0, 5)   → child at 12 o'clock
      //   w = 1 for sec ∈ [5, 10)  → child at  1 o'clock
      //   …
      //   w = 11 for sec ∈ [55,60) → child at 11 o'clock
      const wf = sFrac / 5;
      const w = Math.floor(wf) % 12;
      const u = wf - Math.floor(wf);

      // Exp zoom about child w's accumulation point.
      //   scale s = (1/k)^u   →  1 at u=0, 1/k at u=1
      //   translate = p_w · (1 − s)
      // At u=1 child w fills the frame in the exact pixels the whole
      // dial fills at u=0 (self-similarity), so u=1 → u=0 wraps without
      // any visible jump — even though the camera transform snaps back
      // to identity AND the next window's target is a different child.
      // log(s) is linear in u ⇒ perceived zoom speed is constant across
      // the seam ⇒ no zoom pulse.
      const s = Math.pow(INV_K, u);
      const accum = ACCUM_POSITIONS[w];
      const tx = accum.x * (1 - s);
      const ty = accum.y * (1 - s);
      cameraRef.current?.setAttribute(
        "transform",
        `translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${s.toFixed(5)})`,
      );

      // Fade the L0 hands as the dive-target child grows into the frame.
      // Without this, L0's hands would balloon to 6.25× and swamp the
      // view right before the wrap. The child's own hands grow smoothly
      // into the same screen slot (self-similarity), so the "main hands"
      // reading of the dial never breaks and the wrap costs nothing.
      //
      // Curve max(0, 1 − 2.5·u) — clean linear fade fully to 0 by u=0.4.
      // With cycling the dive direction and the parent's hand direction
      // are unrelated, so a slow fade leaves the parent's growing hand
      // pointing off into empty space beside the plunge, which reads as
      // clutter. Fast linear fade lets the plunge take over the eye
      // early and keeps the middle of each window visually calm.
      const rootOpacity = Math.max(0, 1 - 2.5 * u);
      rootHandsRef.current?.setAttribute("opacity", rootOpacity.toFixed(3));

      // Every hand on every level reads the actual current hour/minute.
      // No second hand: the dive itself is what marks the seconds.
      const hourAngle = h * 30 + m * 0.5 + sFrac * (0.5 / 60);
      const minuteAngle = m * 6 + sFrac * 0.1;
      const ht = `rotate(${hourAngle.toFixed(3)})`;
      const mt = `rotate(${minuteAngle.toFixed(3)})`;
      for (const el of hourRefs.current) el?.setAttribute("transform", ht);
      for (const el of minRefs.current) el?.setAttribute("transform", mt);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Twelve clocks — an endless dive through twelve self-similar children, one every five seconds"
    >
      <defs>
        <clipPath id="twelve-clocks-clip">
          <circle cx="0" cy="0" r={RIM_R} />
        </clipPath>
      </defs>
      {/* Fixed picture frame. Sits OUTSIDE the clip so it stays put
          while the camera dives — it's the window into the fractal. */}
      <circle cx="0" cy="0" r={RIM_R} fill="none" stroke={INK} strokeWidth="3" />
      <g clipPath="url(#twelve-clocks-clip)">
        <g ref={cameraRef}>{tree}</g>
      </g>
    </svg>
  );
}

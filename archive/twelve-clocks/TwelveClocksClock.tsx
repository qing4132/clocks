"use client";

import { useEffect, useRef } from "react";

/**
 * #014 — Twelve Clocks (seamless fractal zoom).
 *
 *   Layout: one main clock + 12 mini-clocks (one at each numeral position)
 *   + 144 grand-mini-clocks (one at each mini's numeral positions). All
 *   levels carry their own hour & minute hands, all synced to real time.
 *
 *   Animation: every 5 seconds the camera linearly zooms in on the
 *   12-o'clock mini-clock. By the end of the 5-second window:
 *     - that mini-clock has grown to fill the viewport (scale = 8 = 96/12)
 *     - because the mini contains 12 grand-children of its own at the
 *       same relative layout, the image at scale 8 is visually identical
 *       to the image at scale 1
 *   So scale wraps from 8 back to 1 with no visible jump.
 *
 *   Read time off the (always-visible) main hands.
 */
export default function TwelveClocksClock() {
  const cameraRef = useRef<SVGGElement | null>(null);
  const lvl0HourRef = useRef<SVGGElement | null>(null);
  const lvl0MinRef = useRef<SVGGElement | null>(null);
  const lvl1HourRefs = useRef<(SVGGElement | null)[]>(new Array(12).fill(null));
  const lvl1MinRefs = useRef<(SVGGElement | null)[]>(new Array(12).fill(null));
  const lvl2HourRefs = useRef<(SVGGElement | null)[]>(new Array(144).fill(null));
  const lvl2MinRefs = useRef<(SVGGElement | null)[]>(new Array(144).fill(null));

  useEffect(() => {
    let raf = 0;
    // Geometry
    const RING_R = 70;
    const MINI_R = 12;
    const FINAL_SCALE = 96 / MINI_R; // 8 exactly
    // Target is the 12-o'clock mini, fixed forever for seamless loop.
    const cx = 0;
    const cy = -RING_R; // -70

    const loop = () => {
      const now = new Date();
      const sFrac = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      // 5-second window, linear progress 0..1.
      const u = (sFrac % 5) / 5;
      // Linear scale 1 → FINAL_SCALE.
      const scale = 1 + (FINAL_SCALE - 1) * u;
      // We want the transformation T(p) = scale·p + t such that:
      //   T(c) = (1 - u) · c + u · 0      (target slides from c to 0 linearly)
      // Solve for t:
      //   scale·c + t = (1 - u) · c
      //   t = (1 - u - scale) · c
      // At u=0: scale=1, t = (1 - 0 - 1)·c = 0 → identity (full original frame)
      // At u=1: scale=FINAL, t = (1 - 1 - FINAL)·c = -FINAL·c
      //         → T(c) = FINAL·c - FINAL·c = 0 (target at origin), ✓
      // At u=1 the target mini has been scaled by FINAL and centred,
      // which is exactly the visually-identical self-similar frame.
      const tx = (1 - u - scale) * cx;
      const ty = (1 - u - scale) * cy;
      cameraRef.current?.setAttribute(
        "transform",
        `translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(4)})`,
      );

      const hourAngle = h * 30 + m * 0.5;
      const minuteAngle = m * 6 + sFrac * 0.1;
      const ha = `rotate(${hourAngle.toFixed(3)})`;
      const ma = `rotate(${minuteAngle.toFixed(3)})`;
      lvl0HourRef.current?.setAttribute("transform", ha);
      lvl0MinRef.current?.setAttribute("transform", ma);
      for (const r of lvl1HourRefs.current) r?.setAttribute("transform", ha);
      for (const r of lvl1MinRefs.current) r?.setAttribute("transform", ma);
      for (const r of lvl2HourRefs.current) r?.setAttribute("transform", ha);
      for (const r of lvl2MinRefs.current) r?.setAttribute("transform", ma);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const round = (n: number) => Math.round(n * 1000) / 1000;
  const RING_R = 70;
  const MINI_R = 12;
  const k = MINI_R / 100;

  // Dial face: outer rim + 48 minor ticks. The 12 "hour ticks" are
  // omitted because the mini-clocks sit at those positions.
  const Dial = () => (
    <>
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />
      {Array.from({ length: 60 }).map((_, i) => {
        if (i % 5 === 0) return null;
        return (
          <line
            key={i}
            x1="0"
            y1={-92}
            x2="0"
            y2={-88}
            stroke="#1a1a1a"
            strokeWidth="1"
            strokeLinecap="round"
            transform={`rotate(${i * 6})`}
          />
        );
      })}
    </>
  );

  const Hands = ({
    hourRef,
    minRef,
  }: {
    hourRef: (el: SVGGElement | null) => void;
    minRef: (el: SVGGElement | null) => void;
  }) => (
    <>
      <g ref={hourRef}>
        <line x1="0" y1="10" x2="0" y2="-50" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g ref={minRef}>
        <line x1="0" y1="14" x2="0" y2="-74" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
    </>
  );

  const childPositions = Array.from({ length: 12 }).map((_, i) => {
    const angle = ((i * 30) - 90) * (Math.PI / 180);
    return { x: round(Math.cos(angle) * RING_R), y: round(Math.sin(angle) * RING_R) };
  });

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Twelve clocks with infinite zoom"
    >
      <defs>
        <clipPath id="twelve-clocks-clip">
          <circle cx="0" cy="0" r="96" />
        </clipPath>
      </defs>

      <g clipPath="url(#twelve-clocks-clip)">
        <g ref={cameraRef}>
          {/* LEVEL 0: main dial */}
          <Dial />

          {/* LEVEL 1: 12 mini-clocks; each has a dial + hands + 12 grandchildren */}
          {childPositions.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y}) scale(${k})`}>
              <Dial />
              {childPositions.map((q, j) => (
                <g key={j} transform={`translate(${q.x} ${q.y}) scale(${k})`}>
                  <Dial />
                  <Hands
                    hourRef={(el) => (lvl2HourRefs.current[i * 12 + j] = el)}
                    minRef={(el) => (lvl2MinRefs.current[i * 12 + j] = el)}
                  />
                </g>
              ))}
              <Hands
                hourRef={(el) => (lvl1HourRefs.current[i] = el)}
                minRef={(el) => (lvl1MinRefs.current[i] = el)}
              />
            </g>
          ))}

          {/* LEVEL 0 hands on top */}
          <Hands
            hourRef={(el) => (lvl0HourRef.current = el)}
            minRef={(el) => (lvl0MinRef.current = el)}
          />
        </g>
      </g>
    </svg>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Twelve Clocks · Tunnel (Vast).
 *
 * The Drift tunnel (#020), exact same mechanism, opened up wide: only a handful
 * of bold rings with a large growth ratio, so each ring is huge and the gaps
 * yawn between them, and the vanishing point leans hard — a dramatic, cavernous
 * banking dive instead of a steady stream.
 */
const RING_COUNT = 7;
const GROW = 2.0; // large ratio → few, widely spaced rings
const VP_R = 44; // big amplitude → dramatic lean
const R0 = 3.2;
const ADVANCE = 5;
const SWEEP = 60;

export default function TunnelVastClock() {
  const ringRefs = useRef<(SVGGElement | null)[]>([]);
  const hubRef = useRef<SVGGElement | null>(null);
  const hourRef = useRef<SVGGElement | null>(null);
  const minRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = new Date();
      const sFrac = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      const phase = (sFrac % ADVANCE) / ADVANCE;
      const dir = (((sFrac / SWEEP) * 360 - 90) * Math.PI) / 180;
      const vx = Math.cos(dir) * VP_R;
      const vy = Math.sin(dir) * VP_R;

      for (let i = 0; i < RING_COUNT; i++) {
        const g = ringRefs.current[i];
        if (!g) continue;
        const r = R0 * Math.pow(GROW, phase + i);
        const scale = r / 100;
        const lean = 1 - Math.min(1, r / 110);
        const cx = vx * lean;
        const cy = vy * lean;
        const opacity = Math.min(1, r / 8);
        g.setAttribute(
          "transform",
          `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${scale.toFixed(4)})`,
        );
        g.setAttribute("opacity", opacity.toFixed(3));
      }

      hubRef.current?.setAttribute("transform", `translate(${vx.toFixed(2)} ${vy.toFixed(2)})`);
      const hourAngle = h * 30 + m * 0.5 + sFrac * (0.5 / 60);
      const minuteAngle = m * 6 + sFrac * 0.1;
      hourRef.current?.setAttribute("transform", `rotate(${hourAngle.toFixed(3)})`);
      minRef.current?.setAttribute("transform", `rotate(${minuteAngle.toFixed(3)})`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const baseRing = (
    <g>
      <circle cx="0" cy="0" r="100" fill="none" stroke="#1a1a1a" strokeWidth="3.4" />
    </g>
  );

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Twelve clocks — a vast, cavernous tunnel of hour-rings"
    >
      <defs>
        <clipPath id="twelve-tunnel-vast-clip">
          <circle cx="0" cy="0" r="96" />
        </clipPath>
      </defs>
      <g clipPath="url(#twelve-tunnel-vast-clip)">
        <circle cx="0" cy="0" r="96" fill="#fafaf7" />
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <g key={i} ref={(el) => (ringRefs.current[i] = el)}>
            {baseRing}
          </g>
        ))}
        <g ref={hubRef}>
          <g ref={hourRef}>
            <line x1="0" y1="3" x2="0" y2="-16" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g ref={minRef}>
            <line x1="0" y1="4" x2="0" y2="-24" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
          </g>
          <circle cx="0" cy="0" r="2" fill="#1a1a1a" />
        </g>
      </g>
    </svg>
  );
}

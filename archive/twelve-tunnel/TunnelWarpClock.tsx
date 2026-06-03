"use client";

import { useEffect, useRef } from "react";

/**
 * Twelve Clocks · Tunnel (Warp).
 *
 * The drift tunnel pushed to warp speed: the rings are broken into dashes so
 * they read as streaks of stars stretching past you down the corridor. Dashes
 * lengthen with depth and the whole field rolls slowly over the minute, all on
 * a near-black sky.
 */
const RING_COUNT = 13;
const GROW = 1.55;
const VP_R = 30;
const R0 = 2.0;

export default function TunnelWarpClock() {
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
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

      const phase = (sFrac % 5) / 5;
      const dir = (((sFrac / 5) * 30 - 90) * Math.PI) / 180;
      const vx = Math.cos(dir) * VP_R;
      const vy = Math.sin(dir) * VP_R;
      const roll = (sFrac / 60) * 360;

      for (let i = 0; i < RING_COUNT; i++) {
        const g = groupRefs.current[i];
        const c = ringRefs.current[i];
        if (!g || !c) continue;
        const depth = phase + i;
        const r = R0 * Math.pow(GROW, depth);
        const scale = r / 100;
        const lean = 1 - Math.min(1, r / 110);
        const cx = vx * lean;
        const cy = vy * lean;
        const opacity = Math.min(1, r / 8);
        g.setAttribute(
          "transform",
          `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${roll.toFixed(2)}) scale(${scale.toFixed(4)})`,
        );
        g.setAttribute("opacity", opacity.toFixed(3));
        // Longer streaks / bigger gaps the deeper (closer) the ring → warp feel.
        const dash = 6 + depth * 5;
        const gap = 26 + depth * 6;
        c.setAttribute("stroke-dasharray", `${dash.toFixed(1)} ${gap.toFixed(1)}`);
      }

      hubRef.current?.setAttribute(
        "transform",
        `translate(${vx.toFixed(2)} ${vy.toFixed(2)})`,
      );
      const hourAngle = h * 30 + m * 0.5 + sFrac * (0.5 / 60);
      const minuteAngle = m * 6 + sFrac * 0.1;
      hourRef.current?.setAttribute("transform", `rotate(${hourAngle.toFixed(3)})`);
      minRef.current?.setAttribute("transform", `rotate(${minuteAngle.toFixed(3)})`);
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
      aria-label="Twelve clocks — warp-speed star tunnel"
    >
      <defs>
        <clipPath id="twelve-tunnel-warp-clip">
          <circle cx="0" cy="0" r="96" />
        </clipPath>
        <radialGradient id="twelve-tunnel-warp-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1b1d2a" />
          <stop offset="100%" stopColor="#06070c" />
        </radialGradient>
      </defs>
      <g clipPath="url(#twelve-tunnel-warp-clip)">
        <circle cx="0" cy="0" r="96" fill="url(#twelve-tunnel-warp-bg)" />
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <g key={i} ref={(el) => (groupRefs.current[i] = el)}>
            <circle
              ref={(el) => (ringRefs.current[i] = el)}
              cx="0"
              cy="0"
              r="100"
              fill="none"
              stroke="#dfe6ff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        ))}
        <g ref={hubRef}>
          <g ref={hourRef}>
            <line x1="0" y1="3" x2="0" y2="-16" stroke="#dfe6ff" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g ref={minRef}>
            <line x1="0" y1="4" x2="0" y2="-24" stroke="#dfe6ff" strokeWidth="2" strokeLinecap="round" />
          </g>
          <circle cx="0" cy="0" r="2" fill="#dfe6ff" />
        </g>
      </g>
    </svg>
  );
}

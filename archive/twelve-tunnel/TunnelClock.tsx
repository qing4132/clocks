"use client";

import { useEffect, useRef } from "react";

/**
 * Twelve Clocks · Tunnel.
 *
 * The "endless dive" rendered as flight down a tunnel. Concentric hour-rings
 * are BORN at the vanishing point at zero size and swell outward until they
 * leave the rim — because every ring starts from nothing, nothing ever pops
 * in. Rings sit at geometric radii (×GROW apart), so advancing the phase by
 * one full step maps the set onto itself: a perfectly seamless loop.
 *
 * The vanishing point drifts around twelve compass directions over a minute
 * (one every 5 s), preserving the original "cycle through the twelve" idea —
 * each window the tunnel banks toward a new hour.
 */
const RING_COUNT = 11;
const GROW = 1.6; // radius ratio between neighbouring rings

export default function TunnelClock() {
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

      // Continuous outward flow: one whole ring-step every 5 s.
      const phase = (sFrac % 5) / 5;

      // Vanishing point banks toward the current hour-direction (12 per minute).
      const wf = sFrac / 5;
      const w = Math.floor(wf);
      const u = wf - w;
      const ease = u < 0.2 ? (u / 0.2) * (u / 0.2) * (3 - 2 * (u / 0.2)) : 1;
      const dir = ((w * 30 - 90 - 30 + 30 * ease) * Math.PI) / 180;
      const vpR = 10; // how far the vanishing point leans
      const vx = Math.cos(dir) * vpR;
      const vy = Math.sin(dir) * vpR;

      for (let i = 0; i < RING_COUNT; i++) {
        const g = ringRefs.current[i];
        if (!g) continue;
        // Ring i radius grows geometrically with (phase + i); recycles each step.
        const r = 2.2 * Math.pow(GROW, phase + i);
        const scale = r / 100; // base ring drawn at radius 100
        // Lean the ring centre toward the vanishing point, more for nearer rings.
        const lean = 1 - Math.min(1, r / 110);
        const cx = vx * lean;
        const cy = vy * lean;
        const opacity = Math.min(1, r / 8); // fade up from the vanishing point
        g.setAttribute(
          "transform",
          `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${scale.toFixed(4)})`,
        );
        g.setAttribute("opacity", opacity.toFixed(3));
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

  // One reusable ring at radius 100: a circle plus 12 hour ticks.
  const baseRing = (
    <g>
      <circle cx="0" cy="0" r="100" fill="none" stroke="#1a1a1a" strokeWidth="2.4" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const inner = i % 3 === 0 ? 88 : 93;
        return (
          <line
            key={i}
            x1={(Math.cos(a) * inner).toFixed(3)}
            y1={(Math.sin(a) * inner).toFixed(3)}
            x2={(Math.cos(a) * 100).toFixed(3)}
            y2={(Math.sin(a) * 100).toFixed(3)}
            stroke="#1a1a1a"
            strokeWidth={i % 3 === 0 ? 4 : 2}
          />
        );
      })}
    </g>
  );

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Twelve clocks — flying down a tunnel of hour-rings"
    >
      <defs>
        <clipPath id="twelve-tunnel-clip">
          <circle cx="0" cy="0" r="96" />
        </clipPath>
      </defs>
      <g clipPath="url(#twelve-tunnel-clip)">
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

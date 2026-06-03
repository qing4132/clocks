"use client";

import { useEffect, useRef } from "react";

/**
 * Twelve Clocks · Tunnel (Notch).
 *
 * Same drifting-tunnel mechanism as #020: concentric hour-rings fly out of the
 * centre, and the vanishing point sweeps around once a minute (so the dive's
 * lean reads the seconds). The hour and minute hands keep exactly the original
 * #020 shape and width — round-capped lines of stroke 3 and 2 — but they are
 * painted in the paper colour and extended far past the rim. Sitting on the top
 * layer, each one erases the rings it crosses, carving a clean radial notch all
 * the way down the tunnel.
 */
const RING_COUNT = 11;
const GROW = 1.6;
const VP_R = 26;
const R0 = 2.2;

const PAPER = "#fafaf7";
const HAND_LEN = 200; // how far the hands reach out from the hub

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

      const phase = (sFrac % 5) / 5;

      const dir = (((sFrac / 5) * 30 - 90) * Math.PI) / 180;
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

  const baseRing = (
    <g>
      <circle cx="0" cy="0" r="100" fill="none" stroke="#1a1a1a" strokeWidth="2.4" />
    </g>
  );

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Twelve clocks — drifting tunnel whose rings are notched by two long paper-coloured hands"
    >
      <defs>
        <clipPath id="twelve-tunnel-notch-clip">
          <circle cx="0" cy="0" r="96" />
        </clipPath>
      </defs>
      <g clipPath="url(#twelve-tunnel-notch-clip)">
        <circle cx="0" cy="0" r="96" fill={PAPER} />
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <g key={i} ref={(el) => (ringRefs.current[i] = el)}>
            {baseRing}
          </g>
        ))}

        {/* Hour and minute hands: original #020 shape & width, paper-coloured and
            extended so they carve radial notches through every ring. */}
        <g ref={hubRef}>
          <g ref={hourRef}>
            <line x1="0" y1="3" x2="0" y2={(-HAND_LEN).toFixed(2)} stroke={PAPER} strokeWidth="3" strokeLinecap="round" />
          </g>
          <g ref={minRef}>
            <line x1="0" y1="4" x2="0" y2={(-HAND_LEN).toFixed(2)} stroke={PAPER} strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
}

"use client";

import React from "react";
import { useWallClock } from "../useWallClock";

// High fidelity 30fps refresh for perfectly smooth continuous movement
export function useSmoothCatAngles() {
  const now = useWallClock(32);
  
  if (!now) {
    return {
      now: null,
      hourAngle: 0,
      minuteAngle: 0,
      secondAngle: 0,
      px: 0,
      py: 0,
    };
  }

  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();

  const sFloat = s + ms / 1000;
  const minuteFloat = m + sFloat / 60;
  const hourFloat = h + minuteFloat / 60;

  const hourAngle = hourFloat * 30;
  const minuteAngle = minuteFloat * 6;
  const secondAngle = sFloat * 6;

  // The head rotates with the Hour. Thus the tracking of the laser (Second)
  // relative to the head is secondAngle - hourAngle.
  const relativeAngle = secondAngle - hourAngle;
  const thetaR = (relativeAngle * Math.PI) / 180;
  
  const px = Math.sin(thetaR) * 2.5;
  const py = -Math.cos(thetaR) * 2.5;

  return {
    now,
    hourAngle,
    minuteAngle,
    secondAngle,
    px,
    py,
  };
}

export default function CatClock() {
  const { now, hourAngle, minuteAngle, secondAngle, px, py } = useSmoothCatAngles();
  
  // Calculate scaled path from tailEnd 68 relative to original 77
  const scale = 68 / 77;
  const q1x = 32 * scale;
  const q1y = -32 * scale;
  const q2x = 14 * scale;
  const q2y = -55 * scale;
  const ty = -68;
  const laserRadius = 86;

  return (
    <svg viewBox="-100 -100 200 200" className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl" role="img" aria-label="Cat clock">
      <defs>
        <filter id="laser-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="cat-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Carpet background */}
      <circle cx="0" cy="0" r="96" fill="#F4EFE6" stroke="#dcd3c4" strokeWidth="2" />

      {now && (
        <g filter="url(#cat-shadow)">
          {/* Tail = Minute */}
          <g transform={`rotate(${minuteAngle})`}>
            <path d={`M 0 0 Q ${q1x} ${q1y} ${q2x} ${q2y} T 0 ${ty}`} fill="none" stroke="#1a1a1a" strokeWidth="9.6" strokeLinecap="round" />
          </g>
          
          {/* Body */}
          <circle cx="0" cy="0" r="33" fill="#1a1a1a" />
          
          {/* Head = Hour */}
          <g transform={`rotate(${hourAngle})`}>
            <g transform="scale(1.07)">
              <path d="M -15 -20 L -26 -40 L -5 -28 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
              <path d="M 15 -20 L 26 -40 L 5 -28 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
              
              <ellipse cx="-10" cy="-8" rx="4.5" ry="7" fill="#f1c40f" />
              <circle cx={-10 + Number(px)} cy={-8 + Number(py)} r="2.5" fill="#111" />
              
              <ellipse cx="10" cy="-8" rx="4.5" ry="7" fill="#f1c40f" />
              <circle cx={10 + Number(px)} cy={-8 + Number(py)} r="2.5" fill="#111" />
              
              <polygon points="-2,3 2,3 0,5.5" fill="#ff7675" opacity="0.9" />
            </g>
          </g>
        </g>
      )}

      {/* Laser = Second */}
      {now && (
        <g transform={`rotate(${secondAngle})`}>
          <circle cx="0" cy={-laserRadius} r="3.5" fill="#ff0000" filter="url(#laser-glow)" />
        </g>
      )}
    </svg>
  );
}

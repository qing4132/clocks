"use client";

import { useWallClock } from "../../useWallClock";

type Variant = "base" | "drift" | "notch" | "vast" | "warp";

const PAPER = "#fafaf7";
const INK = "#1a1a1a";

const CONFIG: Record<Variant, { rings: number; growth: number; vanishingRadius: number; initialRadius: number }> = {
  base: { rings: 11, growth: 1.6, vanishingRadius: 10, initialRadius: 2.2 },
  drift: { rings: 11, growth: 1.6, vanishingRadius: 26, initialRadius: 2.2 },
  notch: { rings: 11, growth: 1.6, vanishingRadius: 26, initialRadius: 2.2 },
  vast: { rings: 7, growth: 2, vanishingRadius: 44, initialRadius: 3.2 },
  warp: { rings: 13, growth: 1.55, vanishingRadius: 30, initialRadius: 2 },
};

function Tunnel({ variant }: { variant: Variant }) {
  const now = useWallClock(32);
  const config = CONFIG[variant];
  const second = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const phase = second % 5 / 5;
  let direction: number;
  if (variant === "base") {
    const windowFloat = second / 5;
    const windowIndex = Math.floor(windowFloat);
    const progress = windowFloat - windowIndex;
    const x = progress < 0.2 ? progress / 0.2 : 1;
    const ease = progress < 0.2 ? x * x * (3 - 2 * x) : 1;
    direction = (windowIndex * 30 - 120 + 30 * ease) * Math.PI / 180;
  } else {
    direction = (second / 5 * 30 - 90) * Math.PI / 180;
  }
  const vanishingX = Math.cos(direction) * config.vanishingRadius;
  const vanishingY = Math.sin(direction) * config.vanishingRadius;
  const hourAngle = now ? (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 + second / 120 : 0;
  const minuteAngle = now ? now.getMinutes() * 6 + second * 0.1 : 0;
  const warp = variant === "warp";
  const notch = variant === "notch";
  const clipId = `archive-tunnel-${variant}-clip`;
  const backgroundId = `archive-tunnel-${variant}-background`;
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label={`Archived ${variant} tunnel clock`}>
      <defs>
        <clipPath id={clipId}><circle r="96" /></clipPath>
        {warp && <radialGradient id={backgroundId}><stop offset="0%" stopColor="#1b1d2a" /><stop offset="100%" stopColor="#06070c" /></radialGradient>}
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle r="96" fill={warp ? `url(#${backgroundId})` : PAPER} />
        {now && Array.from({ length: config.rings }, (_, index) => {
          const depth = phase + index;
          const radius = config.initialRadius * Math.pow(config.growth, depth);
          const scale = radius / 100;
          const lean = 1 - Math.min(1, radius / 110);
          const centerX = vanishingX * lean;
          const centerY = vanishingY * lean;
          const opacity = Math.min(1, radius / 8);
          const rotation = warp ? second / 60 * 360 : 0;
          const stroke = warp ? "#dfe6ff" : INK;
          const strokeWidth = variant === "vast" ? 3.4 : warp ? 2.2 : 2.4;
          return (
            <g key={index} opacity={opacity} transform={`translate(${centerX.toFixed(2)} ${centerY.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${scale.toFixed(4)})`}>
              <circle r="100" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={warp ? "round" : undefined} strokeDasharray={warp ? `${(6 + depth * 5).toFixed(1)} ${(26 + depth * 6).toFixed(1)}` : undefined} />
              {variant === "base" && Array.from({ length: 12 }, (_, tick) => {
                const angle = (tick * 30 - 90) * Math.PI / 180;
                const inner = tick % 3 === 0 ? 88 : 93;
                return <line key={tick} x1={(Math.cos(angle) * inner).toFixed(3)} y1={(Math.sin(angle) * inner).toFixed(3)} x2={(Math.cos(angle) * 100).toFixed(3)} y2={(Math.sin(angle) * 100).toFixed(3)} stroke={INK} strokeWidth={tick % 3 === 0 ? 4 : 2} />;
              })}
            </g>
          );
        })}
        {now && <g transform={`translate(${vanishingX.toFixed(2)} ${vanishingY.toFixed(2)})`}>
          <g transform={`rotate(${hourAngle.toFixed(3)})`}><line x1="0" y1="3" x2="0" y2={notch ? -200 : -16} stroke={notch ? PAPER : warp ? "#dfe6ff" : INK} strokeWidth="3" strokeLinecap="round" /></g>
          <g transform={`rotate(${minuteAngle.toFixed(3)})`}><line x1="0" y1="4" x2="0" y2={notch ? -200 : -24} stroke={notch ? PAPER : warp ? "#dfe6ff" : INK} strokeWidth="2" strokeLinecap="round" /></g>
          {!notch && <circle r="2" fill={warp ? "#dfe6ff" : INK} />}
        </g>}
      </g>
    </svg>
  );
}

export function TunnelArchiveClock() {
  return <Tunnel variant="base" />;
}

export function TunnelArchiveDrift() {
  return <Tunnel variant="drift" />;
}

export function TunnelArchiveNotch() {
  return <Tunnel variant="notch" />;
}

export function TunnelArchiveVast() {
  return <Tunnel variant="vast" />;
}

export function TunnelArchiveWarp() {
  return <Tunnel variant="warp" />;
}
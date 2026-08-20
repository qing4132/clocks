"use client";

import { useWallClock } from "../../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";

function signedAngularDistance(angle: number, reference: number) {
  return ((angle - reference + 540) % 360) - 180;
}

function polarPoint(angleDegrees: number, radius: number) {
  const radians = angleDegrees * Math.PI / 180;
  return { x: Math.sin(radians) * radius, y: -Math.cos(radians) * radius };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

export function AttentionLensArchiveClock() {
  const now = useWallClock(32);
  const hours = (now?.getHours() ?? 0) % 12;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds / 120;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Attention lens clock giving more space to the present second">
      <circle r="96" fill={PAPER} stroke={INK} strokeWidth="3" />
      {Array.from({ length: 60 }, (_, index) => {
        const distance = signedAngularDistance(index * 6, secondAngle);
        const angle = secondAngle + distance + 25 * Math.sin(distance * Math.PI / 180);
        return <line key={index} x1="0" y1={index % 5 === 0 ? -81 : -86} x2="0" y2="-92" stroke={INK} strokeWidth={index % 5 === 0 ? 2.3 : 0.9} strokeLinecap="round" transform={`rotate(${angle})`} />;
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const point = polarPoint(index * 30, 68);
        return <text key={index} x={round(point.x)} y={round(point.y)} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, 'Times New Roman', serif" fontSize="12" fill={INK}>{index || 12}</text>;
      })}
      <line x1="0" y1="9" x2="0" y2="-49" stroke={INK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourAngle})`} />
      <line x1="0" y1="13" x2="0" y2="-72" stroke={INK} strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
      <line x1="0" y1="-79" x2="0" y2="-93" stroke={RED} strokeWidth="2" strokeLinecap="round" transform={`rotate(${secondAngle})`} />
      <circle r="4" fill={INK} />
    </svg>
  );
}

function arcPoint(angleDegrees: number) {
  const angle = (angleDegrees - 90) * Math.PI / 180;
  return { x: round(Math.cos(angle) * 96), y: round(Math.sin(angle) * 96) };
}

export function ArcArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;
  const hour = arcPoint(hourAngle);
  const minute = arcPoint(minuteAngle);
  const sweep = ((minuteAngle - hourAngle) % 360 + 360) % 360;
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label="Arc clock">
      {now && <><path d={`M ${hour.x} ${hour.y} A 96 96 0 ${sweep > 180 ? 1 : 0} 1 ${minute.x} ${minute.y}`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" /><circle cx={hour.x} cy={hour.y} r="3" fill={INK} /></>}
    </svg>
  );
}

export function SmileArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds / 120;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Smile clock">
      <circle r="96" fill="#ffd93d" stroke={INK} strokeWidth="3" />
      <path d="M -30 36 Q 0 64 30 36" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      {now && <><g transform={`translate(-30, -25) rotate(${hourAngle})`}><circle cy="-12" r="7" fill={INK} /></g><g transform={`translate(30, -25) rotate(${minuteAngle})`}><circle cy="-12" r="7" fill={INK} /></g></>}
    </svg>
  );
}

export function CatArchiveClock() {
  const now = useWallClock(32);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now?.getMinutes() ?? 0;
  const secondFloat = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const minuteFloat = minutes + secondFloat / 60;
  const hourAngle = (hours + minuteFloat / 60) * 30;
  const minuteAngle = minuteFloat * 6;
  const secondAngle = secondFloat * 6;
  const relativeAngle = (secondAngle - hourAngle) * Math.PI / 180;
  const pupilX = Math.sin(relativeAngle) * 2.5;
  const pupilY = -Math.cos(relativeAngle) * 2.5;
  const scale = 68 / 77;
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Cat clock">
      <defs>
        <filter id="archive-laser-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="archive-cat-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.15" /></filter>
      </defs>
      <circle r="96" fill="#f4efe6" stroke="#dcd3c4" strokeWidth="2" />
      {now && <g filter="url(#archive-cat-shadow)">
        <g transform={`rotate(${minuteAngle})`}><path d={`M 0 0 Q ${32 * scale} ${-32 * scale} ${14 * scale} ${-55 * scale} T 0 -68`} fill="none" stroke={INK} strokeWidth="9.6" strokeLinecap="round" /></g>
        <circle r="33" fill={INK} />
        <g transform={`rotate(${hourAngle})`}><g transform="scale(1.07)">
          <path d="M -15 -20 L -26 -40 L -5 -28 Z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" /><path d="M 15 -20 L 26 -40 L 5 -28 Z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="-10" cy="-8" rx="4.5" ry="7" fill="#f1c40f" /><circle cx={-10 + pupilX} cy={-8 + pupilY} r="2.5" fill="#111" /><ellipse cx="10" cy="-8" rx="4.5" ry="7" fill="#f1c40f" /><circle cx={10 + pupilX} cy={-8 + pupilY} r="2.5" fill="#111" />
          <polygon points="-2,3 2,3 0,5.5" fill="#ff7675" opacity="0.9" />
        </g></g>
      </g>}
      {now && <g transform={`rotate(${secondAngle})`}><circle cy="-86" r="3.5" fill="#ff0000" filter="url(#archive-laser-glow)" /></g>}
    </svg>
  );
}

export function SunArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="A round clock whose seconds are told by light">
      {Array.from({ length: 60 }, (_, index) => {
        const hour = index % 5 === 0;
        const baseOuter = hour ? -82 : -78;
        const scale = now && index === seconds ? (hour ? -99 + 64 : -95 + 64) / (baseOuter + 64) : 1;
        return <g key={index} transform={`rotate(${index * 6})`}><line x1="0" y1={baseOuter} x2="0" y2="-64" stroke="#e0a417" strokeWidth={hour ? 2.5 : 1} strokeLinecap="round" style={{ transform: `scaleY(${scale})`, transformBox: "view-box", transformOrigin: "0px -64px", transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }} /></g>;
      })}
      {now && <><line x1="0" y1="10" x2="0" y2="-32" stroke="#e0a417" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourAngle})`} /><line x1="0" y1="14" x2="0" y2="-48" stroke="#e0a417" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle})`} /></>}
      <circle r="4" fill="#e0a417" />
    </svg>
  );
}

export function MinimalArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const point = (angle: number, radius: number) => { const radians = (angle - 90) * Math.PI / 180; return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius }; };
  const hour = point(hours * 30 + minutes * 0.5, 50);
  const minute = point(minutes * 6 + seconds * 0.1, 74);
  const second = point(seconds * 6, 84);
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Minimal clock with three dots at the hand tips">
      <circle r="96" fill={PAPER} />
      {now && <><circle cx={hour.x} cy={hour.y} r="2.5" fill={INK} /><circle cx={minute.x} cy={minute.y} r="1.5" fill={INK} /><circle cx={second.x} cy={second.y} r="0.75" fill={RED} /></>}
    </svg>
  );
}

const MILKMAID_CLOCK = { x: 75.4, y: 6.8, width: 13.8, aspect: 508 / 290, dialX: 48.6, dialY: 57.7 };
const MILKMAID_HAND = { width: 15.2, aspect: 224 / 1187, pivotX: 19.7, pivotY: 50 };

function MilkmaidHand({ angle, scale, opacity }: { angle: number; scale: number; opacity: number }) {
  const clockHeight = MILKMAID_CLOCK.width * MILKMAID_CLOCK.aspect;
  return <div className="absolute bg-contain bg-no-repeat" style={{ left: `${MILKMAID_CLOCK.x + MILKMAID_CLOCK.width * MILKMAID_CLOCK.dialX / 100}%`, top: `${MILKMAID_CLOCK.y + clockHeight * MILKMAID_CLOCK.dialY / 100}%`, width: `${MILKMAID_HAND.width * scale}%`, height: `${MILKMAID_HAND.width * scale * MILKMAID_HAND.aspect}%`, backgroundImage: "url('/art/milkmaid-clock-hand.png')", opacity, transform: `translate(-${MILKMAID_HAND.pivotX}%, -${MILKMAID_HAND.pivotY}%) rotate(${angle - 90}deg)`, transformOrigin: `${MILKMAID_HAND.pivotX}% ${MILKMAID_HAND.pivotY}%` }} />;
}

export function MilkmaidArchiveClock() {
  const now = useWallClock(1000);
  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const clockHeight = MILKMAID_CLOCK.width * MILKMAID_CLOCK.aspect;
  return (
    <div className="relative h-72 w-72 overflow-hidden rounded-sm bg-stone-100 bg-cover bg-center shadow-xl sm:h-96 sm:w-96" role="img" aria-label="Milkmaid antique wall clock" style={{ backgroundImage: "url('/art/milkmaid.jpg')" }}>
      <div className="absolute rounded-full bg-stone-900/30 blur-md" style={{ left: `${MILKMAID_CLOCK.x + MILKMAID_CLOCK.width * 0.34}%`, top: `${MILKMAID_CLOCK.y + clockHeight * 0.35}%`, width: `${MILKMAID_CLOCK.width * 0.95}%`, height: `${clockHeight * 0.72}%`, transform: "translate(20%, 13%) rotate(7deg)" }} />
      <div className="absolute bg-contain bg-no-repeat" style={{ left: `${MILKMAID_CLOCK.x}%`, top: `${MILKMAID_CLOCK.y}%`, width: `${MILKMAID_CLOCK.width}%`, height: `${clockHeight}%`, backgroundImage: "url('/art/milkmaid-clock-face.png')" }} />
      {now && <><MilkmaidHand angle={hours * 30 + minutes * 0.5} scale={0.22} opacity={0.96} /><MilkmaidHand angle={minutes * 6 + seconds * 0.1} scale={0.32} opacity={0.98} /><MilkmaidHand angle={seconds * 6} scale={0.36} opacity={0.68} /></>}
    </div>
  );
}
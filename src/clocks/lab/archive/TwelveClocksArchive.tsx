"use client";

import { useEffect, useMemo, useRef, type JSX } from "react";
import { useWallClock } from "../../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const SCALE = 0.16;
const INVERSE_SCALE = 1 / SCALE;
const MAX_DEPTH = 3;

function TwelveClocks({ variant }: { variant: "plain" | "ticked" }) {
  const now = useWallClock(32);
  const cameraRef = useRef<SVGGElement | null>(null);
  const rootHandsRef = useRef<SVGGElement | null>(null);
  const hourRefs = useRef<(SVGGElement | null)[]>([]);
  const minuteRefs = useRef<(SVGGElement | null)[]>([]);
  const ringRadius = variant === "plain" ? 66 : 64;
  const handDepth = variant === "plain" ? 3 : 2;
  const childPositions = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return { x: Math.round(Math.cos(angle) * ringRadius * 1000) / 1000, y: Math.round(Math.sin(angle) * ringRadius * 1000) / 1000 };
  }), [ringRadius]);

  const tree = useMemo(() => {
    let hourIndex = 0;
    let minuteIndex = 0;
    const face = (key: string): JSX.Element => (
      <g key={key}>
        <circle r="96" fill={PAPER} />
        {variant === "ticked" && Array.from({ length: 12 }, (_, index) => <line key={index} x1="0" y1="-92" x2="0" y2="-82" stroke={INK} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${index * 30})`} />)}
      </g>
    );
    const hands = (depth: number, key: string): JSX.Element => {
      const currentHour = hourIndex++;
      const currentMinute = minuteIndex++;
      return (
        <g key={key} ref={depth === 0 && variant === "ticked" ? rootHandsRef : undefined}>
          <g ref={(element) => { hourRefs.current[currentHour] = element; }}><line x1="0" y1={variant === "plain" ? 7 : 10} x2="0" y2={variant === "plain" ? -32 : -50} stroke={INK} strokeWidth="5" strokeLinecap="round" /></g>
          <g ref={(element) => { minuteRefs.current[currentMinute] = element; }}><line x1="0" y1={variant === "plain" ? 10 : 14} x2="0" y2={variant === "plain" ? -46 : -74} stroke={INK} strokeWidth="3" strokeLinecap="round" /></g>
          <circle r="4" fill={INK} />
        </g>
      );
    };
    const renderNode = (depth: number, key: string): JSX.Element => {
      const children = depth < MAX_DEPTH && childPositions.map((position, index) => <g key={index} transform={`translate(${position.x} ${position.y}) scale(${SCALE})`}>{renderNode(depth + 1, `${key}-${index}`)}</g>);
      return <g key={key}>{face(`${key}-face`)}{variant === "plain" ? <>{children}{depth <= handDepth && hands(depth, `${key}-hands`)}</> : <>{depth <= handDepth && hands(depth, `${key}-hands`)}{children}</>}</g>;
    };
    return renderNode(0, "root");
  }, [childPositions, handDepth, variant]);

  useEffect(() => {
    if (!now) return;
    const second = now.getSeconds() + now.getMilliseconds() / 1000;
    const windowFloat = second / 5;
    const windowIndex = Math.floor(windowFloat) % 12;
    const progress = windowFloat - Math.floor(windowFloat);
    let accumulationX: number;
    let accumulationY: number;
    if (variant === "plain") {
      const corner = 0.18;
      const x = progress < corner ? progress / corner : 1;
      const ease = progress < corner ? x * x * (3 - 2 * x) : 1;
      const angle = (windowIndex * 30 - 120 + 30 * ease) * Math.PI / 180;
      const accumulationRadius = ringRadius / (1 - SCALE);
      accumulationX = Math.cos(angle) * accumulationRadius;
      accumulationY = Math.sin(angle) * accumulationRadius;
    } else {
      accumulationX = childPositions[windowIndex].x / (1 - SCALE);
      accumulationY = childPositions[windowIndex].y / (1 - SCALE);
    }
    const zoom = Math.pow(INVERSE_SCALE, progress);
    cameraRef.current?.setAttribute("transform", `translate(${(accumulationX * (1 - zoom)).toFixed(3)} ${(accumulationY * (1 - zoom)).toFixed(3)}) scale(${zoom.toFixed(5)})`);
    if (variant === "ticked") rootHandsRef.current?.setAttribute("opacity", Math.max(0, 1 - 2.5 * progress).toFixed(3));
    const hourAngle = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5 + second / 120;
    const minuteAngle = now.getMinutes() * 6 + second * 0.1;
    for (const element of hourRefs.current) element?.setAttribute("transform", `rotate(${hourAngle.toFixed(3)})`);
    for (const element of minuteRefs.current) element?.setAttribute("transform", `rotate(${minuteAngle.toFixed(3)})`);
  }, [childPositions, now, ringRadius, variant]);

  const clipId = variant === "plain" ? "archive-twelve-clocks-plain-clip" : "archive-twelve-clocks-ticked-clip";
  return (
    <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label={`Archived Twelve Clocks ${variant}`}>
      <defs><clipPath id={clipId}><circle r="96" /></clipPath></defs>
      {variant === "ticked" && <circle r="96" fill="none" stroke={INK} strokeWidth="3" />}
      <g clipPath={`url(#${clipId})`}><g ref={cameraRef}>{tree}</g></g>
    </svg>
  );
}

export function TwelveClocksArchiveClock() {
  return <TwelveClocks variant="plain" />;
}

export function TwelveClocksArchiveV3() {
  return <TwelveClocks variant="ticked" />;
}
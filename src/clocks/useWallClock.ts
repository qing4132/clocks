"use client";

import { useEffect, useState } from "react";

// Single shared rAF loop. Each subscriber gets notified at most once per
// `cadenceMs` boundary aligned to wall-clock time, so every clock on the
// page ticks on the exact same instant (no per-mount drift).

type Subscriber = { cadence: number; lastBucket: number; cb: (d: Date) => void };

const subs = new Set<Subscriber>();
let rafId: number | null = null;

function loop() {
  const now = Date.now();
  for (const s of subs) {
    const bucket = Math.floor(now / s.cadence);
    if (bucket !== s.lastBucket) {
      s.lastBucket = bucket;
      s.cb(new Date(now));
    }
  }
  rafId = requestAnimationFrame(loop);
}

function tickAll() {
  const now = Date.now();
  for (const s of subs) {
    const bucket = Math.floor(now / s.cadence);
    if (bucket !== s.lastBucket) {
      s.lastBucket = bucket;
      s.cb(new Date(now));
    }
  }
}

let visibilityHooked = false;
function onVisible() {
  if (document.visibilityState === "visible") tickAll();
}

function subscribe(sub: Subscriber) {
  subs.add(sub);
  if (rafId === null) rafId = requestAnimationFrame(loop);
  if (!visibilityHooked && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisible);
    visibilityHooked = true;
  }
}

function unsubscribe(sub: Subscriber) {
  subs.delete(sub);
  if (subs.size === 0 && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Returns the current Date, refreshed at boundaries of `cadenceMs`
 * (default 1000 = once per wall-clock second). Returns `null` on the
 * server / first render to avoid hydration mismatches.
 */
export function useWallClock(cadenceMs: number = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const sub: Subscriber = {
      cadence: cadenceMs,
      lastBucket: Math.floor(Date.now() / cadenceMs),
      cb: setNow,
    };
    subscribe(sub);
    return () => unsubscribe(sub);
  }, [cadenceMs]);

  return now;
}

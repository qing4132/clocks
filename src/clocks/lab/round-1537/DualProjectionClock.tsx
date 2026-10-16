"use client";

import { useEffect, useRef, useState } from "react";
import { useWallClock } from "../../useWallClock";
import type { createProjectionScene } from "./projection-scene";

export function DualProjectionClock() {
  const date = useWallClock(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ReturnType<typeof createProjectionScene> | null>(null);
  const latestDate = useRef<Date | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const reading = date ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : "--:--";

  useEffect(() => {
    let active = true;
    void import("./projection-scene").then(({ createProjectionScene }) => {
      if (!active || !canvasRef.current) return;
      const scene = createProjectionScene(canvasRef.current);
      sceneRef.current = scene;
      if (latestDate.current) scene.update(latestDate.current);
    }).catch(() => { if (active) setUnavailable(true); });
    return () => {
      active = false;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    latestDate.current = date;
    if (date) sceneRef.current?.update(date);
  }, [date]);

  return <div className="relative h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`Dual Projection ${reading}`} data-study="1538" data-rendered-time={date?.getTime()}>
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    {unavailable && <div role="status" className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">WebGL unavailable</div>}
  </div>;
}
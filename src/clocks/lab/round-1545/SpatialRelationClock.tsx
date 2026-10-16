"use client";

import { useEffect, useRef, useState } from "react";
import { useWallClock } from "../../useWallClock";
import type { mountRelationScene } from "./spatial-scene";

export function SpatialRelationClock({ id, name, variant }: { id: number; name: string; variant: "section" | "mirror" }) {
  const date = useWallClock(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ReturnType<typeof mountRelationScene> | null>(null);
  const latestDate = useRef<Date | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const reading = date ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : "--:--";

  useEffect(() => {
    let active = true;
    const factory = variant === "section"
      ? import("./section-scene").then(module => module.createSectionScene)
      : import("./mirror-scene").then(module => module.createMirrorScene);
    void factory.then(createScene => {
      if (!active || !canvasRef.current) return;
      sceneRef.current = createScene(canvasRef.current);
      if (latestDate.current) sceneRef.current.update(latestDate.current);
    }).catch(() => { if (active) setUnavailable(true); });
    return () => {
      active = false;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [variant]);

  useEffect(() => {
    latestDate.current = date;
    if (date) sceneRef.current?.update(date);
  }, [date]);

  return <div className="relative h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`${name} ${reading}`} data-relation-clock={id} data-rendered-time={date?.getTime()}>
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    {unavailable && <div role="status" className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">WebGL unavailable</div>}
  </div>;
}
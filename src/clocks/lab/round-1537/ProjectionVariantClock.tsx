"use client";

import { useEffect, useRef, useState } from "react";
import { useWallClock } from "../../useWallClock";
import type { ProjectionVariant } from "./projection-variants";
import type { createProjectionVariantScene } from "./projection-variants-scene";

export function ProjectionVariantClock({ id, name, variant }: { id: number; name: string; variant: ProjectionVariant }) {
  const date = useWallClock(1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ReturnType<typeof createProjectionVariantScene> | null>(null);
  const latestDate = useRef<Date | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const reading = date ? [date.getHours(), date.getMinutes(), date.getSeconds()].map(value => String(value).padStart(2, "0")).join(":") : "--:--:--";

  useEffect(() => {
    let active = true;
    void import("./projection-variants-scene").then(({ createProjectionVariantScene }) => {
      if (!active || !canvasRef.current) return;
      const scene = createProjectionVariantScene(canvasRef.current, variant);
      sceneRef.current = scene;
      if (latestDate.current) scene.update(latestDate.current);
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

  return <div className="relative h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`${name} ${reading}`} data-study={id} data-projection-variant={variant} data-rendered-time={date?.getTime()}>
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    {unavailable && <div role="status" className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">WebGL unavailable</div>}
  </div>;
}
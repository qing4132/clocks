"use client";

import { useEffect, useRef } from "react";
import { pad } from "../shared";
import type { ClockTime } from "../types";
import { createReactionTexture, renderField, type FieldKind, type ReactionTexture } from "./fields";

const SIZE = 240;
let reactionTexture: ReactionTexture | null = null;

function createGlyphMask(reading: string) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const mask = new Float32Array(SIZE * SIZE);
  if (!context) return mask;
  context.font = "bold 84px Georgia, serif";
  const width = context.measureText(reading).width;
  context.font = `bold ${84 * Math.min(1, 218 / width)}px Georgia, serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "white";
  context.fillText(reading, SIZE / 2, SIZE / 2 + 2);
  const pixels = context.getImageData(0, 0, SIZE, SIZE).data;
  for (let index = 0; index < mask.length; index++) mask[index] = pixels[index * 4 + 3] / 255;
  return mask;
}

function drawStressDial(context: CanvasRenderingContext2D, time: ClockTime) {
  context.save();
  context.translate(SIZE / 2, SIZE / 2);
  context.scale(1.14, 1.14);
  context.strokeStyle = "#252722";
  context.lineWidth = 1.3;
  context.beginPath(); context.arc(0, 0, 98, 0, Math.PI * 2); context.stroke();
  for (let tick = 0; tick < 60; tick++) {
    context.save();
    context.rotate(tick / 60 * Math.PI * 2);
    context.strokeStyle = "rgba(250,250,247,0.8)";
    context.lineWidth = tick % 5 === 0 ? 1.8 : 0.8;
    context.beginPath(); context.moveTo(0, -92); context.lineTo(0, tick % 5 === 0 ? -84 : -88); context.stroke();
    context.restore();
  }
  context.font = "13px Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (let hour = 0; hour < 12; hour++) {
    const angle = hour / 12 * Math.PI * 2;
    const labelX = Math.sin(angle) * 73;
    const labelY = -Math.cos(angle) * 73;
    context.strokeStyle = "rgba(250,250,247,0.85)";
    context.lineWidth = 2.8;
    context.strokeText(String(hour || 12), labelX, labelY);
    context.fillStyle = "#1a1a1a";
    context.fillText(String(hour || 12), labelX, labelY);
  }
  for (const [turns, tip, tail, width, color] of [
    [time.hour, 50, 10, 4.6, "#1a1a1a"],
    [time.minute, 74, 14, 2.8, "#1a1a1a"],
    [time.second, 84, 20, 1.3, "#c1121f"],
  ] as const) {
    context.save();
    context.rotate(turns * Math.PI * 2);
    context.lineCap = "round";
    context.beginPath(); context.moveTo(0, tail); context.lineTo(0, -tip);
    context.strokeStyle = "#fafaf7"; context.lineWidth = width + 1.5; context.stroke();
    context.strokeStyle = color; context.lineWidth = width; context.stroke();
    context.restore();
  }
  context.fillStyle = "#1a1a1a";
  context.beginPath(); context.arc(0, 0, 4, 0, Math.PI * 2); context.fill();
  context.restore();
}

export function FieldClock({ kind, time, id, name }: { kind: FieldKind; time: ClockTime | null; id: number; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cache = useRef<{ image: ImageData; reading: string; mask: Float32Array } | null>(null);
  const milliseconds = time?.date.getTime() ?? null;
  const hour = time?.hour ?? 0;
  const minute = time?.minute ?? 0;
  const second = time?.second ?? 0;
  const hours = time?.h24 ?? 0;
  const minutes = time?.minuteValue ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || milliseconds === null) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const reading = `${pad(hours)}:${pad(minutes)}`;
    if (!cache.current) cache.current = { image: context.createImageData(SIZE, SIZE), reading: "", mask: new Float32Array(SIZE * SIZE) };
    if (kind !== "stress" && cache.current.reading !== reading) {
      cache.current.mask = createGlyphMask(reading);
      cache.current.reading = reading;
    }
    if (kind === "organic" && !reactionTexture) reactionTexture = createReactionTexture();
    renderField(kind, cache.current.image.data, SIZE, { milliseconds, hour, minute }, cache.current.mask, reactionTexture ?? undefined);
    context.putImageData(cache.current.image, 0, 0);
    if (kind === "stress") {
      drawStressDial(context, { date: new Date(milliseconds), h24: hours, h12: hours % 12, minuteValue: minutes, secondValue: Math.floor(second * 60), ms: milliseconds % 1000, hour, minute, second, day: 0 });
    }
    canvas.dataset.renderedTime = String(milliseconds);
    canvas.dataset.reading = reading;
  }, [milliseconds, hour, minute, second, hours, minutes, kind]);

  const reading = time ? `${pad(time.h24)}:${pad(time.minuteValue)}:${pad(time.secondValue)}` : "--:--:--";
  return (
    <div className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label={`${name}: ${reading}`} data-perception={id}>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="h-full w-full" aria-hidden="true" data-field={kind} />
    </div>
  );
}
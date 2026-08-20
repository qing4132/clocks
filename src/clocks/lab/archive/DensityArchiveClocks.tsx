"use client";

import type { ReactNode } from "react";
import { DigitalPanel } from "../../digital/segments";
import { useWallClock } from "../../useWallClock";

type Group = "h" | "m" | "s" | "";
type Config = {
  cell: number;
  backgroundProbability: number;
  foregroundProbability: number;
  color: string;
  secondsColor?: string;
};

const PANEL = { x: -94, y: -30, width: 188, height: 60 };
const FONT: Record<string, string[]> = {
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["00000", "00100", "00000", "00000", "00000", "00100", "00000"],
};

function rasterise(text: string, cell: number) {
  const columns = Math.floor(PANEL.width / cell);
  const rows = Math.floor(PANEL.height / cell);
  const mask: Group[][] = Array.from({ length: rows }, () => new Array<Group>(columns).fill(""));
  const characterWidth = 5;
  const characterHeight = 7;
  const gap = 1;
  const textWidth = text.length * characterWidth + (text.length - 1) * gap;
  const scale = Math.max(1, Math.min(Math.floor((columns - 4) / textWidth), Math.floor((rows - 2) / characterHeight)));
  const startColumn = Math.floor((columns - textWidth * scale) / 2);
  const startRow = Math.floor((rows - characterHeight * scale) / 2);
  for (let characterIndex = 0; characterIndex < text.length; characterIndex += 1) {
    const glyph = FONT[text[characterIndex]] ?? FONT["0"];
    const group: Group = characterIndex <= 2 ? "h" : characterIndex <= 5 ? "m" : "s";
    const characterStart = startColumn + characterIndex * (characterWidth + gap) * scale;
    for (let row = 0; row < characterHeight; row += 1) {
      for (let column = 0; column < characterWidth; column += 1) {
        if (glyph[row][column] !== "1") continue;
        for (let y = 0; y < scale; y += 1) {
          for (let x = 0; x < scale; x += 1) {
            const targetColumn = characterStart + column * scale + x;
            const targetRow = startRow + row * scale + y;
            if (targetColumn >= 0 && targetColumn < columns && targetRow >= 0 && targetRow < rows) mask[targetRow][targetColumn] = group;
          }
        }
      }
    }
  }
  return { columns, rows, mask };
}

function noise(seed: number, index: number) {
  let value = Math.imul(index + 1, -1640531527) ^ seed;
  value ^= value >>> 16;
  value = Math.imul(value, 73244475);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967296;
}

function Density({ config }: { config: Config }) {
  const now = useWallClock(1000);
  const text = now
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
    : "00:00:00";
  const { columns, rows, mask } = rasterise(text, config.cell);
  const xStart = PANEL.x + (PANEL.width - columns * config.cell) / 2;
  const yStart = PANEL.y + (PANEL.height - rows * config.cell) / 2;
  const seed = now ? Math.floor(now.getTime() / 1000) : 0;
  return (
    <g>
      {Array.from({ length: rows * columns }, (_, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const group = mask[row][column];
        const probability = group ? config.foregroundProbability : config.backgroundProbability;
        return <rect key={index} x={xStart + column * config.cell} y={yStart + row * config.cell} width={config.cell} height={config.cell} fill={group === "s" && config.secondsColor ? config.secondsColor : config.color} opacity={now && noise(seed, index) < probability ? 1 : 0} />;
      })}
    </g>
  );
}

function Shell({ children, label }: { children: ReactNode; label: string }) {
  return <svg viewBox="-100 -100 200 200" className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96" role="img" aria-label={label}><DigitalPanel>{children}</DigitalPanel></svg>;
}

export function DensityArchiveA() {
  return <Shell label="Archived Density A"><Density config={{ cell: 2, backgroundProbability: 0.05, foregroundProbability: 0.85, color: "#1a1a1a" }} /></Shell>;
}

export function DensityArchiveB() {
  return <Shell label="Archived Density B"><Density config={{ cell: 2, backgroundProbability: 0.12, foregroundProbability: 0.9, color: "#1a1a1a" }} /></Shell>;
}

export function DensityArchiveC() {
  return <Shell label="Archived Density C"><Density config={{ cell: 3, backgroundProbability: 0.08, foregroundProbability: 0.85, color: "#1a1a1a" }} /></Shell>;
}

export function DensityArchiveD() {
  return <Shell label="Archived Density D"><Density config={{ cell: 2, backgroundProbability: 0.06, foregroundProbability: 0.85, color: "#1a1a1a", secondsColor: "#c1121f" }} /></Shell>;
}

export function DensityArchiveE() {
  return <Shell label="Archived Density E"><Density config={{ cell: 2, backgroundProbability: 0.05, foregroundProbability: 0.9, color: "#1a1a1a" }} /></Shell>;
}
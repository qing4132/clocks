"use client";

import Link from "next/link";
import {
  Beaker,
  Gauge,
  Home,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { WallClockProvider } from "@/clocks/WallClockProvider";
import { WandererGallery } from "../WandererGallery";

type Engine = {
  anchorVirtualMs: number;
  anchorRealMs: number;
  speed: number;
  paused: boolean;
};

type LabClock = {
  slug: string;
  nameEn: string;
};

const SPEEDS = [0.1, 0.5, 1, 5, 60, 3_600];

function readEngine(engine: Engine, realMs: number = Date.now()) {
  if (engine.paused) return engine.anchorVirtualMs;
  return (
    engine.anchorVirtualMs +
    (realMs - engine.anchorRealMs) * engine.speed
  );
}

function pad(value: number, width: number = 2) {
  return String(value).padStart(width, "0");
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTimeInput(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function formatReadout(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function timeFromInput(value: string, current: Date) {
  const match = value.match(/^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  if (!match) return null;
  const [, hours, minutes, seconds = "0", milliseconds = "0"] = match;
  const next = new Date(current);
  next.setHours(
    Number(hours),
    Number(minutes),
    Number(seconds),
    Number(milliseconds.padEnd(3, "0")),
  );
  return next.getTime();
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-9 shrink-0 items-center justify-center border border-neutral-300 bg-white text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      {children}
    </button>
  );
}

function LabControls({
  engine,
  nowMs,
  setVirtualTime,
  togglePaused,
  setSpeed,
  resetToNow,
}: {
  engine: Engine | null;
  nowMs: number | null;
  setVirtualTime: (nextMs: number) => void;
  togglePaused: () => void;
  setSpeed: (speed: number) => void;
  resetToNow: () => void;
}) {
  const date = nowMs === null ? null : new Date(nowMs);
  const secondsOfDay = date
    ? date.getHours() * 3_600 +
      date.getMinutes() * 60 +
      date.getSeconds() +
      date.getMilliseconds() / 1_000
    : 0;

  function changeDayTime(seconds: number) {
    if (!date) return;
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    setVirtualTime(next.getTime() + seconds * 1_000);
  }

  function changeDate(value: string) {
    if (!date) return;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return;
    const next = new Date(date);
    next.setFullYear(year, month - 1, day);
    setVirtualTime(next.getTime());
  }

  function changeTime(value: string) {
    if (!date) return;
    const nextMs = timeFromInput(value, date);
    if (nextMs !== null) setVirtualTime(nextMs);
  }

  return (
    <aside className="z-50 mb-10 overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.09)] sm:sticky sm:top-3">
      <div className="flex min-h-11 items-center gap-3 border-b border-neutral-200 px-3 sm:px-4">
        <Beaker size={17} strokeWidth={1.8} aria-hidden="true" />
        <span className="whitespace-nowrap font-mono text-xs font-semibold tracking-[0.16em]">
          QCLOCKS LAB
        </span>
        <span
          className={`ml-1 size-2 rounded-full ${engine?.paused ? "bg-amber-500" : "bg-emerald-500"}`}
          aria-hidden="true"
        />
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500 sm:inline">
          {engine?.paused ? "paused" : "running"}
        </span>
        <output className="ml-auto hidden font-mono text-xs tabular-nums text-neutral-500 md:block">
          {date ? formatReadout(date) : "Synchronizing"}
        </output>
        <Link
          href="/"
          aria-label="Open gallery"
          title="Open gallery"
          className="ml-auto flex size-8 items-center justify-center text-neutral-500 transition hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 md:ml-0"
        >
          <Home size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <div className="relative mb-2 h-4 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
            <span className="absolute left-0 hidden sm:inline">00:00</span>
            <output className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-normal text-neutral-900">
              {date ? formatTimeInput(date) : "--:--:--.---"}
            </output>
            <span className="absolute right-0 hidden sm:inline">24:00</span>
          </div>
          <input
            type="range"
            min="0"
            max="86399.999"
            step="0.001"
            value={secondsOfDay}
            disabled={!date}
            onChange={(event) => changeDayTime(Number(event.target.value))}
            aria-label="Time of day"
            className="h-2 w-full cursor-ew-resize accent-neutral-950 disabled:cursor-wait"
          />
          <div className="mt-1 grid grid-cols-5 font-mono text-[9px] text-neutral-400">
            {[0, 6, 12, 18, 24].map((hour) => (
              <span
                key={hour}
                className={
                  hour === 0
                    ? "text-left"
                    : hour === 24
                      ? "text-right"
                      : "text-center"
                }
              >
                {pad(hour)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <IconButton
            label="Step back one minute"
            onClick={() => nowMs !== null && setVirtualTime(nowMs - 60_000)}
          >
            <SkipBack size={16} aria-hidden="true" />
          </IconButton>
          <IconButton label={engine?.paused ? "Resume time" : "Pause time"} onClick={togglePaused}>
            {engine?.paused ? (
              <Play size={16} fill="currentColor" aria-hidden="true" />
            ) : (
              <Pause size={16} fill="currentColor" aria-hidden="true" />
            )}
          </IconButton>
          <IconButton
            label="Step forward one minute"
            onClick={() => nowMs !== null && setVirtualTime(nowMs + 60_000)}
          >
            <SkipForward size={16} aria-hidden="true" />
          </IconButton>

          <label className="grid w-full gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 sm:w-auto">
            Date
            <input
              type="date"
              value={date ? formatDateInput(date) : ""}
              disabled={!date}
              onChange={(event) => changeDate(event.target.value)}
              className="h-9 min-w-0 w-full border border-neutral-300 bg-white px-2 font-mono text-xs tracking-normal text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </label>

          <label className="grid w-full gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 sm:w-auto">
            Exact time
            <input
              type="time"
              step="0.001"
              value={date ? formatTimeInput(date) : ""}
              disabled={!date}
              onChange={(event) => changeTime(event.target.value)}
              className="h-9 min-w-0 w-full border border-neutral-300 bg-white px-2 font-mono text-xs tracking-normal text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </label>

          <label className="grid min-w-0 flex-1 gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-500 sm:flex-none">
            <span className="flex items-center gap-1">
              <Gauge size={11} aria-hidden="true" /> Speed
            </span>
            <select
              value={engine?.speed ?? 1}
              disabled={!engine}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="h-9 min-w-0 w-full border border-neutral-300 bg-white px-2 font-mono text-xs tracking-normal text-neutral-900 focus:border-neutral-900 focus:outline-none"
            >
              {SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed.toLocaleString()}×
                </option>
              ))}
            </select>
          </label>

          <IconButton label="Return to real time" onClick={resetToNow}>
            <RotateCcw size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </aside>
  );
}

export function LabWorkspace({
  clocks,
  children,
}: {
  clocks: LabClock[];
  children: ReactNode;
}) {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const realMs = Date.now();
      setEngine({
        anchorVirtualMs: realMs,
        anchorRealMs: realMs,
        speed: 1,
        paused: false,
      });
      setNowMs(realMs);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!engine) return;
    if (engine.paused) return;

    let frame = 0;
    const update = () => {
      setNowMs(readEngine(engine));
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [engine]);

  function setVirtualTime(nextMs: number) {
    const realMs = Date.now();
    setNowMs(nextMs);
    setEngine((current) => ({
      anchorVirtualMs: nextMs,
      anchorRealMs: realMs,
      speed: current?.speed ?? 1,
      paused: current?.paused ?? false,
    }));
  }

  function togglePaused() {
    const realMs = Date.now();
    setEngine((current) => {
      if (!current) return current;
      const virtualMs = readEngine(current, realMs);
      setNowMs(virtualMs);
      return {
        ...current,
        anchorVirtualMs: virtualMs,
        anchorRealMs: realMs,
        paused: !current.paused,
      };
    });
  }

  function setSpeed(speed: number) {
    const realMs = Date.now();
    setEngine((current) => {
      if (!current) return current;
      const virtualMs = readEngine(current, realMs);
      return {
        ...current,
        anchorVirtualMs: virtualMs,
        anchorRealMs: realMs,
        speed,
      };
    });
  }

  function resetToNow() {
    const realMs = Date.now();
    setNowMs(realMs);
    setEngine({
      anchorVirtualMs: realMs,
      anchorRealMs: realMs,
      speed: 1,
      paused: false,
    });
  }

  return (
    <WallClockProvider nowMs={nowMs}>
      <main className="min-h-screen bg-neutral-50 px-3 py-16 text-neutral-900 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <LabControls
            engine={engine}
            nowMs={nowMs}
            setVirtualTime={setVirtualTime}
            togglePaused={togglePaused}
            setSpeed={setSpeed}
            resetToNow={resetToNow}
          />
          <WandererGallery clocks={clocks}>{children}</WandererGallery>
        </div>
      </main>
    </WallClockProvider>
  );
}
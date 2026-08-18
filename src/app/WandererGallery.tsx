"use client";

import Link from "next/link";
import { Children, type ReactNode } from "react";
import {
  getWandererPosition,
  WANDERER_CANONICAL_POSITION,
} from "@/clocks/wanderer/positions";
import { useHourlyPositionTransition } from "@/clocks/wanderer/useHourlyPositionTransition";
import { ClockPreview } from "./ClockPreview";

type GalleryClock = {
  slug: string;
  nameEn: string;
};

type GalleryEntry = GalleryClock & {
  node: ReactNode;
};

function getDisplayedEntry(
  entries: GalleryEntry[],
  position: number,
  wandererPosition: number,
) {
  if (position === wandererPosition) return entries[30];
  if (position === 31) return entries[wandererPosition - 1];
  return entries[position - 1];
}

function WorkLayer({
  entry,
  role,
}: {
  entry: GalleryEntry;
  role: "stable" | "leaving" | "arriving";
}) {
  return (
    <div
      data-work={entry.slug}
      className={`absolute inset-0 flex items-center justify-center ${
        role === "leaving"
          ? "animate-[wanderer-soft-leave_1.4s_cubic-bezier(0.65,0,0.35,1)_forwards]"
          : role === "arriving"
            ? "animate-[wanderer-soft-arrive_1.4s_cubic-bezier(0.65,0,0.35,1)_forwards]"
            : ""
      }`}
      aria-hidden={role === "leaving"}
    >
      {entry.node}
    </div>
  );
}

function WorkName({
  entry,
  role,
}: {
  entry: GalleryEntry;
  role: "stable" | "leaving" | "arriving";
}) {
  return (
    <span
      data-work-name={entry.slug}
      className={`absolute inset-x-0 text-center ${
        role === "leaving"
          ? "animate-[wanderer-name-leave_1.4s_cubic-bezier(0.65,0,0.35,1)_forwards]"
          : role === "arriving"
            ? "animate-[wanderer-name-arrive_1.4s_cubic-bezier(0.65,0,0.35,1)_forwards]"
            : ""
      }`}
      aria-hidden={role === "leaving"}
    >
      {entry.nameEn}
    </span>
  );
}

function GalleryCard({
  position,
  before,
  after,
  transitioning,
}: {
  position: number;
  before: GalleryEntry;
  after: GalleryEntry;
  transitioning: boolean;
}) {
  const affected = transitioning && before.slug !== after.slug;
  const layers = affected
    ? [
        { entry: before, role: "leaving" as const },
        { entry: after, role: "arriving" as const },
      ]
    : [{ entry: after, role: "stable" as const }];

  return (
    <Link
      href={`/clocks/${after.slug}`}
      className="group relative block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-900 hover:shadow-lg"
    >
      <span className="absolute right-5 top-4 z-20 font-mono text-xs tabular-nums text-neutral-400">
        #{String(position).padStart(3, "0")}
      </span>
      <div className="flex aspect-square items-center justify-center">
        <div className="origin-center scale-75">
          <ClockPreview>
            <div className="relative flex h-full w-full items-center justify-center">
              {layers.map(({ entry, role }) => (
                <WorkLayer
                  key={entry.slug}
                  entry={entry}
                  role={role}
                />
              ))}
            </div>
          </ClockPreview>
        </div>
      </div>
      <div className="relative mt-2 h-5 text-center text-sm leading-5 tracking-wide text-neutral-500">
        {layers.map(({ entry, role }) => (
          <WorkName
            key={entry.slug}
            entry={entry}
            role={role}
          />
        ))}
      </div>
    </Link>
  );
}

export function WandererGallery({
  clocks,
  children,
}: {
  clocks: GalleryClock[];
  children: ReactNode;
}) {
  const transition = useHourlyPositionTransition(
    getWandererPosition,
    WANDERER_CANONICAL_POSITION,
  );
  const clockNodes = Children.toArray(children);
  const entries = clocks.map((clock, index) => ({
    ...clock,
    node: clockNodes[index],
  }));

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {clocks.map((_, index) => {
        const position = index + 1;
        const before = getDisplayedEntry(
          entries,
          position,
          transition.previousPosition,
        );
        const after = getDisplayedEntry(
          entries,
          position,
          transition.currentPosition,
        );

        return (
          <GalleryCard
            key={position}
            position={position}
            before={before}
            after={after}
            transitioning={transition.transitioning}
          />
        );
      })}
    </section>
  );
}
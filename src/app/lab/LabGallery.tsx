"use client";

import { Children, useState, type ReactNode } from "react";
import { ClockPreview } from "../ClockPreview";

export type LabClock = {
  slug: string;
  nameEn: string;
  description: string;
  mechanism?: string;
  reading?: string;
  status?: string;
  position: number;
  batch: number;
};

function batchLabel(batch: number) {
  if (batch === 0) return "Original 32";
  if (batch === 1) return "Shortlist 07";
  return "Pending 04";
}

export function LabGallery({
  clocks,
  children,
}: {
  clocks: LabClock[];
  children: ReactNode;
}) {
  const batches = [...new Set(clocks.map((clock) => clock.batch))];
  const firstExperimentBatch = batches.find((batch) => batch > 1) ?? batches.find((batch) => batch > 0);
  const [activeBatch, setActiveBatch] = useState(firstExperimentBatch ?? batches[0] ?? 0);
  const clockNodes = Children.toArray(children);
  const entries = clocks
    .map((clock, index) => ({ ...clock, node: clockNodes[index] }))
    .filter((clock) => clock.batch === activeBatch);
  const isShortlist = activeBatch === 1;

  return (
    <section aria-label="Clock experiments">
      <div className="mb-6 flex gap-px overflow-x-auto border border-neutral-300 bg-neutral-300 p-px">
        {batches.map((batch) => (
          <button
            key={batch}
            type="button"
            onClick={() => setActiveBatch(batch)}
            aria-pressed={activeBatch === batch}
            className={`h-9 shrink-0 px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
              activeBatch === batch
                ? "bg-neutral-950 text-white"
                : "bg-white text-neutral-500 hover:text-neutral-950"
            }`}
          >
            {batchLabel(batch)}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${isShortlist ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
        {entries.map((entry) => (
          <article
            key={entry.slug}
            title={entry.description}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6"
          >
            <span className="absolute right-4 top-3 z-20 font-mono text-xs tabular-nums text-neutral-400 sm:right-5 sm:top-4">
              #{String(entry.position).padStart(3, "0")}
            </span>
            <div className="flex aspect-square items-center justify-center">
              <div className="origin-center scale-50 min-[280px]:scale-75">
                <ClockPreview>{entry.node}</ClockPreview>
              </div>
            </div>
            <div className="mt-2 text-center text-sm leading-5 tracking-wide text-neutral-500">
              {entry.nameEn}
            </div>
            {entry.mechanism && entry.reading && (
              <div className="mt-5 border-t border-neutral-200 pt-4 text-left">
                {entry.status && (
                  <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-400">
                    {entry.status}
                  </div>
                )}
                <dl className="grid gap-4 text-xs leading-5 text-neutral-600">
                  <div>
                    <dt className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-900">机制</dt>
                    <dd>{entry.mechanism}</dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-900">读法</dt>
                    <dd>{entry.reading}</dd>
                  </div>
                </dl>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
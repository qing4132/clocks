"use client";

import { Children, useState, type ReactNode } from "react";
import { ClockPreview } from "../ClockPreview";

const PAGE_SIZE = 20;

export type LabClock = {
  slug: string;
  nameEn: string;
  description: string;
  mechanism?: string;
  reading?: string;
  status?: string;
  position: number;
  batch: number;
  clip?: "svg" | "card";
};

function batchLabel(batch: number, count: number) {
  if (batch === 0) return `Original ${count}`;
  if (batch === 7) return "560 Studies";
  if (batch === 8) return `Archive Works ${count}`;
  if (batch === 9) return "727 Studies";
  if (batch === 10) return "728 Studies";
  if (batch === 11) return "1020–1076 · Psychedelic";
  return `Retained ${count}`;
}

export function LabGallery({
  clocks,
  children,
}: {
  clocks: LabClock[];
  children: ReactNode;
}) {
  const batches = [...new Set(clocks.map((clock) => clock.batch))];
  const firstExperimentBatch = batches.findLast((batch) => batch > 1) ?? batches.find((batch) => batch > 0);
  const [activeBatch, setActiveBatch] = useState(firstExperimentBatch ?? batches[0] ?? 0);
  const [activePage, setActivePage] = useState(0);
  const clockNodes = Children.toArray(children);
  const batchEntries = clocks
    .map((clock, index) => ({ ...clock, node: clockNodes[index] }))
    .filter((clock) => clock.batch === activeBatch);
  const shouldPaginate = activeBatch > 1 && batchEntries.length > PAGE_SIZE;
  const pageCount = shouldPaginate ? Math.ceil(batchEntries.length / PAGE_SIZE) : 1;
  const visiblePage = Math.min(activePage, Math.max(0, pageCount - 1));
  const entries = shouldPaginate
    ? batchEntries.slice(visiblePage * PAGE_SIZE, (visiblePage + 1) * PAGE_SIZE)
    : batchEntries;

  return (
    <section aria-label="Clock experiments">
      <div className="mb-6 flex gap-px overflow-x-auto border border-neutral-300 bg-neutral-300 p-px">
        {batches.map((batch) => (
          <button
            key={batch}
            type="button"
            onClick={() => {
              setActiveBatch(batch);
              setActivePage(0);
            }}
            aria-pressed={activeBatch === batch}
            className={`h-9 shrink-0 px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
              activeBatch === batch
                ? "bg-neutral-950 text-white"
                : "bg-white text-neutral-500 hover:text-neutral-950"
            }`}
          >
            {batchLabel(batch, clocks.filter((clock) => clock.batch === batch).length)}
          </button>
        ))}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Experiment ranges" className="mb-6 flex gap-px overflow-x-auto border border-neutral-300 bg-neutral-300 p-px">
          {Array.from({ length: pageCount }, (_, page) => {
            const first = batchEntries[page * PAGE_SIZE]?.position;
            const last = batchEntries[Math.min((page + 1) * PAGE_SIZE, batchEntries.length) - 1]?.position;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setActivePage(page)}
                aria-pressed={visiblePage === page}
                className={`h-8 shrink-0 px-3 font-mono text-[10px] tabular-nums transition ${
                  visiblePage === page
                    ? "bg-neutral-950 text-white"
                    : "bg-white text-neutral-500 hover:text-neutral-950"
                }`}
              >
                {first}–{last}
              </button>
            );
          })}
        </nav>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <article
            key={entry.slug}
            title={entry.description}
            className={`group relative block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-900 hover:shadow-lg sm:p-6 ${
              entry.clip === "card" ? "overflow-hidden" : ""
            }`}
          >
            <span className="absolute right-4 top-3 z-20 font-mono text-xs tabular-nums text-neutral-400 sm:right-5 sm:top-4">
              #{String(entry.position).padStart(3, "0")}
            </span>
            <div className="flex aspect-square items-center justify-center">
              <div className="origin-center scale-50 min-[280px]:scale-75">
                <ClockPreview>{entry.node}</ClockPreview>
              </div>
            </div>
            <div className="relative mt-2 h-5 text-center text-sm leading-5 tracking-wide text-neutral-500">
              {entry.nameEn}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
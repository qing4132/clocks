"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ClockPreview } from "../ClockPreview";

const PAGE_SIZE = 20;

export type LabClock = {
  slug: string;
  nameEn: string;
  description: string;
  hintZh?: string;
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
  if (batch === 11) return "1020–1079 · Psychedelic";
  if (batch === 12) return "24 · 7";
  if (batch === 13) return "山手線";
  if (batch === 15) return `Back to 001 ${count}`;
  if (batch === 16) return `Perception ${count}`;
  if (batch === 17) return `Open ${count}`;
  if (batch === 18) return `原色 ${count}`;
  if (batch === 19) return "Amoeba";
  if (batch === 20) return `新作 ${count}`;
  if (batch === 21) return `三向变体 ${count}`;
  if (batch === 22) return `关系钟 ${count}`;
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
  const [dismissedHint, setDismissedHint] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const revealActiveTab = () => {
      const active = tabs.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!active) return;
      const viewport = tabs.getBoundingClientRect();
      const button = active.getBoundingClientRect();
      tabs.scrollLeft += Math.min(0, button.left - viewport.left) + Math.max(0, button.right - viewport.right);
    };
    revealActiveTab();
    const observer = new ResizeObserver(revealActiveTab);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [activeBatch]);

  return (
    <section aria-label="Clock experiments">
      <div ref={tabsRef} className="mb-6 flex gap-px overflow-x-auto border border-neutral-300 bg-neutral-300 p-px">
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
            title={entry.hintZh ? undefined : entry.description}
            tabIndex={entry.hintZh ? 0 : undefined}
            aria-describedby={entry.hintZh ? `${entry.slug}-hint` : undefined}
            onMouseEnter={() => setDismissedHint(null)}
            onFocus={() => setDismissedHint(null)}
            onKeyDown={(event) => { if (event.key === "Escape") setDismissedHint(entry.slug); }}
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
            {entry.hintZh && <div
              id={`${entry.slug}-hint`}
              role="tooltip"
              className={`pointer-events-none absolute inset-x-3 bottom-12 z-30 rounded-md bg-neutral-950 px-3 py-2 text-left text-xs leading-relaxed text-white shadow-md ${dismissedHint === entry.slug ? "invisible" : "invisible group-hover:visible group-focus-within:visible"}`}
            >{entry.hintZh}</div>}
          </article>
        ))}
      </div>
    </section>
  );
}
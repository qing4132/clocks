import { notFound } from "next/navigation";
import { clocks, getClock } from "@/clocks/registry";

export function generateStaticParams() {
  return clocks.map((c) => ({ slug: c.slug }));
}

export default async function ClockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clock = getClock(slug);
  if (!clock) notFound();

  const idx = clocks.findIndex((c) => c.slug === slug);
  const { Component } = clock;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <Component />
        <div className="mt-12 font-mono text-xs text-neutral-400 tabular-nums">
          #{String(idx + 1).padStart(3, "0")}
        </div>
      </div>
    </main>
  );
}

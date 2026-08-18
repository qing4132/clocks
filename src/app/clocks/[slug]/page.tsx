import { notFound } from "next/navigation";
import { clocks, getClock } from "@/clocks/registry";
import { BackButton } from "./BackButton";
import { ClockPositionNumber } from "./ClockPositionNumber";

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
  const { Component, nameEn } = clock;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <BackButton />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <Component />
        <ClockPositionNumber canonicalPosition={idx + 1} />
        <div className="mt-2 text-base text-neutral-600 tracking-wide">
          {nameEn}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
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

  const { name, description, Component } = clock;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <nav className="px-6 py-6">
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition"
        >
          ← 回到钟表馆
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <Component />
        <h1 className="mt-12 text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-3 max-w-md text-center text-neutral-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </main>
  );
}

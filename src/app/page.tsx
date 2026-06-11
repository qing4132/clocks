import Link from "next/link";
import { clocks } from "@/clocks/registry";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clocks.map(({ slug, nameEn, Component }, idx) => (
            <Link
              key={slug}
              href={`/clocks/${slug}`}
              className="group relative block rounded-2xl border border-neutral-200 bg-white p-6 hover:border-neutral-900 hover:shadow-lg transition"
            >
              <span className="absolute top-4 right-5 font-mono text-xs text-neutral-400 tabular-nums">
                #{String(idx + 1).padStart(3, "0")}
              </span>
              <div className="aspect-square flex items-center justify-center">
                <div className="scale-75 origin-center">
                  <Component />
                </div>
              </div>
              <div className="mt-2 text-center text-sm text-neutral-500 tracking-wide">
                {nameEn}
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

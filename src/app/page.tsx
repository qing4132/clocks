import Link from "next/link";
import { clocks } from "@/clocks/registry";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            脑洞钟表馆
          </h1>
          <p className="mt-4 text-neutral-600 max-w-xl leading-relaxed">
            一个收集各种奇怪表盘的网站。每一个钟都在走，每一个都长得不太一样。
            脑洞的出口在这里。
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clocks.map(({ slug, name, description, Component }) => (
            <Link
              key={slug}
              href={`/clocks/${slug}`}
              className="group block rounded-2xl border border-neutral-200 bg-white p-6 hover:border-neutral-900 hover:shadow-lg transition"
            >
              <div className="aspect-square flex items-center justify-center mb-4">
                <div className="scale-75 origin-center">
                  <Component />
                </div>
              </div>
              <h2 className="font-medium text-lg group-hover:underline">
                {name}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                {description}
              </p>
            </Link>
          ))}
        </section>

        <footer className="mt-24 text-sm text-neutral-400">
          更多脑洞陆续上线。
        </footer>
      </div>
    </main>
  );
}

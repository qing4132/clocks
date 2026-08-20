import { clocks } from "@/clocks/registry";
import { WandererGallery } from "./WandererGallery";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 px-3 py-16 text-neutral-900 sm:px-6 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <WandererGallery
          clocks={clocks.map(({ slug, nameEn }) => ({ slug, nameEn }))}
        >
          {clocks.map(({ slug, Component }) => (
            <Component key={slug} />
          ))}
        </WandererGallery>
      </div>
    </main>
  );
}

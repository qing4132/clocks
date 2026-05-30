"use client";

import { useRouter } from "next/navigation";

// Go back the way the browser would (restores the home scroll position),
// falling back to the home route when the page was opened directly.
export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back"
      className="absolute top-6 left-6 text-2xl text-neutral-400 hover:text-neutral-900 transition leading-none"
    >
      ←
    </button>
  );
}

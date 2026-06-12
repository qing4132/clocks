"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { forgetHomeClockNavigation, prepareHomeReturn } from "@/app/homeScroll";

// Always returns to the gallery. If this detail page was entered from the
// gallery, the gallery restores its previous scroll position on mount.
export function BackButton() {
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("pagehide", forgetHomeClockNavigation);
    return () => {
      window.removeEventListener("pagehide", forgetHomeClockNavigation);
      forgetHomeClockNavigation();
    };
  }, []);

  function handleBack() {
    const restoreScroll =
      typeof window !== "undefined" && prepareHomeReturn(window.location.pathname);
    router.push("/", { scroll: !restoreScroll });
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

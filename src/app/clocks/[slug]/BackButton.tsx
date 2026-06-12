"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    router.push("/");
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

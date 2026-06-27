"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const ROOT_MARGIN = "240px 0px";

export function ClockPreview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setIsActive(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center"
      aria-hidden={isActive ? undefined : true}
    >
      {isActive ? children : null}
    </div>
  );
}
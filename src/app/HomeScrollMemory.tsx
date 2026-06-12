"use client";

import { useEffect } from "react";
import { rememberHomeClockNavigation, restoreHomeScrollIfRequested } from "./homeScroll";

export function HomeScrollMemory() {
  useEffect(() => {
    restoreHomeScrollIfRequested();

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith("/clocks/")) return;

      rememberHomeClockNavigation(url.pathname);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
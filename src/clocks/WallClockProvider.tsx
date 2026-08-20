"use client";

import { createContext, type ReactNode } from "react";

export const ControlledTimeContext = createContext<number | null>(null);

export function WallClockProvider({
  nowMs,
  children,
}: {
  nowMs: number | null;
  children: ReactNode;
}) {
  return (
    <ControlledTimeContext.Provider value={nowMs}>
      {children}
    </ControlledTimeContext.Provider>
  );
}
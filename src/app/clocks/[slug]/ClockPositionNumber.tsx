"use client";

import { getDisplayedPosition } from "@/clocks/wanderer/positions";
import { useHourlyPositionTransition } from "@/clocks/wanderer/useHourlyPositionTransition";

export function ClockPositionNumber({
  canonicalPosition,
}: {
  canonicalPosition: number;
}) {
  const state = useHourlyPositionTransition(
    (hour) => getDisplayedPosition(canonicalPosition, hour),
    canonicalPosition,
  );

  const positions = state.transitioning
    ? [
        { value: state.previousPosition, role: "leaving" as const },
        { value: state.currentPosition, role: "arriving" as const },
      ]
    : [{ value: state.currentPosition, role: "stable" as const }];

  return (
    <div className="relative mt-12 h-4 w-12 font-mono text-xs leading-4 tabular-nums text-neutral-400">
      {positions.map(({ value, role }) => (
        <span
          key={value}
          className={`absolute inset-0 text-center ${
            role === "leaving"
              ? "animate-[wanderer-number-leave_1.4s_cubic-bezier(0.65,0,0.35,1)_forwards]"
              : role === "arriving"
                ? "animate-[wanderer-number-arrive_1.4s_cubic-bezier(0.65,0,0.35,1)_forwards]"
                : ""
          }`}
          aria-hidden={role === "leaving"}
        >
          #{String(value).padStart(3, "0")}
        </span>
      ))}
    </div>
  );
}
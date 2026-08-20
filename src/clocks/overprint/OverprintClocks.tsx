"use client";

import { useWallClock } from "../useWallClock";
import { OverprintFace, type OverprintVariant } from "./OverprintFace";

function OverprintClock({
  variant,
  label,
}: {
  variant: OverprintVariant;
  label: string;
}) {
  const now = useWallClock(50);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-xl sm:h-96 sm:w-96"
      style={{ overflow: "visible" }}
      role="img"
      aria-label={label}
    >
      {now && <OverprintFace date={now} variant={variant} />}
    </svg>
  );
}

export function OverprintHaloClock() {
  return <OverprintClock variant="halo" label="Overprint clock" />;
}
import type { ReactNode } from "react";
import type { ClockTime } from "../types";
import { renderRoundTwoExperiment } from "../round2/renderers";
import { renderRetainedExperiment } from "./retained";

export function renderExperiment(id: number, time: ClockTime): ReactNode {
  if (id >= 101) return renderRoundTwoExperiment(id, time);
  return renderRetainedExperiment(id, time);
}
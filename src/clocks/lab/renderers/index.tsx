import type { ReactNode } from "react";
import type { ClockTime } from "../types";
import { renderRoundTwoExperiment } from "../round2/renderers";
import { renderRoundThreeExperiment } from "../round3/renderers";
import { renderRoundFiveExperiment } from "../round5/renderers";
import { renderRoundSixExperiment } from "../round6/renderers";
import { renderOverprintStudy } from "../overprint-studies/renderers";
import { renderRetainedExperiment } from "./retained";

export function renderExperiment(id: number, time: ClockTime): ReactNode {
  if (id === 603) return renderOverprintStudy(id, time);
  if (id >= 501 && id <= 600) return renderRoundSixExperiment(id, time);
  if (id >= 401 && id <= 500) return renderRoundFiveExperiment(id, time);
  if (id >= 301) return renderRoundThreeExperiment(id, time);
  if (id >= 101) return renderRoundTwoExperiment(id, time);
  return renderRetainedExperiment(id, time);
}
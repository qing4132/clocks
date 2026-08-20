import type { ReactNode } from "react";
import { OverprintFace } from "../../overprint/OverprintFace";
import type { ClockTime } from "../types";

export function renderOverprintStudy(id: number, time: ClockTime): ReactNode {
  switch (id) {
    case 603: return <OverprintFace date={time.date} variant="halo" />;
    default: return null;
  }
}
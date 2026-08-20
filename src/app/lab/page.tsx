import type { Metadata } from "next";
import { clocks } from "@/clocks/registry";
import { labExperiments } from "@/clocks/lab/shortlist";
import { roundTwoExperiments } from "@/clocks/lab/round2/designs";
import { ExperimentalClock } from "@/clocks/lab/ExperimentalClock";
import { LabWorkspace } from "./LabWorkspace";

export const metadata: Metadata = {
  title: "Lab · qclocks",
  description: "A controlled-time workspace for building and testing qclocks.",
};

export default function LabPage() {
  const originalEntries = clocks.map(({ slug, nameEn, description }, index) => ({
    slug,
    nameEn,
    description,
    position: index + 1,
    batch: 0,
  }));

  return (
    <LabWorkspace
      clocks={[...originalEntries, ...labExperiments, ...roundTwoExperiments]}
    >
      {clocks.map(({ slug, Component }) => (
        <Component key={slug} />
      ))}
      {labExperiments.map((design) => (
        <ExperimentalClock key={design.slug} design={design} />
      ))}
      {roundTwoExperiments.map((design) => (
        <ExperimentalClock key={design.slug} design={design} />
      ))}
    </LabWorkspace>
  );
}
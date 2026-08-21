import type { Metadata } from "next";
import { clocks } from "@/clocks/registry";
import { labExperiments } from "@/clocks/lab/shortlist";
import { roundTwoExperiments } from "@/clocks/lab/round2/designs";
import { roundThreeExperiments } from "@/clocks/lab/round3/designs";
import { roundFiveExperiments } from "@/clocks/lab/round5/designs";
import { roundSixExperiments } from "@/clocks/lab/round6/designs";
import { overprintStudies } from "@/clocks/lab/overprint-studies/designs";
import { archiveComponents, archiveExperiments } from "@/clocks/lab/archive/entries";
import { attentionLensStudies, attentionLensStudyComponents } from "@/clocks/lab/attention-lens-studies/entries";
import { arcStudies, arcStudyComponents } from "@/clocks/lab/arc-studies/entries";
import { Round1020Clock } from "@/clocks/lab/round-1020/Round1020Clock";
import { round1020Studies } from "@/clocks/lab/round-1020/catalog";
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
  const retainedExperiments = [
    ...labExperiments,
    ...roundTwoExperiments,
    ...roundThreeExperiments,
    ...roundFiveExperiments,
    ...roundSixExperiments,
  ].map((design) => ({ ...design, batch: 1 }));

  return (
    <LabWorkspace clocks={[...originalEntries, ...retainedExperiments, ...overprintStudies, ...archiveExperiments, ...attentionLensStudies, ...arcStudies, ...round1020Studies]}>
      {clocks.map(({ slug, Component }) => (
        <Component key={slug} />
      ))}
      {retainedExperiments.map((design) => (
        <ExperimentalClock key={design.slug} design={design} />
      ))}
      {overprintStudies.map((design) => (
        <ExperimentalClock key={design.slug} design={design} />
      ))}
      {archiveExperiments.map((design) => {
        const Component = archiveComponents[design.id];
        return <Component key={design.slug} />;
      })}
      {attentionLensStudies.map((design) => {
        const Component = attentionLensStudyComponents[design.id];
        return <Component key={design.slug} />;
      })}
      {arcStudies.map((design) => {
        const Component = arcStudyComponents[design.id];
        return <Component key={design.slug} />;
      })}
      {round1020Studies.map((design) => (
        <Round1020Clock key={design.slug} id={design.id} name={design.nameEn} />
      ))}
    </LabWorkspace>
  );
}
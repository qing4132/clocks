import type { Metadata } from "next";
import { clocks } from "@/clocks/registry";
import { LabWorkspace } from "./LabWorkspace";

export const metadata: Metadata = {
  title: "Lab · qclocks",
  description: "A controlled-time workspace for building and testing qclocks.",
};

export default function LabPage() {
  return (
    <LabWorkspace
      clocks={clocks.map(({ slug, nameEn }) => ({ slug, nameEn }))}
    >
      {clocks.map(({ slug, Component }) => (
        <Component key={slug} />
      ))}
    </LabWorkspace>
  );
}
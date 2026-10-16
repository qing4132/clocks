import type { LabExperiment } from "../types";

export const relationStudies = [
  { id: 1545, slug: "interstices", nameEn: "Interstices", hintZh: "缝隙：黑色板块之间的白缝组成时分，换分钟时挡片滑动开合；没有白色数字叠图，红点沿下沿报秒。" },
  { id: 1546, slug: "cross-section", nameEn: "Cross Section", hintZh: "截面：弯折薄片穿过固定平面，真实交线组成红色时分；前后薄片以半透明显示，红点沿剖面下沿报秒。" },
  { id: 1547, slug: "mirror-join", nameEn: "Mirror Join", hintZh: "镜合：下半笔画是实体短杆，上半由折镜反射镜框上缘的短杆补齐；两部分合读时分，红点沿下沿报秒。" },
].map(study => ({
  ...study,
  position: study.id,
  batch: 22,
  description: study.hintZh,
  mechanism: study.hintZh,
  reading: study.hintZh,
  face: "none" as const,
  status: "Lab study / not selected",
})) satisfies (LabExperiment & { hintZh: string })[];
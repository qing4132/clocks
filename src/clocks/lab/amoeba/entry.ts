import type { LabExperiment } from "../types";

const hintZh = "阿米巴：钟面持续流动，整根指针随表面弯曲，刻度和数字一起移动；针尖与刻度使用同一形变，仍对应真实时分秒。";

export const amoebaStudy = {
  id: 1532,
  slug: "amoeba",
  nameEn: "Amoeba",
  description: hintZh,
  hintZh,
  mechanism: "Constant-area traveling deformation shared by the rim, curved ticks, numeral positions, and complete hand paths.",
  reading: "Read the ordinary twelve-hour dial at the hand tips; the whole face shares the same deformation.",
  position: 1532,
  batch: 19,
  face: "none",
  status: "Lab study / not selected",
} satisfies LabExperiment & { hintZh: string };

export type AmoebaVariant = "sculpted" | "coalescent" | "transfer" | "viscous";

export const amoebaVariantStudies = [
  { id: 1533, slug: "amoeba-sculpted", nameEn: "Sculpted Time", variant: "sculpted", hintZh: "形体指针：宽短突起读小时，细长突起读分钟；两个黑点标出准确方向，红点沿外圈报秒。" },
  { id: 1534, slug: "amoeba-coalescent", nameEn: "Coalescence", variant: "coalescent", hintZh: "相遇合体：大滴读小时、小滴读分钟，靠近时拉出细颈并融合，远离时分开，红点报秒。" },
  { id: 1535, slug: "amoeba-transfer", nameEn: "Carry Flow", variant: "transfer", hintZh: "进位转移：左上时、右上分、下方秒；整分钟有红滴流入分部，整点有黑滴流入时部，数字始终准时。" },
  { id: 1536, slug: "amoeba-viscous", nameEn: "Viscous Time", variant: "viscous", hintZh: "黏滞时间：针尖准时、针身向后拖弯；秒针在表皮上留下逐渐消退的拉痕，仍沿针尖方向读取。" },
].map(study => ({
  ...study,
  variant: study.variant as AmoebaVariant,
  position: study.id,
  batch: 19,
  face: "none" as const,
  description: study.hintZh,
  mechanism: study.hintZh,
  reading: study.hintZh,
  status: "Lab study / not selected",
})) satisfies (LabExperiment & { hintZh: string; variant: AmoebaVariant })[];
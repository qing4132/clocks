import type { LabExperiment } from "../types";
import type { ProjectionVariant } from "./projection-variants";

export const constructionStudies = [
  {
    id: 1537,
    slug: "reassembly",
    nameEn: "Reassembly",
    hintZh: "笔画重组：固定二十八根等长笔画组成时分；换分钟时只平移、转动，多余笔画重叠收进字身。",
  },
  {
    id: 1538,
    slug: "dual-projection",
    nameEn: "Dual Projection",
    hintZh: "双投影：中间同一组立体构件投下两组真实阴影，左读小时、右读分钟；前沿红点报秒。",
  },
  {
    id: 1539,
    slug: "single-sign",
    nameEn: "Single Sign",
    hintZh: "单符：采用西多数字规则，下半左右写小时十位、个位，上半左右写分钟十位、个位；红点沿中轴报秒。",
  },
  {
    id: 1540,
    slug: "triple-projection",
    nameEn: "Triple Projection",
    hintZh: "三向投影：同一组构件每秒重构，左面读时、右面读分，下方红色投影读秒；数字和细边框都由实体投出。",
  },
].map(study => ({
  ...study,
  description: study.hintZh,
  mechanism: study.hintZh,
  reading: study.hintZh,
  position: study.id,
  batch: 20,
  face: "none" as const,
  status: "Lab study / not selected",
})) satisfies (LabExperiment & { hintZh: string })[];

export const projectionVariantStudies = ([
  { id: 1541, slug: "projection-room", nameEn: "Corner Room", variant: "room", hintZh: "角室：三面接成完整空间，构件和阴影共处其中；左读时、右读分，地面红影读秒，机制与1540相同。" },
  { id: 1542, slug: "projection-porcelain", nameEn: "Porcelain", variant: "porcelain", hintZh: "白瓷：白色构件靠明暗显出层次，厚投影板带透视；左读时、右读分，下方红影读秒，机制与1540相同。" },
  { id: 1543, slug: "projection-vermilion", nameEn: "Vermilion Core", variant: "vermilion", hintZh: "朱芯：红色构件配薄白投影面，从高处俯看；左读时、右读分，下方红影读秒，机制与1540相同。" },
  { id: 1544, slug: "projection-plinth", nameEn: "Gallery Plinth", variant: "plinth", hintZh: "展台：银灰构件悬于深色厚底座上，斜光显出转折；左读时、右读分，下方红影读秒，机制与1540相同。" },
] satisfies { id: number; slug: string; nameEn: string; variant: ProjectionVariant; hintZh: string }[]).map(study => ({
  ...study,
  description: study.hintZh,
  mechanism: "The unchanged #1540 solid casts the same three framed numeral projections.",
  reading: "Left: hour. Right: minute. Floor: second.",
  position: study.id,
  batch: 21,
  face: "none" as const,
  status: "Lab study / not selected",
})) satisfies (LabExperiment & { hintZh: string; variant: ProjectionVariant })[];
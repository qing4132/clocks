import type { ComponentType } from "react";
import type { LabExperiment } from "../types";
import { ArcArchiveClock } from "../archive/IndependentArchiveClocks";
import {
  ArcBowClock,
  ArcChordClock,
  ArcHingeClock,
  ArcShortClock,
  ArcSpiralClock,
} from "./ArcStudies";

export const arcStudies: LabExperiment[] = [
  {
    id: 728,
    slug: "arc-728-original-study",
    nameEn: "Arc · Original",
    description: "时针点与分针点之间只留下沿圆周顺时针行进的一段弧。",
    mechanism: "实心黑点标记小时，弧线从小时位置沿圆周顺时针延伸到分钟位置。",
    reading: "实心点读小时，弧线的无标记终点读分钟。",
    status: "728 study · original",
    position: 728,
    batch: 10,
  },
  {
    id: 745,
    slug: "arc-745-chord",
    nameEn: "Arc · Chord",
    description: "圆周弧被两点之间的最短直线取代。",
    mechanism: "保留原版的一条线和一个小时点，只把圆弧拉直成连接时分角度的弦。",
    reading: "实心点读小时，直线的另一端读分钟。",
    status: "728 study · shortest connection",
    position: 745,
    batch: 10,
  },
  {
    id: 746,
    slug: "arc-746-short",
    nameEn: "Arc · Short",
    description: "圆弧不再坚持顺时针，而是永远选择时分两点之间较短的一边。",
    mechanism: "仍然只有原版的一条圆弧和一个小时点；超过半圈时，弧线改走反方向。",
    reading: "实心点读小时，短弧的另一端读分钟。",
    status: "728 study · shorter side",
    position: 746,
    batch: 10,
  },
  {
    id: 747,
    slug: "arc-747-bow",
    nameEn: "Arc · Bow",
    description: "原版圆周弧向表心内侧弯下，成为一条绷紧但没有拉直的弓线。",
    mechanism: "只修改原有路径的曲率：起点仍是小时，终点仍是分钟，中段沿顺时针区间向内收。",
    reading: "实心点读小时，弯线的另一端读分钟。",
    status: "728 study · inward curve",
    position: 747,
    batch: 10,
  },
  {
    id: 748,
    slug: "arc-748-hinge",
    nameEn: "Arc · Hinge",
    description: "时分端点不再沿边缘相连，而是在表心折成一枚铰链。",
    mechanism: "原有单一路径改成经过表心的折线，不增加中心点或分钟点。",
    reading: "实心点读小时，折线的另一端读分钟。",
    status: "728 study · central hinge",
    position: 748,
    batch: 10,
  },
  {
    id: 749,
    slug: "arc-749-spiral",
    nameEn: "Arc · Spiral",
    description: "原版弧线沿顺时针区间行进，同时从外圈缓慢收向表心。",
    mechanism: "仍只有一条路径和一个小时点；路径从外圈小时出发，以连续减小的半径抵达分钟角度。",
    reading: "外圈实心点读小时，向内收束的线尾读分钟。",
    status: "728 study · inward spiral",
    position: 749,
    batch: 10,
  },
];

export const arcStudyComponents: Record<number, ComponentType> = {
  728: ArcArchiveClock,
  745: ArcChordClock,
  746: ArcShortClock,
  747: ArcBowClock,
  748: ArcHingeClock,
  749: ArcSpiralClock,
};
import type { ComponentType } from "react";
import ClassicRoundClock from "./classic-round/ClassicRoundClock";
import ReverseClock from "./reverse/ReverseClock";
import RotatingDialsClock from "./rotating-dials/RotatingDialsClock";

export type ClockEntry = {
  slug: string;
  name: string;
  description: string;
  Component: ComponentType;
};

export const clocks: ClockEntry[] = [
  {
    slug: "classic-round",
    name: "经典圆形钟",
    description: "最普通的圆形表盘，时分秒针滴答走着。一切脑洞的起点。",
    Component: ClassicRoundClock,
  },
  {
    slug: "reverse",
    name: "反着走的钟",
    description:
      "指针逆时针走，表盘数字也镜像翻过来——它仍然报对的时间，只是你得反着读。",
    Component: ReverseClock,
  },
  {
    slug: "rotating-dials",
    name: "三层转盘钟",
    description:
      "一根指针纹丝不动地指向正上方，时、分、秒三层同心圆盘自顾自地转——当前数字会转到指针下方。",
    Component: RotatingDialsClock,
  },
];

export function getClock(slug: string): ClockEntry | undefined {
  return clocks.find((c) => c.slug === slug);
}

import type { ComponentType } from "react";
import ClassicRoundClock from "./classic-round/ClassicRoundClock";
import ReverseClock from "./reverse/ReverseClock";
import RotatingDialsClock from "./rotating-dials/RotatingDialsClock";
import TwentyFourHourClock from "./twenty-four-hour/TwentyFourHourClock";
import FiveMinutesAheadClock from "./five-min-ahead/FiveMinutesAheadClock";
import UnrolledSpiralClock from "./archimedes/UnrolledSpiralClock";
import FlipClock from "./flip/FlipClock";

export type ClockEntry = {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  Component: ComponentType;
};

export const clocks: ClockEntry[] = [
  {
    slug: "classic-round",
    name: "经典圆形钟",
    nameEn: "Classic Round",
    description: "最普通的圆形表盘，时分秒针滴答走着。一切脑洞的起点。",
    Component: ClassicRoundClock,
  },
  {
    slug: "reverse",
    name: "反着走的钟",
    nameEn: "Reverse",
    description:
      "指针逆时针走，表盘数字也镜像翻过来——它仍然报对的时间，只是你得反着读。",
    Component: ReverseClock,
  },
  {
    slug: "rotating-dials",
    name: "三层转盘钟",
    nameEn: "Rotating Dials",
    description:
      "一根指针纹丝不动地指向正上方，时、分、秒三层同心圆盘自顾自地转——当前数字会转到指针下方。",
    Component: RotatingDialsClock,
  },
  {
    slug: "twenty-four-hour",
    name: "24 小时钟",
    nameEn: "24-Hour",
    description:
      "表盘被平均分成24格，0 在顶上，12 在正下。时针一天才走完一圈——看时间的密度成倒一半。",
    Component: TwentyFourHourClock,
  },
  {
    slug: "five-min-ahead",
    name: "提前五分钟",
    nameEn: "Five Minutes Ahead",
    description: "分针根部读正确时间，末端弯到提前 5 分钟的位置。",
    Component: FiveMinutesAheadClock,
  },
  {
    slug: "archimedes",
    name: "阿基米德钟",
    nameEn: "Archimedes",
    description: "指针的长度随值线性增长，其尖端本该扫出三条阿基米德螺线；这里把这三条螺线按弧长展平成圆周，指针于是以不均匀角速度运动。",
    Component: UnrolledSpiralClock,
  },
  {
    slug: "flip",
    name: "翻转钟",
    nameEn: "Flip",
    description: "随秒针跳动，整个表盘以纵轴为轴旋转，30 秒刚好转到背面，每 60 秒一圈。",
    Component: FlipClock,
  },
];

export function getClock(slug: string): ClockEntry | undefined {
  return clocks.find((c) => c.slug === slug);
}

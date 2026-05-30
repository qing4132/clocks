import type { ComponentType } from "react";
import ClassicRoundClock from "./classic-round/ClassicRoundClock";
import ReverseClock from "./reverse/ReverseClock";
import RotatingDialsClock from "./rotating-dials/RotatingDialsClock";
import TwentyFourHourClock from "./24-hour/TwentyFourHourClock";
import FiveMinutesAheadClock from "./5-minutes-ahead/FiveMinutesAheadClock";
import UnrolledSpiralClock from "./archimedes/UnrolledSpiralClock";
import FlipClock from "./flip/FlipClock";
import LinearClock from "./ruler/LinearClock";
import CartesianClock from "./cartesian/CartesianClock";
import ModularChordsClock from "./modular-chords/ModularChordsClock";
import DigitalClock from "./digital/DigitalClock";
import ThirtyHourClock from "./30-hour/ThirtyHourClock";
import UnixClock from "./unix/UnixClock";
import WedgesClock from "./wedges/WedgesClock";
import SleepClock from "./sleep/SleepClock";
import {
  BreathingBlossom,
} from "./breathing-blossom/variants";
import ElapsedClock from "./elapsed/ElapsedClock";

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
    slug: "24-hour",
    name: "24 小时钟",
    nameEn: "24-Hour",
    description:
      "表盘被平均分成24格，0 在顶上，12 在正下。时针一天才走完一圈——看时间的密度成倒一半。",
    Component: TwentyFourHourClock,
  },
  {
    slug: "5-minutes-ahead",
    name: "提前五分钟",
    nameEn: "5 Minutes Ahead",
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
  {
    slug: "ruler",
    name: "直尺钟",
    nameEn: "Ruler",
    description: "一根有刻度的直线，三根小竟针在上面滑。",
    Component: LinearClock,
  },
  {
    slug: "cartesian",
    name: "坐标钟",
    nameEn: "Cartesian",
    description: "横轴是小时，纵轴是分钟。在对应位置画一个小方块，里面写当前秒数。",
    Component: CartesianClock,
  },
  {
    slug: "modular-chords",
    name: "模乘法弦图钟",
    nameEn: "Modular Chords",
    description:
      "60 点圈上画 i → (i·k) mod 60 的弦，k = 当前秒。",
    Component: ModularChordsClock,
  },
  {
    slug: "digital",
    name: "数码钟",
    nameEn: "Digital",
    description: "HH:MM 大字号 + 秒数红字，保留 #001 的衣服语言。",
    Component: DigitalClock,
  },
  {
    slug: "30-hour",
    name: "30 小时钟",
    nameEn: "30-Hour",
    description:
      "广播电视台的 30 小时制：凌晨 00–05 点读为 24–29点，归于前一天。",
    Component: ThirtyHourClock,
  },
  {
    slug: "unix",
    name: "Unix 钟",
    nameEn: "Unix",
    description: "当前 Unix 时间戳（1970-01-01 UTC 以来的秒数）。",
    Component: UnixClock,
  },
  {
    slug: "wedges",
    name: "扉形钟",
    nameEn: "Wedges",
    description: "三层同心扉形从 12 点位按时间填满。",
    Component: WedgesClock,
  },
  {
    slug: "sleep",
    name: "睡眠钟",
    nameEn: "Sleep",
    description: "#004 挖掉 23–07 点的那一块。夜里不用了解时间。",
    Component: SleepClock,
  },
  {
    slug: "breathing-blossom",
    name: "花呼吸钟",
    nameEn: "Breathing Blossom",
    description:
      "一朵单层樱花，无轮廓线，只留柔和的颜色消融在淡背景里；随 16 秒的箱式呼吸轻轻开合，读时在外圈——分是柔光弧、时是高亮刻点、秒是绕圈平滑轻移的光点。",
    Component: BreathingBlossom,
  },
  {
    slug: "elapsed",
    name: "流逝钟",
    nameEn: "Elapsed",
    description:
      "#004 的 24 小时盘，但当天已经过去的那部分会被吃掉——缺口从午夜（正上方）开始随时间张大，表盘从满圆一路啃成傍晚的细牙，午夜重置。剩余表盘的切边正好在时针下，过去的时间一去不返。",
    Component: ElapsedClock,
  },
];

export function getClock(slug: string): ClockEntry | undefined {
  return clocks.find((c) => c.slug === slug);
}

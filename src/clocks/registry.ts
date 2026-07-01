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
import RemainingClock from "./remaining/RemainingClock";
import CatClock from "./cat/CatClock";

import CenturySandClock from "./century/CenturySandClock";
import { GameOfLifeClock } from "./game-of-life/variants";
import DecimalClock from "./decimal/DecimalClock";
import ColorClock from "./color/ColorClock";
import { SorobanClock } from "./soroban/SorobanClock";
import ShengxiaoClock from "./shengxiao/ShengxiaoClock";
import YearClock from "./year/YearClock";
import PointerTrianglesClock from "./pointer-triangles/PointerTrianglesClock";
import AnxietyClock from "./anxiety/AnxietyClock";
import QRClock from "./qr/QRClock";
import NowClock from "./now/NowClock";
import TypewriterClock from "./typewriter/TypewriterClock";
import AntiScreenshotClock from "./anti-screenshot/AntiScreenshotClock";
import SmileClock from "./smile/SmileClock";

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
    slug: "remaining",
    name: "剩余钟",
    nameEn: "Remaining",
    description:
      "#004 的 24 小时盘，但当天已经过去的那部分会被吃掉——留在表面上的是今天尚未流逝的那一段。缺口从午夜（正上方）开始随时间张大，表盘从满圆一路啃成傍晚的细牙，午夜重置。表盘被切到哪儿，就读到几点。",
    Component: RemainingClock,
  },
  {
    slug: "century",
    name: "世纪钟",
    nameEn: "Century",
    description:
      "一只忠实的 #001 圆盘，时分秒照常走；只是最外圈那道边不再只是边框——它是本世纪（2000→2100）的进度条，从 12 点顺时针填满，走过的部分化作一圈缓缓流动的金沙，像空岛上的黄金钟。你一生看着它几乎不动，它却在静静镀亮整整一百年。",
    Component: CenturySandClock,
  },
  {
    slug: "game-of-life",
    name: "生命游戏钟",
    nameEn: "Game of Life",
    description:
      "一台真正运转的康威生命游戏机器，被拿来当钟。四个 Snark——Mike Playle 于 2013 年发现的、已知最小的稳定 90° 滑翔机反射器——以四重对称摆放，让一架只发射一次的滑翔机被逐个转角反射、永远绕环飞行。那架绕行的滑翔机就是一根真正活着的秒针：绕一圈恰好 60 秒（环的周期是 360 代，即每秒精确 6 代），且严格锁定墙上时钟、绝不漂移。这里没有一处是假的——一架真正的滑翔机按真正的 B3/S23 规则绕真正的反射器环跑，四个 Snark 正对上下左右、是淡墨色的机芯。时与分写在环中央那块没有细胞的空白里：用 Georgia 斜体把时与分上下叠着写出来，连续的笔画一眼就是“写上去的字”、不会被误认为参与生命游戏的细胞。",
    Component: GameOfLifeClock,
  },
  {
    slug: "decimal",
    name: "十进制革命钟",
    nameEn: "Decimal",
    description:
      "法兰西共和国 1793 年的十进制时间：一天 = 10 小时，一小时 = 100 分，一分 = 100 秒。于是表盘被平分成 10 格而不是 12，顶端是 10，时针一天才转一圈。它颠覆的是最根本的假设——“一天该分成几份”：5 点是正午，7.5 点是傍晚。时、分、秒三针仿照 #001 的走法，只是单位全是十进制。",
    Component: DecimalClock,
  },
  {
    slug: "color",
    name: "色彩钟",
    nameEn: "Color",
    description:
      "整个表盘就是一块纯色：十六进制颜色值 #HHMMSS，三对数字正是当前的时、分、秒——所以 13:24:57 时，表盘恰好是 #132457。这是 Unix 钟“机器可读、人不可读”那一路的远亲：时间变成一种你读不准、却能感受到它在缓缓漂移的颜色，秒位不停拨动着蓝调。正中用等宽字标出当前色值，是对可读性唯一的妥协。",
    Component: ColorClock,
  },
  {
    slug: "soroban",
    name: "算盘钟",
    nameEn: "Soroban",
    description:
      "日式算盘（soroban）记时：每档上一珠当 5、下四珠每颗当 1，拨向中间的横梁即为“拨入”，一档恰好表示 0–9。六档从左到右读出时、分、秒的十位个位。算珠是小圆角方块，搂在一块圆角背景上（与 #011／#021 同宽同圆角），发丝般的档线，大量留白。上一下四，方珠随时间滑动归位。秒的两档拨红珠。",
    Component: SorobanClock,
  },
  {
    slug: "shengxiao",
    name: "生肖时辰钟",
    nameEn: "Shengxiao",
    description:
      "中国传统的十二时辰，每个时辰两小时，以地支和生肖命名。子时（23:00–01:00）在最上，于是午夜落在鼠、正午落在午（马）——整个表盘其实是一天。十二只生肖用 Google 的 Noto 动画 emoji 像数字一样绕成一圈，当前时辰那只会放大、发光；中心黑针一圈走完当前两小时时辰，红针保留秒的细部流逝。",
    Component: ShengxiaoClock,
  },
  {
    slug: "year",
    name: "Year",
    nameEn: "Year",
    description:
      "复刻 #018 世纪钟的结构，但外圈改成按月份分段的年份进度：蓝色细砂从数字 1 开始，每个月初落在对应月份数字；十二个月占相同角度，但按真实天数走完，所以短月更快、长月更慢，闰年二月也会自然变慢。",
    Component: YearClock,
  },
  {
    slug: "pointer-triangles",
    name: "三角指针钟",
    nameEn: "Pointer Triangles",
    description:
      "基于 #001 的圆形钟。时、分、秒三根指针各自把尖端作为正三角形的一个顶点；另外两个顶点由这个尖端绕表心旋转 120° 和 240° 得到，因此每个三角形的重心都落在表心，并随对应指针一起转动。",
    Component: PointerTrianglesClock,
  },
  {
    slug: "anxiety",
    name: "焦虑",
    nameEn: "Anxiety",
    description:
      "基于 #001 的圆形钟，额外叠加一根热橙色的焦虑指针。这根指针每 1 秒完整转一圈，像不属于正常计时系统的急躁噪声。",
    Component: AnxietyClock,
  },
  {
    slug: "qr",
    name: "纠错钟",
    nameEn: "QR",
    description:
      "每秒生成一个真实可扫的二维码，内容是当前 HH:MM:SS。二维码中央用三层方形轨道和三个模块点分别标记时、分、秒；视觉读时依赖轨道，机器读时依赖二维码纠错。",
    Component: QRClock,
  },
  {
    slug: "now",
    name: "此刻",
    nameEn: "Now",
    description:
      "对抗 #026 的焦虑钟：它不显示时、分、秒，也不提供任何可计算的进度，只把全部表盘留给一个词——now。",
    Component: NowClock,
  },
  {
    slug: "typewriter",
    name: "打字钟",
    nameEn: "Typewriter",
    description:
      "只有时分四个数字，没有秒，像一个正在被敲进去的输入框。分的个位后跟着一个每秒闪一次的光标。每当时间跳动，它只向左退掉真正变了的那几位，再把新数字逐个敲上去：1234→1235 删 4 打 5，1259→1300 删 259 打 300，0959→1000 则整串删光重打。",
    Component: TypewriterClock,
  },
  {
    slug: "anti-screenshot",
    name: "反截图",
    nameEn: "Anti-screenshot",
    description:
      "整块方屏都是动态黑白噪点，时间 HH:MM 由同样的噪点构成——所以任何一帧、也就是任何一张截图，都只是一片随机雪花，拍不下时间。只有相对运动才把数字勈出来：数字那片噪点向左漂移、背景向右漂移，于是你读出时间；一停下就消失在噪点里。每个点要么黑、要么背景色。",
    Component: AntiScreenshotClock,
  },


  {

    slug: "smile",
    name: "笑脸",
    nameEn: "Smile",
    description:
      "一张黄底黑边的圆脸：底部一段窄窄的浅笑，嘴角正好落在两只眼睛的正下方。没有眼眶，只有两颗黑色圆点作眼球——左眼是时针、右眼是分针，各自绕自己的眼位画一个小圆。于是每一分钟，两只眼睛都在不同方向地看，一天下来这张脸悄悄换过成千上万种滑稽表情。",
    Component: SmileClock,
  },
  {
    slug: "cat",
    name: "黑猫戏球",
    nameEn: "Cat & Laser",
    description: "用拟物的手法演绎极其生动的表盘：毛茸茸的脑袋指向当前的「小时」，它会随着时间流逝缓缓扭动脖子；一条柔顺的短尾巴伸向外指示当前的「分钟」，上蹿下跳的红外激光点是秒针。黑猫的头永远平滑追踪，但它瞪大的瞳孔会不断地去捕捉激射的激光点。",
    Component: CatClock,
  },
];

export function getClock(slug: string): ClockEntry | undefined {
  return clocks.find((c) => c.slug === slug);
}

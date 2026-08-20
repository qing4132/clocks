import type { LabExperiment } from "../types";

export const roundSixExperiments: LabExperiment[] = [
  {
    id: 560,
    slug: "lab-r6-560-overprint",
    nameEn: "Overprint",
    description: "六个巨大数字用不同方向反复压印，重叠到几乎无法分开。",
    mechanism: "HHMMSS 六位各自旋转并以半透明墨层叠印；当前秒位红色置顶，底部保留六位微型校验。",
    reading: "从叠印字形或底部小字直接读时间。",
    status: "第六轮留存",
    position: 560,
    batch: 6,
  },
  {
    id: 569,
    slug: "lab-r6-569-reverse-gravity",
    nameEn: "Reverse Gravity",
    description: "六位数字分别向六个不同的重力方向坠落。",
    mechanism: "每位数字的方向由其数值决定，坠落距离由秒内相位推进；分隔符固定在中心作为参考。",
    reading: "数字本身直接组成 HHMMSS，离心位移表达秒内时间。",
    status: "第六轮留存",
    position: 569,
    batch: 6,
  },
  {
    id: 586,
    slug: "lab-r6-586-typequake",
    nameEn: "Typequake",
    description: "几十层相同时间彼此错位，组成一场排字地震。",
    mechanism: "HH:MM:SS 重复 24 层，每层偏移由小时和分钟决定；秒触发红色横波依次穿过文字层。",
    reading: "最黑的中央层直接报时，红波位置读秒。",
    status: "第六轮留存",
    position: 586,
    batch: 6,
  },
];
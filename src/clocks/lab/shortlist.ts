import type { LabExperiment } from "./types";

export const labExperiments: LabExperiment[] = [
  {
    id: 20,
    slug: "lab-020-clifford-dust",
    nameEn: "Clifford Dust",
    description: "时间扰动 Clifford 吸引子，把每一刻压成一枚不可逆的点云指纹。",
    mechanism:
      "从同一个种子反复计算 Clifford 吸引子方程；小时、分钟、秒和当天进度分别轻微改变四个参数。520 次迭代落成点云，与当前秒同余的点标红。",
    reading:
      "它不是可逆编码，无法从图形精确还原 HH:MM:SS。小时控制大结构，分钟改变折叠密度，秒让点云连续变形；应把它读作“这一刻的指纹”。",
    status: "机制留存",
    position: 52,
    batch: 1,
  },
  {
    id: 26,
    slug: "lab-026-eclipse",
    nameEn: "Eclipse",
    description: "一场在整点完成的日食：分钟是横穿太阳的黑月，秒藏在日冕的颤动里。",
    mechanism:
      "金色太阳固定在中心，黑月在一小时内从左缘横穿到右缘。外圈十二点代表小时，当前小时点放大标红；日冕持续细微颤动。",
    reading:
      "先看外圈红点读小时；黑月在最左是 00 分、正中是 30 分、最右接近 60 分。日冕只表达秒正在流逝，不负责精确报秒。",
    status: "机制留存",
    position: 58,
    batch: 1,
  },
  {
    id: 34,
    slug: "lab-034-roman-ruin",
    nameEn: "Roman Ruin",
    description: "刚刚过去的罗马数字失去重力支撑，逐渐坠成一圈时间遗迹。",
    mechanism:
      "当前小时的罗马数字保持完整并标红；最近经过的小时数字下坠、倾斜并变淡。中央黑线仍按普通分针旋转。",
    reading:
      "红色罗马数字就是小时，中央黑线就是分钟。坠落的数字不是额外刻度，而是最近几小时留下的“废墟”；此钟不显示秒。",
    status: "机制留存",
    position: 66,
    batch: 1,
  },
  {
    id: 61,
    slug: "lab-061-lunar-phase",
    nameEn: "Lunar Phase",
    description: "真实日期切出月相，外圈红点标记当前朔望月的位置。",
    mechanism:
      "以 2000-01-06 的已知新月为基准，按 29.530588853 天的朔望月计算相位与照明比例，再生成盈亏月面。",
    reading:
      "中心月面显示盈亏，百分数是可见照明比例；外圈红点从新月开始顺时针走完一个朔望月。它读的是月相与日期尺度，不读一天内的时分秒。",
    status: "视觉留存 · 机制待加强",
    position: 93,
    batch: 1,
  },
  {
    id: 64,
    slug: "lab-064-timezone-chorus",
    nameEn: "Timezone Chorus",
    description: "UTC 居中，二十四个时区小时在外围同时发声。",
    mechanism:
      "中心显示当前 UTC 整点；外围依次排列 UTC−12 到 UTC+11 的二十四个当地小时，交错半径以减少拥挤，与设备本地小时相同的一项标红。",
    reading:
      "中心直接读 UTC 小时；外围红字是本地小时，其余数字是同一瞬间各时区的小时。当前版本不标城市、不显示分钟，因此更像全球时间剖面而非完整时钟。",
    status: "视觉留存 · 机制待加强",
    position: 96,
    batch: 1,
  },
  {
    id: 85,
    slug: "lab-085-number-eater",
    nameEn: "Number Eater",
    description: "一个旋转的缺口沿十二小时周期吞掉已经过去的数字。",
    mechanism:
      "从十二点方向开始，黑色扇区按当前十二小时周期持续扩张；经过的数字变淡，白色三角缺口形成“嘴”，红点跟随吞噬边界。",
    reading:
      "红点与嘴的角度等同普通时针，可读当前小时及分钟进度；被吞掉的扇区表示本轮十二小时已经过去的比例。它没有独立分针和秒针。",
    status: "视觉留存 · 机制待加强",
    position: 117,
    batch: 1,
  },
];
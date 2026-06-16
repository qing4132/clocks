"use client";

import { useWallClock } from "../useWallClock";

// 时针点与弧线所在的轨道半径——正好落在原表盘黑框的位置（盘面半径 96）。
const R = 96;
// 时针点的大小（随弧线加粗对应放大）。
const DOT = 3;

// 极坐标 → 直角坐标：0° 在正上方（12 点），顺时针，与 #001 一致。
function dot(angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Math.round(Math.cos(a) * R * 1000) / 1000,
    y: Math.round(Math.sin(a) * R * 1000) / 1000,
  };
}

export default function ArcClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  // 角度算法照搬 #001。
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  const hourDot = dot(hourAngle);
  const minuteDot = dot(minuteAngle);

  // 从时针点顺时针扫到分针点的夹角（0–360）。
  const sweep = (((minuteAngle - hourAngle) % 360) + 360) % 360;
  const largeArc = sweep > 180 ? 1 : 0;
  // sweep-flag=1 在 y 轴向下的 SVG 坐标系里即“视觉顺时针”。
  const arcPath = `M ${hourDot.x} ${hourDot.y} A ${R} ${R} 0 ${largeArc} 1 ${minuteDot.x} ${minuteDot.y}`;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96"
      role="img"
      aria-label="Arc clock"
    >
      {/* 只在挂载后渲染，避免画出一个错误的初始时刻 */}
      {now && (
        <>
          <path
            d={arcPath}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={hourDot.x} cy={hourDot.y} r={DOT} fill="#1a1a1a" />
        </>
      )}
    </svg>
  );
}

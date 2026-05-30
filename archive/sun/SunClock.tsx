"use client";

import { useWallClock } from "../useWallClock";

const GOLD = "#e0a417";

/**
 * Sun / 日光钟（archived）
 *
 * 以 #001 经典圆盘为底，全部染成金色，去掉数字与外框：
 *   · 去掉红色秒针；秒改由「光」来报 —— 秒本该指向的那一格刻度被点亮，
 *     朝盘外伸长成一道金芒，一秒一格，绕盘一圈正好一分钟；
 *   · 大、小刻度伸长后的长度不同，生长 / 回缩带缓动动画；
 *   · 时针、分针都收短，留出外圈让金芒射出。
 */
export default function SunClock() {
  const now = useWallClock(1000);

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;

  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="A round clock whose seconds are told by light: the tick the second hand would point to is lit gold"
    >
      {/* minute ticks — all gold; aligned at the inner edge, the lit one grows outward (animated) */}
      {Array.from({ length: 60 }).map((_, i) => {
        const isHour = i % 5 === 0;
        const lit = now != null && i === s;
        // inner end is the fixed anchor (same radius for all ticks → aligned)
        const innerY = -64;
        // outer end differs: hour ticks reach a bit further out
        const baseOuter = isHour ? -82 : -78;
        const baseLen = baseOuter - innerY; // negative length (outer is further out)
        // grown outer end — hour and minute ticks reach different depths
        const grownOuter = isHour ? -99 : -95;
        const grownLen = grownOuter - innerY;
        const scale = lit ? grownLen / baseLen : 1;
        return (
          <g key={i} transform={`rotate(${i * 6})`}>
            <line
              x1="0"
              y1={baseOuter}
              x2="0"
              y2={innerY}
              stroke={GOLD}
              strokeWidth={isHour ? 2.5 : 1}
              strokeLinecap="round"
              style={{
                transform: `scaleY(${scale})`,
                transformBox: "view-box",
                transformOrigin: `0px ${innerY}px`,
                transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </g>
        );
      })}

      {/* hands — hour & minute only; seconds are told by the lit tick */}
      {now && (
        <>
          <line
            x1="0"
            y1="10"
            x2="0"
            y2="-32"
            stroke={GOLD}
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${hourAngle})`}
          />
          <line
            x1="0"
            y1="14"
            x2="0"
            y2="-48"
            stroke={GOLD}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle})`}
          />
        </>
      )}

      {/* center cap */}
      <circle cx="0" cy="0" r="4" fill={GOLD} />
    </svg>
  );
}

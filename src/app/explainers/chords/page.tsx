"use client";

import { useState } from "react";

/**
 * Explainer / playground for the Modular Chords clock (#016).
 *
 * 60 points evenly placed on a circle. For each i in 0..59 we draw a
 * chord from point i to point (i · k) mod 60, where k is the multiplier
 * you control with the slider.
 *
 * In the clock, k = (m + 1) + s/60 — so k starts at 1 at the top of
 * each hour and increases linearly through the minute / second.
 */
export default function ChordsExplainer() {
  const [k, setK] = useState(2);

  const N = 60;
  const R = 160;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const pts = Array.from({ length: N }).map((_, i) => {
    const a = ((i / N) * 2 * Math.PI) - Math.PI / 2;
    return { x: round(Math.cos(a) * R), y: round(Math.sin(a) * R) };
  });

  const chords = Array.from({ length: N }).map((_, i) => {
    const j = (i * k) % N;
    const b = pts[j];
    return { x1: pts[i].x, y1: pts[i].y, x2: b.x, y2: b.y };
  });

  // Identify which "named figure" k is close to.
  const named: Record<number, string> = {
    1: "单圈（每个点和它自己重合，看不到弦）",
    2: "心形 (cardioid)",
    3: "肾形 (nephroid)",
    4: "三叶花",
    5: "四瓣花",
    6: "五瓣花",
    7: "六瓣花",
    11: "对称十瓣星",
    29: "几乎重合：和 k=31 互为镜像（59-k 对称）",
    30: "60 的一半 — 每条弦都是直径，全部穿过圆心",
    31: "和 k=29 互为镜像",
    59: "k ≡ -1 mod 60 — 每条弦把 i 连到 60-i，外缘最短",
  };
  const nameOf = (kv: number) => named[kv] ?? "";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">Modular Chords 弦图原理</h1>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-700">
          <p>
            圆上均匀放 <strong>N = 60</strong> 个点，编号 0, 1, …, 59。给一个数字{" "}
            <strong>k</strong>，对每个 i 从 0 到 59，连一条弦：
          </p>
          <p className="font-mono text-center text-neutral-900">
            i &nbsp;→&nbsp; (i · k) mod 60
          </p>
          <p>
            一共会画出 60 条弦。这些弦的<strong>外包络</strong>就是各种著名曲线：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>k = 2</strong> → 心形（cardioid）
            </li>
            <li>
              <strong>k = 3</strong> → 肾形（nephroid）
            </li>
            <li>
              <strong>k = 4, 5, 6, …</strong> → 越来越多瓣的玫瑰花
            </li>
            <li>
              <strong>k = 30</strong> → 所有弦变成直径，全穿过圆心
            </li>
            <li>
              <strong>k 接近 60</strong> → 图案对称地变回简单
            </li>
          </ul>
          <p>
            一般规律：图案在 k 和 (60 − k) 是镜像对称的（因为 mod 60 下 −k ≡ 60−k）。
          </p>
          <p>
            在表里 <span className="font-mono">k = s</span>（s 是当前秒数）。每一秒 k 跳一个整数，一分钟走完 k = 0 到 59。
            因为图案 k 和 (60-k) 互为镜像，60 秒里其实只看到 ≈30 张不同的图；k=0（星束）和 k=30（直径星）各出现 1 次。
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-4">
            <label htmlFor="k" className="font-mono text-sm">
              k = {k}
            </label>
            <input
              id="k"
              type="range"
              min={0}
              max={59}
              step={1}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          {nameOf(k) && (
            <div className="text-sm text-neutral-600 italic">
              {nameOf(k)}
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {[0, 1, 2, 3, 4, 5, 6, 7, 10, 15, 20, 30, 45, 58, 59].map((v) => (
              <button
                key={v}
                onClick={() => setK(v)}
                className="px-3 py-1 rounded border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition"
              >
                k = {v}
              </button>
            ))}
          </div>
        </section>

        <section className="flex justify-center">
          <svg
            viewBox="-200 -200 400 400"
            className="w-[28rem] h-[28rem] max-w-full"
            role="img"
            aria-label="Chord pattern"
          >
            <circle cx="0" cy="0" r="170" fill="none" stroke="#1a1a1a55" strokeWidth="0.5" />
            <g opacity="0.85">
              {chords.map((c, i) => (
                <line
                  key={i}
                  x1={c.x1}
                  y1={c.y1}
                  x2={c.x2}
                  y2={c.y2}
                  stroke="#1a1a1a"
                  strokeWidth="0.7"
                />
              ))}
            </g>
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="1.5" fill="#1a1a1a" />
                {i % 5 === 0 && (
                  <text
                    x={p.x * 1.08}
                    y={p.y * 1.08}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontSize="9"
                    fill="#1a1a1a"
                  >
                    {i}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </section>

        <section className="text-xs text-neutral-500 leading-relaxed pt-4 border-t border-neutral-200">
          <p>
            举个例子，k = 2 时：点 1 → 点 2，点 2 → 点 4，点 3 → 点 6，…，点 30 → 点 0，点 31 → 点 2，…
            每条弦都向“前一倍”的位置连，全部叠加起来包络出心形。
          </p>
          <p className="mt-2">
            为什么是心形？因为这是一个内摆线（epicycloid）的离散采样 —
            小圆在大圆外滚一圈，圆周上一个点的轨迹就是 cardioid，而它的切线集合
            正好对应 k=2 的弦集合。其他 k 值给出更高阶的内/外摆线包络。
          </p>
        </section>
      </div>
    </div>
  );
}

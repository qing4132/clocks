"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useWallClock } from "../useWallClock";

/**
 * #023 — Shengxiao, the Chinese zodiac double-hour clock (生肖时辰钟).
 *
 *   Traditional Chinese time runs in twelve 时辰, each a two-hour block named
 *   by an earthly branch and its zodiac animal. 子 (Rat) spans 23:00–01:00 and
 *   sits at the top, so midnight lands on the Rat and noon on the Horse (午) at
 *   the bottom — the dial is effectively a 24-hour day.
 *
 *   The twelve animals are Google's Noto emoji (self-hosted under
 *   /emoji/shengxiao), ringed like numerals. Each is its static PNG, enlarged
 *   while it is the current 时辰; that one animal also carries an animated
 *   Lottie that plays a single time at the top of every minute (the 0-second
 *   mark), so the current creature gives a little wiggle once a minute. Small
 *   minute and second hands sweep the empty centre.
 */

// Noto emoji codepoints (full-body animals), in 时辰 order (子→亥)
const CP = [
  "1f400", // rat 鼠
  "1f402", // ox 牛
  "1f405", // tiger 虎
  "1f407", // rabbit 兔
  "1f409", // dragon 龙
  "1f40d", // snake 蛇
  "1f40e", // horse 马
  "1f410", // goat 羊
  "1f412", // monkey 猴
  "1f413", // rooster 鸡
  "1f415", // dog 狗
  "1f416", // pig 猪
];

const R_RING = 38; // ring radius, % of the dial

// Every animal is a Lottie, no PNGs. Most Noto animal Lotties REST on frame 0
// (the static-emoji pose) and animate from there. The DRAGON is the exception:
// its emoji pose is a MIDDLE frame (op=120 ⇒ frame 60); its ends are blank
// (off-screen). It rests on frame 60 and plays a rotated loop — centred → out
// left → (blank) → in from the right → centred — so it also begins & ends on
// its resting pose.
const DRAGON_CP = "1f409";
const DRAGON_MID = 60;
const HORSE_CP = "1f40e"; // its Lottie is the shortest (~0.5s), so play it three times
const restFrameOf = (cp: string) => (cp === DRAGON_CP ? DRAGON_MID : 0);
const DESKTOP_FACE_CONTENT = 384 - 2 * 3;
const ANIMAL_SIZE = {
  inactive: `${(52 / DESKTOP_FACE_CONTENT) * 100}%`,
  active: `${(74 / DESKTOP_FACE_CONTENT) * 100}%`,
};

// one zodiac animal, drawn entirely from its animated Noto Lottie. It rests
// frozen on its static pose; on each `beat` (minute boundary) it plays once,
// then settles back onto the resting frame.
function Animal({
  cp,
  active,
  cx,
  cy,
  beat,
}: {
  cp: string;
  active: boolean;
  cx: number;
  cy: number;
  beat: number;
}) {
  const [data, setData] = useState<{ ip?: number; op?: number } | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prevBeat = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/emoji/shengxiao/${cp}.json`)
      .then((r) => r.json())
      .then((j) => {
        if (alive) setData(j);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [cp]);

  // once loaded, park on the resting (static-emoji) frame
  useEffect(() => {
    const l = lottieRef.current;
    if (!l || !data) return;
    l.goToAndStop(restFrameOf(cp), true);
  }, [data, cp]);
  // play the wiggle once when the minute advances by exactly one (a natural
  // tick). On first mount, or when `beat` jumps by more than one — e.g. the tab
  // was hidden (rAF frozen) and the visibility handler fast-forwards `now` on
  // return — we only update the baseline silently, so the animal doesn't wiggle
  // just because you came back to the page.
  useEffect(() => {
    const l = lottieRef.current;
    if (!l || !active || !data) return;
    const prev = prevBeat.current;
    prevBeat.current = beat;
    if (prev === null || beat - prev !== 1) return; // mount or fast-forward: don't play
    const ip = data.ip ?? 0;
    const op = data.op ?? 100;
    if (cp === DRAGON_CP) {
      l.playSegments(
        [
          [DRAGON_MID, op],
          [ip, DRAGON_MID],
        ],
        true
      );
    } else if (cp === HORSE_CP) {
      // shortest animation — play it three times so the wiggle reads
      l.playSegments(
        [
          [ip, op],
          [ip, op],
          [ip, op],
        ],
        true
      );
    } else {
      l.playSegments([ip, op], true);
    }
  }, [beat, active, data, cp]);

  const size = active ? ANIMAL_SIZE.active : ANIMAL_SIZE.inactive;
  // The dragon's Noto animation translates off-canvas as it flies; a CSS mask
  // on its layer fades the alpha to 0 at the left/right edges, so the fly-out /
  // fly-in dissolves into the face instead of being hard-clipped. The opaque
  // band reaches exactly to the resting dragon's horizontal extent (0.802 of a
  // half), so the static dragon is never touched. Only the dragon needs this.
  const SOLID_HALF = 0.802;
  const useMask = active && cp === DRAGON_CP;
  const fadeMask = useMask
    ? `linear-gradient(to right, transparent 0%, #000 ${((1 - SOLID_HALF) / 2) * 100}%, #000 ${(1 - (1 - SOLID_HALF) / 2) * 100}%, transparent 100%)`
    : undefined;
  return (
    <div
      style={{
        position: "absolute",
        left: `${cx}%`,
        top: `${cy}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        transition: "width 0.3s ease, height 0.3s ease",
        filter: active ? "drop-shadow(0 2px 4px rgba(0,0,0,0.18))" : "none",
      }}
    >
      {data ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            WebkitMaskImage: fadeMask,
            maskImage: fadeMask,
          }}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={data}
            loop={false}
            autoplay={false}
            onDOMLoaded={() => lottieRef.current?.goToAndStop(restFrameOf(cp), true)}
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function ShengxiaoClock() {
  const now = useWallClock(1000);
  const h = now ? now.getHours() : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  // current 时辰 index (0=子 … 11=亥); 子时 starts at 23:00. -1 before mount.
  const k = now ? Math.floor(((h + 1) % 24) / 2) : -1;
  // a counter that ticks once per wall-clock minute (the 0-second mark)
  const beat = now ? Math.floor(now.getTime() / 60000) : 0;

  const minuteAngle = (m + s / 60) * 6;
  const secondAngle = s * 6;

  return (
    <div className="w-72 h-72 sm:w-96 sm:h-96">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
        role="img"
        aria-label="Shengxiao — Chinese zodiac double-hour clock"
      >
        {now &&
          CP.map((cp, i) => {
            const ang = (i * 30 * Math.PI) / 180;
            const cx = 50 + Math.sin(ang) * R_RING;
            const cy = 50 - Math.cos(ang) * R_RING;
            return <Animal key={cp} cp={cp} active={i === k} cx={cx} cy={cy} beat={beat} />;
          })}

        {/* small minute & second hands in the empty centre */}
        {now && (
          <svg
            viewBox="-50 -50 100 100"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "40%",
              height: "40%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <line
              x1="0"
              y1="7"
              x2="0"
              y2="-26"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${minuteAngle})`}
            />
            <line
              x1="0"
              y1="9"
              x2="0"
              y2="-38"
              stroke="#c1121f"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${secondAngle})`}
            />
            <circle cx="0" cy="0" r="2.5" fill="#1a1a1a" />
          </svg>
        )}
      </div>
    </div>
  );
}

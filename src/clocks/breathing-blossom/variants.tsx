"use client";

import { useRef } from "react";
import { useWallClock } from "../useWallClock";

/**
 * Breathing Blossom — sakura family.
 *
 * Mechanism (shared by every variant):
 *   · a calm 16s box-breath (inhale 4s / hold 4s / exhale 4s / hold 4s) gently
 *     opens and closes the bloom;
 *   · time is read on the calm outer ring, never on the slowly drifting
 *     petals — minutes as a soft arc that fills over the hour, hours as a
 *     highlighted tick, the second as a light gliding smoothly around the rim.
 *
 * #016 (flow)   — soft sakura wash, very slow drift.
 * #017 (sakura) — five notched cherry petals, paler pink, livelier drift,
 *                 a soft glowing bud at the heart (no hard centre dot).
 * Then five sakura derivatives: lighter bg, white bg, and three different
 * petal drawings (veined / ink-outline / camellia).
 */

const RAD = Math.PI / 180;

const BREATH = "16s";
// inhale 4.8s / hold 3.2s / exhale 4.8s / hold 3.2s — the longer motion + shorter
// hold reads more like an even 4-count by eye (the eased motion looks faster than it is).
const KT = "0;0.3;0.5;0.8;1";
const SPLINE = "0.42 0 0.58 1;0 0 1 1;0.42 0 0.58 1;0 0 1 1";

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

function polar(angleDeg: number, r: number) {
  const a = (angleDeg - 90) * RAD;
  return { x: round(Math.cos(a) * r), y: round(Math.sin(a) * r) };
}

function env(closed: string, open: string) {
  return `${closed};${open};${open};${closed};${closed}`;
}

type PetalStyle = "round" | "notched" | "veined" | "ink" | "camellia";

// a soft, rounded petal — blunt tip
function petalPathRound(len: number, wid: number) {
  const l = len;
  const w = wid;
  return (
    `M 0 0 ` +
    `C ${-w} ${round(-l * 0.26)}, ${round(-w * 0.78)} ${round(-l * 0.96)}, 0 ${-l} ` +
    `C ${round(w * 0.78)} ${round(-l * 0.96)}, ${w} ${round(-l * 0.26)}, 0 0 Z`
  );
}

// a cherry-blossom petal — two lobes with a small cleft (notch) at the tip
function petalPathNotched(len: number, wid: number) {
  const l = len;
  const w = wid;
  const nd = round(l * 0.16); // notch depth
  return (
    `M 0 0 ` +
    `C ${-w} ${round(-l * 0.24)}, ${round(-w * 0.92)} ${round(-l * 0.95)}, ${round(-w * 0.42)} ${-l} ` +
    `C ${round(-w * 0.22)} ${round(-l - nd * 0.1)}, ${round(-w * 0.12)} ${round(-l + nd)}, 0 ${round(-l + nd)} ` +
    `C ${round(w * 0.12)} ${round(-l + nd)}, ${round(w * 0.22)} ${round(-l - nd * 0.1)}, ${round(w * 0.42)} ${-l} ` +
    `C ${round(w * 0.92)} ${round(-l * 0.95)}, ${w} ${round(-l * 0.24)}, 0 0 Z`
  );
}

// a plump, full camellia-like petal — wide waist, gently rounded tip
function petalPathCamellia(len: number, wid: number) {
  const l = len;
  const w = wid;
  return (
    `M 0 0 ` +
    `C ${-w * 1.12} ${round(-l * 0.34)}, ${round(-w * 0.7)} ${round(-l * 0.99)}, 0 ${-l} ` +
    `C ${round(w * 0.7)} ${round(-l * 0.99)}, ${w * 1.12} ${round(-l * 0.34)}, 0 0 Z`
  );
}

function pathFor(style: PetalStyle, len: number, wid: number) {
  if (style === "notched" || style === "veined" || style === "ink") {
    return petalPathNotched(len, wid);
  }
  if (style === "camellia") return petalPathCamellia(len, wid);
  return petalPathRound(len, wid);
}

function arcPath(frac: number, r: number) {
  if (frac <= 0) return "";
  const a = Math.min(frac, 0.9999) * 360;
  const start = polar(0, r);
  const end = polar(a, r);
  const large = a > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

type Palette = {
  face: string;
  faceStroke: string;
  guide: string;
  guideOpacity: number;
  petalStops: [string, number][]; // [color, opacity] at 0 / 55 / 100%
  petalEdge: string;
  petalEdgeOpacity: number;
  vein: string;
  ink: string; // outline colour for the ink style
  budCore: string; // soft heart glow colour
  pollen: string; // tiny stamen dots
  accent: string;
  accentSoft: string;
  tickIdle: string;
};

// shared sakura palette — petals a touch more opaque so they read clearly
const SAKURA: Palette = {
  face: "#fdf7f8",
  faceStroke: "#f0dde2",
  guide: "#f0dde2",
  guideOpacity: 0.8,
  petalStops: [
    ["#f59ab7", 0.72],
    ["#f9c2d2", 0.5],
    ["#ffe3ea", 0.18],
  ],
  petalEdge: "#ef8fab",
  petalEdgeOpacity: 0.32,
  vein: "#e87fa0",
  ink: "#9c5a6e",
  budCore: "#f0b06a",
  pollen: "#e09a3c",
  accent: "#ef7d9d",
  accentSoft: "#f29ab2",
  tickIdle: "#e3cdd2",
};

function withFace(p: Palette, face: string, faceStroke: string, guide: string): Palette {
  return { ...p, face, faceStroke, guide };
}

const PALETTES: Record<string, Palette> = {
  // soft sakura wash — the well-liked original (#016)
  flow: {
    face: "#faf6f1",
    faceStroke: "#ece1d6",
    guide: "#ecdfd4",
    guideOpacity: 0.7,
    petalStops: [
      ["#e49aaa", 0.5],
      ["#ecbcc6", 0.28],
      ["#f3d7dd", 0.04],
    ],
    petalEdge: "#d7a4b0",
    petalEdgeOpacity: 0.22,
    vein: "#d98ea0",
    ink: "#9c6a72",
    budCore: "#f3c79a",
    pollen: "#e0a25c",
    accent: "#dd7d92",
    accentSoft: "#dd93a4",
    tickIdle: "#cdbcae",
  },
  sakura: SAKURA,
  // a — lighter, airier background
  sakuraPale: withFace(SAKURA, "#fffafb", "#f7ebee", "#f7e7ec"),
  // b — pure white background
  sakuraWhite: withFace(SAKURA, "#ffffff", "#f1e3e7", "#f3e6ea"),
  // c/d/e share sakura colours, differ only in petal drawing
  sakuraVeined: SAKURA,
  sakuraInk: SAKURA,
  sakuraCamellia: SAKURA,
};

type RingProps = {
  id: string;
  p: Palette;
  style: PetalStyle;
  count: number;
  len: number;
  wid: number;
  dClosed: number;
  dOpen: number;
  sClosed: number;
  sOpen: number;
  baseRotate?: number;
  driftTo: number;
  driftDur: string;
  borderless?: boolean;
};

function Veins({ len, vein }: { len: number; vein: string }) {
  return (
    <g stroke={vein} strokeWidth={0.5} strokeOpacity={0.45} fill="none" strokeLinecap="round">
      <line x1={0} y1={round(-len * 0.16)} x2={0} y2={round(-len * 0.82)} />
      <line x1={0} y1={round(-len * 0.42)} x2={round(-len * 0.16)} y2={round(-len * 0.74)} />
      <line x1={0} y1={round(-len * 0.42)} x2={round(len * 0.16)} y2={round(-len * 0.74)} />
    </g>
  );
}

function PetalRing({
  id,
  p,
  style,
  count,
  len,
  wid,
  dClosed,
  dOpen,
  sClosed,
  sOpen,
  baseRotate = 0,
  driftTo,
  driftDur,
  borderless,
}: RingProps) {
  const path = pathFor(style, len, wid);
  const transVals = env(`0 ${-dClosed}`, `0 ${-dOpen}`);
  const scaleVals = env(String(sClosed), String(sOpen));

  const isInk = style === "ink";

  return (
    <g transform={`rotate(${baseRotate})`}>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0"
        to={String(driftTo)}
        dur={driftDur}
        repeatCount="indefinite"
        additive="sum"
      />
      {Array.from({ length: count }).map((_, i) => {
        const a = (i * 360) / count;
        return (
          <g key={i} transform={`rotate(${a})`}>
            <g>
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                values={transVals}
                keyTimes={KT}
                dur={BREATH}
                calcMode="spline"
                keySplines={SPLINE}
                repeatCount="indefinite"
                additive="sum"
              />
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="scale"
                values={scaleVals}
                keyTimes={KT}
                dur={BREATH}
                calcMode="spline"
                keySplines={SPLINE}
                repeatCount="indefinite"
                additive="sum"
              />
              {isInk ? (
                <path
                  d={path}
                  fill="#ffffff"
                  fillOpacity={0.5}
                  stroke={p.ink}
                  strokeWidth={1.3}
                  strokeOpacity={0.8}
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d={path}
                  fill={`url(#${id}-petal)`}
                  stroke={borderless ? "none" : p.petalEdge}
                  strokeWidth={borderless ? 0 : 0.7}
                  strokeOpacity={borderless ? 0 : p.petalEdgeOpacity}
                  strokeLinejoin="round"
                />
              )}
              {style === "veined" && <Veins len={len} vein={p.vein} />}
            </g>
          </g>
        );
      })}
    </g>
  );
}

// a soft glowing bud — gradient only, no hard edge — with faint stamen dots
function Bud({ id, p }: { id: string; p: Palette }) {
  return (
    <>
      {/* breathing halo */}
      <circle cx={0} cy={0} r={16} fill={`url(#${id}-core)`}>
        <animate
          attributeName="r"
          values={env("9", "20")}
          keyTimes={KT}
          dur={BREATH}
          calcMode="spline"
          keySplines={SPLINE}
          repeatCount="indefinite"
        />
      </circle>
      {/* soft bud centre — fades out at the edge, no abrupt ring */}
      <circle cx={0} cy={0} r={6} fill={`url(#${id}-bud)`}>
        <animate
          attributeName="r"
          values={env("4", "6.5")}
          keyTimes={KT}
          dur={BREATH}
          calcMode="spline"
          keySplines={SPLINE}
          repeatCount="indefinite"
        />
      </circle>
    </>
  );
}

type BlossomProps = {
  id: string;
  palette: string;
  style?: PetalStyle;
  count?: number;
  outerWid?: number;
  innerWid?: number;
  outerLen?: number;
  innerLen?: number;
  driftDur?: string;
  singleLayer?: boolean;
  borderless?: boolean;
  haze?: number; // gaussian blur stdDeviation on the bloom; 0 = none
  // when true, the bloom is rotated once at mount so a petal's axis sits on the
  // second light, and (paired with driftDur="60s") stays locked to it forever.
  alignSeconds?: boolean;
  // spin the bloom anti-clockwise (petals drift against the second light)
  reverse?: boolean;
};

function BlossomBase({
  id,
  palette,
  style = "round",
  count = 6,
  outerWid = 20,
  innerWid = 14,
  outerLen = 50,
  innerLen = 32,
  driftDur = "200s",
  singleLayer = false,
  borderless = false,
  haze = 0,
  alignSeconds = false,
  reverse = false,
}: BlossomProps) {
  // 50ms cadence → the second light glides smoothly instead of ticking
  const now = useWallClock(50);
  const p = PALETTES[palette];

  const h = now ? now.getHours() % 12 : 0;
  const m = now ? now.getMinutes() : 0;
  const s = now ? now.getSeconds() : 0;
  const millis = now ? now.getMilliseconds() : 0;

  const hourVal = h === 0 ? 12 : h;
  const secCont = s + millis / 1000;
  const minuteFrac = (m + secCont / 60) / 60;
  const RIM = 90;
  const secDot = polar(secCont * 6, RIM);

  // Capture the second angle ONCE, the first frame we know the time. The SMIL
  // drift (additive, starting at 0) is layered on top, so the bloom both starts
  // on the second light and — with driftDur "60s" — keeps pace with it.
  const alignRef = useRef<number | null>(null);
  if (alignSeconds && alignRef.current === null && now) {
    alignRef.current = secCont * 6;
  }
  const alignOffset = alignSeconds ? alignRef.current ?? 0 : 0;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Breathing blossom clock"
    >
      <defs>
        <radialGradient id={`${id}-petal`} cx="50%" cy="100%" r="105%">
          <stop offset="0%" stopColor={p.petalStops[0][0]} stopOpacity={p.petalStops[0][1]} />
          <stop offset="55%" stopColor={p.petalStops[1][0]} stopOpacity={p.petalStops[1][1]} />
          <stop offset="100%" stopColor={p.petalStops[2][0]} stopOpacity={p.petalStops[2][1]} />
        </radialGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor={p.budCore} stopOpacity="0.55" />
          <stop offset="55%" stopColor={p.budCore} stopOpacity="0.18" />
          <stop offset="100%" stopColor={p.budCore} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-bud`}>
          <stop offset="0%" stopColor={p.budCore} stopOpacity="0.9" />
          <stop offset="60%" stopColor={p.budCore} stopOpacity="0.4" />
          <stop offset="100%" stopColor={p.budCore} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sec`}>
          <stop offset="0%" stopColor={p.accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
        </radialGradient>
        {haze > 0 && (
          <filter id={`${id}-haze`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={haze} />
          </filter>
        )}
      </defs>

      <circle cx="0" cy="0" r="96" fill={p.face} stroke={p.faceStroke} strokeWidth="1.5" />

      <circle
        cx="0"
        cy="0"
        r={RIM}
        fill="none"
        stroke={p.guide}
        strokeWidth="2"
        opacity={p.guideOpacity}
      />

      {now && (
        <>
          {/* minutes — a soft arc that fills the ring over the hour */}
          <path
            d={arcPath(minuteFrac, RIM)}
            fill="none"
            stroke={p.accentSoft}
            strokeWidth="2.6"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />

          {/* hours — twelve ticks, the current one aglow */}
          {Array.from({ length: 12 }).map((_, i) => {
            const pt = polar(i * 30, 78);
            const label = i === 0 ? 12 : i;
            const on = label === hourVal;
            return (
              <g key={i}>
                {on && <circle cx={pt.x} cy={pt.y} r={6.5} fill={`url(#${id}-sec)`} />}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={on ? 2.6 : 1.6}
                  fill={on ? p.accent : p.tickIdle}
                  opacity={on ? 0.95 : 0.4}
                />
              </g>
            );
          })}

          {/* the breathing bloom */}
          <g filter={haze > 0 ? `url(#${id}-haze)` : undefined}>
            <PetalRing
              id={id}
              p={p}
              style={style}
              count={count}
              len={outerLen}
              wid={outerWid}
              dClosed={4}
              dOpen={8}
              sClosed={0.45}
              sOpen={1}
              baseRotate={alignOffset}
              driftTo={reverse ? -360 : 360}
              driftDur={driftDur}
              borderless={borderless}
            />
            {!singleLayer && (
              <PetalRing
                id={id}
                p={p}
                style={style}
                count={count}
                len={innerLen}
                wid={innerWid}
                dClosed={3}
                dOpen={6}
                sClosed={0.45}
                sOpen={0.95}
                baseRotate={180 / count}
                driftTo={-360}
                driftDur={driftDur}
                borderless={borderless}
              />
            )}
          </g>

          <Bud id={id} p={p} />

          {/* seconds — a gentle light gliding smoothly round the rim */}
          <circle cx={secDot.x} cy={secDot.y} r={5} fill={`url(#${id}-sec)`} />
          <circle cx={secDot.x} cy={secDot.y} r={2} fill={p.accent} opacity={0.9} />
        </>
      )}
    </svg>
  );
}

/* ── borderless: petals keep colour only, no outline ─────────── */
/* The shipped clock — "Breathing Blossom". Removing the petal outline lets the
 * soft pink gradient melt into the pale background — gentle, hazy-by-nature.  */
export function BreathingBlossom() {
  return (
    <BlossomBase
      id="bspbare"
      palette="sakuraPale"
      style="notched"
      count={5}
      outerWid={33}
      outerLen={52}
      driftDur="60s"
      singleLayer
      borderless
    />
  );
}

/*
 * ── Other borderless / hazy ideas we explored (kept as notes, not shipped) ──
 *
 * The BlossomBase already supports both knobs, so any of these can be
 * re-created in one line by adding a registry entry:
 *
 *   1. White-bare — same as #018 but on a pure-white face
 *      (palette="sakuraWhite", borderless). The petals read as floating
 *      colour with no card edge; cleaner / more clinical than the pale bg.
 *
 *   2. Pale-haze — #018 plus a faint Gaussian blur on the whole bloom
 *      (borderless + haze={0.5}). The blur fuses the five petals into one
 *      soft cloud of pink. We tried haze 2.2 → 1.4 → 0.8 → 0.5; anything
 *      above ~0.8 quickly felt "out of focus" rather than "dreamy".
 *
 *   3. White-haze — idea 2 on the white face.
 *
 *   4. Dream — a double-layer (no singleLayer) borderless bloom with heavier
 *      haze (~3). The whole flower dissolves into a glowing halo; abandoned
 *      because the timekeeping petals became unreadable.
 *
 * The `haze` prop injects an SVG <feGaussianBlur> filter that wraps only the
 * petal rings (not the rim / ticks / second light), so the clock stays legible.
 *
 * ── Retired outlined singles (were #016 / #017, removed) ──
 *
 *   • Pale-single  — palette="sakuraPale", style="notched", count={5},
 *     outerWid={33}, outerLen={52}, driftDur="60s", singleLayer.
 *     Five notched cherry petals on a pale ground WITH a thin pink outline
 *     (petalEdge). Retired in favour of the borderless #018, which reads
 *     softer; the outline made the petals feel a touch sticker-like.
 *
 *   • White-single — same as above but palette="sakuraWhite" (pure white face).
 *
 *   Both can be revived by setting `borderless={false}` on a copy of #018.
 *   NOTE: their driftDur was "60s", which happens to equal the second hand's
 *   period — that is exactly the "petals & second light feel permanently
 *   skewed" coupling we later split apart in the Drift / Locked pair below.
 */

/* ── A · Drift / B · Locked / Reverse (all retired) ────────────
 *   • Drift   — driftDur="200s", singleLayer, borderless. Decoupled from the
 *     second hand so the petals slowly precess. Retired: too slow, the motion
 *     read as almost static.
 *   • Locked  — driftDur="60s" + alignSeconds, so a petal axis rides the second
 *     light forever. Retired: too deliberate — the petal felt like a fat second
 *     hand, which killed the ambient quality.
 *   • Reverse — driftDur="60s" + reverse, petals drift anti-clockwise against
 *     the second light. Retired by eye after a side-by-side.
 *   All revivable from a copy of #016 with those props (alignSeconds & reverse
 *   are still on BlossomBase).
 *
 * ── UNSOLVED: petals vs. second-light coupling ────────────────
 * The bloom's drift (driftDur) and the second light (360°/60s) share the same
 * canvas. When their angular speeds are equal (driftDur="60s") the relative
 * angle is fixed at whatever it was on page load, so the second light looks
 * permanently "skewed" beside a petal. When they differ (e.g. 200s) the angle
 * drifts but very slowly. We tried:
 *   - decoupling (Drift, 200s) → too static;
 *   - locking on purpose (Locked, alignSeconds) → too deliberate;
 *   - opposing spin (Reverse) → still reads as a fixed-ish relationship.
 * None felt right. No good fix yet — leaving #016 as-is (driftDur="60s") for
 * now and parking the problem here.
 */

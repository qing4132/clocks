# Archived designs

These designs were prototyped but didn't make it into the final gallery.
They're kept here for ideas and reference. Files in this folder are **not**
included in the Next.js compile / build.

## expanding-rings (formerly #008)

**Concept.** A vertical ruler runs from the center to the top of the dial,
divided into 12 equal segments. Three concentric circles, centered at the
dial center, expand outward to encode hours / minutes / seconds. Reading
the time = where each ring's edge crosses the ruler:

- hour ring radius   = (h + m/60) / 12 · L
- minute ring radius = (m + s/60) / 60 · L
- second ring radius =  s / 60         · L

Value 0 is shown as a full-size ring (sitting at the dial edge) rather than
a collapsed point, so each cycle wraps `… 11 → 12 → 1 …` smoothly.

**Why it was archived.** The single vertical ruler felt visually weak —
no matter the tick style we tried (centered short ticks, dots, triangles,
thermometer-style double line, minimal-only-3/6/9/12), it always looked
either too engineering-blueprinty or too sparse on an otherwise empty dial.

Files preserved:
- `ExpandingRingsClock.tsx` — single-design version (the original #008)
- `Base.tsx` — shared rendering used by the variants
- `variants.tsx` — five tick / numeral treatments we tried (A–E)

## orb (formerly #008, second attempt)

**Concept.** Three #001-style dials live on three mutually perpendicular
planes (XY / YZ / XZ) of a shared 3D coordinate system, centered at the
origin. The hour hand belongs to the XZ plane, the minute hand to the YZ
plane, the second hand to the XY plane. Each hand stays on its own dial,
so looking at any plane head-on reproduces #001 exactly (minus the other
two hands). The three rings together hint at a sphere.

A fixed orthographic camera (yaw ≈ -32°, pitch ≈ 22°) projects everything
to 2D. We tried several variations: full #001 dial per plane (60 ticks
+ 12 numerals), trimmed dials (12 ticks + cardinal numerals), ticks-only,
cardinals-only, single-12-only, and even a shaded sphere body with a glint.

**Why it was archived.** The three rings share a common center, so the
12-o'clock / 3-o'clock / 6-o'clock / 9-o'clock markers from all three
dials end up at the same projected screen positions no matter the camera
angle. Numerals overlap; ticks overlap. Removing them helped readability
but stripped away too much of the #001 character — at the limit the orb
was just three indistinguishable ellipses with three hands on top.

Files preserved:
- `OrbClock.tsx` — full implementation with parameterised camera. The
  variant we kept the longest is the trimmed dial (rim + 4 cardinal
  ticks at 12 / 3 / 6 / 9, no numerals).

## incense (formerly #012)

**Concept.** A coiled stick of incense drawn as an Archimedean spiral
from outer rim inward over 12 turns. The whole stick burns over one
wall-clock day (86 400 s), at a uniform arc-length-per-second rate so
the ember (the burn head) moves visibly faster on outer turns and
slowly creeps inward over the day.

- visuals: brown unburned stretch, dashed ash trail, red-yellow ember,
  faint smoke wisps above the head
- arc-length inversion was precomputed by numerical integration of
  ds/dθ = √(r² + (dr/dθ)²) for r(θ) = R_outer − A·θ, then binary-searched
  to invert s ↦ θ

**Why it was archived.** Reading the time off a coil is uncomfortable
no matter what readout you add: bare spiral (zen), hour ticks along
the spiral, outer 12-hour ring with a radial projection, bottom
progress bar, floating HH:MM label by the ember — all five tried and
all visually noisy / fighting the spiral's own beauty. The "coil + an
add-on" combo just doesn't work as a clock face.

Files preserved:
- `IncenseClock.tsx` — original single-design version (with the hour
  tick / label readout that motivated the variants)
- `IncenseBase.tsx` — shared spiral + burn math used by the variants
- `variants.tsx` — five readout treatments A–E

## twelve-clocks (formerly #014, second design)

**Concept.** Self-similar fractal: one main clock holds 12 mini-clocks at
its numeral positions, each mini holds 12 grandchildren of the same
shape. Every 5 seconds the camera linearly zooms into the 12-o'clock
mini-clock. By the end of the zoom that mini fills the viewport and —
because it contains 12 grandchildren of its own — the image is visually
identical to the un-zoomed starting frame, so scale wraps from 8 to 1
seamlessly. All 1 + 12 + 144 = 157 clocks carry their own hour and
minute hands, synced to the real time via a single rAF loop that writes
transform attributes directly (no React re-render per frame).

The math that ties it together:
```
T(p) = scale·p + t
require T(c) = (1-u)·c   →   t = (1 - u - scale)·c
```
giving the identity transform at u=0 and "target at origin, scaled 8x"
at u=1.

**Why it was archived.** Multiple rounds of redesign (target-follows-
seconds, target-fixed-at-12, linear vs exponential zoom, with/without
grandchildren-hands) never produced a visually satisfying loop. The
combination of (a) wanting the start frame to be a "full clock", (b) the
end frame to be the same full clock self-similarly, and (c) the camera
to track the second hand around the dial turned out to be only partially
satisfiable — every viable compromise had at least one of: a visible
jump on each 5-second boundary, target sliding through the frame mid-
animation, or the intuitive "zoom-into-fractal" feel being lost. The
fractal-as-static-design concept lives on in #015 hands-are-clocks.

Files preserved:
- `TwelveClocksClock.tsx` — the final version (fixed target at 12 o'clock,
  linear scale, all three levels with hands)

## dead-pixel (formerly #016)

**Concept.** A digital readout where the digits aren't drawn as vector
shapes but emerge from the density of flickering pixels. The panel is
filled with a regular pixel grid; each frame, each cell independently
lights up with probability `pBg` outside the digit silhouette and `pFg`
inside it. Because pFg ≫ pBg, the digit shapes "dither" out of the
noise — they're never lit as a single solid block but their region is
visibly denser than the surroundings.

The digit shapes come from a hand-rolled 5×7 dotted font scaled to fit
HH:MM:SS across the panel.

**Variants kept (B = saved).**
- B: cell=2, pBg=12%, pFg=90%, interval=1000ms — noise reroll once per
  second, foreground "almost always lit" but with occasional fadeouts;
  the most readable balance we found.
- A/C/D/E explored lower-contrast / larger pixels / red seconds / slower
  refresh — they all hurt readability.

**Why it was archived.** Even at the most readable settings (B), users
report it's still hard to read at a glance, which defeats the project's
"clock you can tell the time from" rule.

Files preserved:
- `density.tsx` — full implementation + 5 variants

## breath (formerly #016–#018)

**Concept.** Three "正念呼吸钟"，#001 风格：奶油底 + 黑边 + 衬线字 +
红色高亮当前相位。完全图形/动画引导，没有倒计时数字。

- BoxBreath（盒式 4-4-4-4）：红点沿圆角方形跑一圈，上/下边吸呼，
  左/右边屏息（虚线表示）；中央圆同步胀缩。
- ResonantBreath（共振 5-5）：纯正弦呼吸，圆慢慢胀缩，红点贴顶。
- RelaxationBreath（4-7-8）：外圈分三段弧，按相位长度切，
  当前段红色填充进度；中心圆吸涨—屏息—长呼。

**为什么归档.** 和钟表馆其它"一眼读时间"的钟违和：呼吸钟需要你
停下来跟着它呼吸，不适合做日常报时。底部那个淡淡的 HH:MM 反而显得
多余。作为一组独立的"正念小品"留着，未必属于这个馆。

Files preserved:
- `breath.tsx` — BoxBreath / ResonantBreath / RelaxationBreath

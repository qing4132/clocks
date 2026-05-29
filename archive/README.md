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

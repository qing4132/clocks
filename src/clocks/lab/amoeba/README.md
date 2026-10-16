# Amoeba Studies / #1532-1536

Five Lab-only clocks share the Amoeba tab. The original study remains unchanged
while four requested alternatives explore different relationships to time.
None has been selected for the formal gallery.

| ID | Study | Reading |
| --- | --- | --- |
| 1532 | Amoeba | Original traveling deformation; curved hands, ticks, and numeral positions share one map. |
| 1533 | Sculpted Time | Wide, short hour lobe and narrow minute lobe replace the black needles. Two small marks retain exact bearings, including at meetings. |
| 1534 | Coalescence | A larger hour drop and smaller minute drop grow a neck, merge, and separate as their time positions approach and diverge. Figures preserve both readings. |
| 1535 | Carry Flow | Hour at upper left, minute at upper right, second below. A red packet enters the minute region at each minute carry; a black packet enters the hour region at an hour carry. |
| 1536 | Viscous Time | Hand interiors trail their current tips. The skin has a seconds-driven wake rather than an independent shape oscillator. |

The four new studies use the existing wall clock at 20 ms cadence. All geometry
is determined by the selected local time, so pause, replay, stepping, and speed
controls remain consistent. No additional timers, workers, dependencies, or
viewer interaction are required.

## Previewing Events

- `10:08:36`: distinct lobes and separated drops.
- `10:47:00`: a visible neck between the hour and minute drops.
- `11:59:58`: resume at normal speed to watch both transfers cross noon.
- `12:00:00`: coincident bearings remain distinguishable.

Transfer animation spans 1.4 seconds before through 1.8 seconds after a local
carry. Numeric readings change at the actual boundary, not when a packet lands.
Packets enter and leave below the figures so they do not cover the reading.
These are analytic graphic constructions, not fluid-physics simulations.

Coalescence retains full-precision arc endpoints. Below a visually negligible
neck size it draws two complete circles, avoiding a near-complete SVG arc whose
rounded endpoints accidentally coincide. Viscous hands follow a fixed
trailing-time profile with no accumulated animation state; their tips retain
the exact current-time bearings.

Each card includes a Chinese hover/focus explanation, dismissible with Escape.
The formal 34 works and the previous 200-study batches remain unchanged.

## Verification

```sh
node --test src/clocks/lab/amoeba/amoeba.test.mjs
npx eslint src/clocks/lab/amoeba src/app/lab/page.dev.tsx
npm run build
```

Seventeen tests cover the original deformation, four new identifiers, accurate
tips, coincident readings, fusion boundaries, constant-style SVG rendering,
replay, local carry windows, and viscous lag. Browser checks cover 84 combinations
of four variants, seven times, and desktop/390px/320px widths, plus all Chinese
tooltips. A visible-browser run crossed noon and observed both carry packets
reach full strength and finish while all four variants continued updating.
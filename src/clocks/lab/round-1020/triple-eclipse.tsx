import { ClassicFace, INK, RED, polar, type ClockTime } from "./shared";

type Palette = {
  id: string;
  colors: [string, string, string];
  opacities: [number, number, number];
};

const HANDS = [
  { key: "hour", fraction: (time: ClockTime) => time.hour, tip: 50, tail: 10 },
  { key: "minute", fraction: (time: ClockTime) => time.minute, tip: 74, tail: 14 },
  { key: "second", fraction: (time: ClockTime) => time.second, tip: 84, tail: 20 },
] as const;

const PALETTES: Record<number, Palette> = {
  1070: {
    id: "spring",
    colors: ["#ff9fbd", "#8ed8ff", "#ffe58a"],
    opacities: [0.62, 0.62, 0.68],
  },
  1071: {
    id: "sky",
    colors: ["#89c7ff", "#95e1d3", "#ffb3a7"],
    opacities: [0.62, 0.65, 0.6],
  },
  1072: {
    id: "sorbet",
    colors: ["#ffb67a", "#c2afff", "#7edfd4"],
    opacities: [0.62, 0.62, 0.62],
  },
  1073: {
    id: "garden",
    colors: ["#abd98b", "#8db7ec", "#f4a6b8"],
    opacities: [0.62, 0.62, 0.6],
  },
  1074: {
    id: "morning",
    colors: ["#8fd3ea", "#f5dc78", "#ff9a8a"],
    opacities: [0.62, 0.65, 0.58],
  },
  1075: {
    id: "petal",
    colors: ["#efabc8", "#bca9e8", "#9cd8c3"],
    opacities: [0.62, 0.62, 0.62],
  },
  1076: {
    id: "classic",
    colors: [INK, "#8a8a84", RED],
    opacities: [0.16, 0.28, 0.18],
  },
};

function TripleEclipse({ time, palette }: { time: ClockTime; palette: Palette }) {
  const circles = HANDS.map((hand, index) => {
    const fraction = hand.fraction(time);
    return {
      key: hand.key,
      center: polar(hand.tip, fraction),
      radius: hand.tip + hand.tail,
      color: palette.colors[index],
      opacity: palette.opacities[index],
    };
  });
  const maskId = `round1020-triple-${palette.id}-mask`;
  const faceClipId = `round1020-triple-${palette.id}-face`;

  return (
    <>
      <defs>
        <clipPath id={faceClipId}>
          <circle r="96" />
        </clipPath>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-110" y="-110" width="220" height="220">
          <rect x="-110" y="-110" width="220" height="220" fill="black" />
          {circles.map((circle) => (
            <circle key={circle.key} cx={circle.center.x} cy={circle.center.y} r={circle.radius} fill="white" />
          ))}
        </mask>
      </defs>

      <g clipPath={`url(#${faceClipId})`} style={{ mixBlendMode: "multiply" }}>
        {circles.map((circle) => (
          <circle
            key={circle.key}
            cx={circle.center.x}
            cy={circle.center.y}
            r={circle.radius}
            fill={circle.color}
            opacity={circle.opacity}
          />
        ))}
      </g>

      <g mask={`url(#${maskId})`}>
        <ClassicFace
          time={time}
          showFace={false}
          showHands={false}
          rimColor={INK}
          tickColor={() => INK}
          numeralColor={() => INK}
        />
      </g>

      <ClassicFace
        time={time}
        showFace={false}
        showRim={false}
        showTicks={false}
        showNumerals={false}
        hourColor={INK}
        minuteColor={INK}
        secondColor={RED}
      />
    </>
  );
}

export const tripleEclipseRenderers = Object.fromEntries(
  Object.entries(PALETTES).map(([id, palette]) => [
    Number(id),
    ({ time }: { time: ClockTime }) => <TripleEclipse time={time} palette={palette} />,
  ]),
);

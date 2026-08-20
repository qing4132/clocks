export type OverprintVariant = "halo";

type Group = {
  text: string;
  color: string;
  epoch: number;
};

type Placement = {
  x: number;
  y: number;
  angle: number;
  scale: number;
};

const FONT = "Georgia, 'Times New Roman', serif";
const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";
const GRAPHITE = "#77736c";
const GEORGIA_OPTICAL_LIFT = "-0.111em";
const ANCHORS = [{ x: -18, y: -25 }, { x: 20, y: -17 }, { x: 0, y: 23 }];
const ANGLES = [-16, 14, -4];

// Rejected #606 Open Field reference: same anchors, angles, jitter, colors,
// 3.8 paper outline, and -0.111em lift as #603; fontSize 168; no round face;
// SVG overflow visible; homepage/Lab card overflow hidden; detail view unclipped.

function pad(value: number) {
  return String(Math.floor(value)).padStart(2, "0");
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function hash(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function groupsFor(date: Date): Group[] {
  const timestamp = date.getTime();
  return [
    { text: pad(date.getHours()), color: INK, epoch: Math.floor(timestamp / 3_600_000) },
    { text: pad(date.getMinutes()), color: GRAPHITE, epoch: Math.floor(timestamp / 60_000) },
    { text: pad(date.getSeconds()), color: RED, epoch: Math.floor(timestamp / 1_000) },
  ];
}

function placement(group: Group, index: number): Placement {
  const seed = group.epoch % 1_000_003 + (index + 1) * 977;
  return {
    x: round(ANCHORS[index].x + (hash(seed * 3 + 1) - 0.5) * 7),
    y: round(ANCHORS[index].y + (hash(seed * 5 + 2) - 0.5) * 7),
    angle: round(ANGLES[index] + (hash(seed * 7 + 3) - 0.5) * 12),
    scale: round(1 + (hash(seed * 11 + 4) - 0.5) * 0.06),
  };
}

export function OverprintFace({
  date,
}: {
  date: Date;
  variant: OverprintVariant;
}) {
  const fontSize = 112;

  return (
    <>
      {groupsFor(date).map((group, index) => {
        const place = placement(group, index);
        return (
          <text
            key={index}
            x="0"
            y="0"
            dy={GEORGIA_OPTICAL_LIFT}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={FONT}
            fontSize={fontSize}
            fontWeight="700"
            fill={group.color}
            fillOpacity="0.9"
            stroke={PAPER}
            strokeWidth="3.8"
            strokeOpacity="0.94"
            paintOrder="stroke fill"
            transform={`translate(${place.x} ${place.y}) rotate(${place.angle}) scale(${place.scale})`}
          >
            {group.text}
          </text>
        );
      })}
    </>
  );
}
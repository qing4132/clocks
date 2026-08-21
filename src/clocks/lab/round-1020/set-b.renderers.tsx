import { ClassicFace, INK, PAPER, TAU, hsla, polar, shortestDifference, type RendererProps, type StudyRenderer } from "./shared";

function RgbSplit({ time }: RendererProps) {
  const split = 2.5 + 2.5 * Math.abs(Math.sin(time.second * TAU));
  const hands = [
    { fraction: time.hour, length: 50, width: 5 },
    { fraction: time.minute, length: 74, width: 3 },
    { fraction: time.second, length: 84, width: 1.5 },
  ];
  const channels = [
    { offset: -split, color: "#ff1744" },
    { offset: 0, color: "#00e676" },
    { offset: split, color: "#2979ff" },
  ];

  return (
    <>
      <circle r="96" fill="#050509" />
      <ClassicFace
        time={time}
        showFace={false}
        showHands={false}
        rimColor="#f5f5ef"
        tickColor={(index) => index % 5 === 0 ? "#f5f5ef" : "#777780"}
        numeralColor={() => "#f5f5ef"}
        after={(
          <g style={{ mixBlendMode: "screen" }}>
            {hands.flatMap((hand, handIndex) => {
              const tip = polar(hand.length, hand.fraction);
              const tail = polar(-10, hand.fraction);
              const normal = polar(1, hand.fraction + 0.25);
              return channels.map((channel) => (
                <line
                  key={`${handIndex}-${channel.color}`}
                  x1={tail.x + normal.x * channel.offset}
                  y1={tail.y + normal.y * channel.offset}
                  x2={tip.x + normal.x * channel.offset}
                  y2={tip.y + normal.y * channel.offset}
                  stroke={channel.color}
                  strokeWidth={hand.width}
                  strokeLinecap="round"
                  opacity="0.92"
                />
              ));
            })}
            <circle r="4" fill="#ffffff" />
          </g>
        )}
      />
    </>
  );
}

function CmykGhost({ time }: RendererProps) {
  const drift = 2.5 + Math.sin(time.second * TAU) * 2;
  const layers = [
    { transform: `translate(${-drift} 0) rotate(-1.5)`, color: "#00bcd4", opacity: 0.65 },
    { transform: `translate(${drift} 0) rotate(1.5)`, color: "#ed168c", opacity: 0.65 },
    { transform: `translate(0 ${drift}) rotate(-0.8)`, color: "#f5d000", opacity: 0.55 },
    { transform: "", color: INK, opacity: 0.72 },
  ];
  return (
    <>
      <circle r="96" fill={PAPER} />
      {layers.map((layer) => (
        <g key={layer.color} transform={layer.transform} style={{ mixBlendMode: "multiply" }}>
          <ClassicFace time={time} showFace={false} rimColor={layer.color} hourColor={layer.color} minuteColor={layer.color} secondColor={layer.color} tickColor={() => layer.color} numeralColor={() => layer.color} groupOpacity={layer.opacity} />
        </g>
      ))}
    </>
  );
}

function Complement({ time }: RendererProps) {
  const inverted = time.secondValue % 2 === 1;
  const background = inverted ? "#261447" : "#e9ff48";
  const foreground = inverted ? "#e9ff48" : "#261447";
  const accent = inverted ? "#00f5d4" : "#ff0a78";
  return <ClassicFace time={time} faceFill={background} rimColor={foreground} hourColor={foreground} minuteColor={foreground} secondColor={accent} tickColor={() => foreground} numeralColor={() => foreground} />;
}

function Spectrum({ time }: RendererProps) {
  const hue = time.second * 360;
  return (
    <>
      <defs>
        <linearGradient id="round1020-spectrum-hour" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hsla(hue)} />
          <stop offset="0.5" stopColor={hsla(hue + 120)} />
          <stop offset="1" stopColor={hsla(hue + 240)} />
        </linearGradient>
      </defs>
      <ClassicFace
        time={time}
        faceFill="#0c0620"
        rimColor={hsla(hue + 180)}
        hourColor="url(#round1020-spectrum-hour)"
        minuteColor={hsla(hue + 120)}
        secondColor={hsla(hue + 250)}
        tickColor={(index) => hsla(hue + index * 6)}
        numeralColor={(index) => hsla(hue + index * 30)}
      />
    </>
  );
}

function Neon({ time }: RendererProps) {
  return (
    <>
      <defs>
        <filter id="round1020-neon-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ClassicFace
        time={time}
        faceFill="#070018"
        rimColor="#00f5ff"
        hourColor="#ffea00"
        minuteColor="#00f5ff"
        secondColor="#ff2bd6"
        tickColor={(index) => index % 5 === 0 ? "#ff2bd6" : "#00f5ff"}
        numeralColor={(index) => index % 2 === 0 ? "#ffea00" : "#00f5ff"}
        groupStyle={{ filter: "url(#round1020-neon-glow)" }}
      />
    </>
  );
}

function Solarized({ time }: RendererProps) {
  const phase = Math.floor(time.second * 8);
  const palette = ["#ff0054", "#ffbd00", "#00d9c0", "#3a0ca3"];
  return (
    <>
      <circle r="96" fill={palette[(phase + 2) % 4]} />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={`M 0 0 L ${polar(96, index / 12).x} ${polar(96, index / 12).y} A 96 96 0 0 1 ${polar(96, (index + 1) / 12).x} ${polar(96, (index + 1) / 12).y} Z`}
          fill={palette[(index + phase) % 4]}
          opacity="0.78"
        />
      ))}
      <ClassicFace time={time} showFace={false} rimColor="#fffef4" hourColor="#fffef4" minuteColor="#111111" secondColor="#ffffff" tickColor={(index) => index % 5 === 0 ? "#fffef4" : "#111111"} numeralColor={() => "#111111"} />
    </>
  );
}

function HeatMap({ time }: RendererProps) {
  const sources = [time.hour, time.minute, time.second];
  function heatAt(fraction: number) {
    const distance = Math.min(...sources.map((source) => Math.abs(shortestDifference(fraction, source))));
    const heat = Math.max(0, 1 - distance / 0.18);
    return hsla(245 - heat * 245, 94, 42 + heat * 22);
  }
  return <ClassicFace time={time} faceFill="#09072a" rimColor="#5b21b6" hourColor="#fff3a3" minuteColor="#ff8a00" secondColor="#ff1744" tickColor={(index) => heatAt(index / 60)} numeralColor={(index) => heatAt(index / 12)} />;
}

function AcidWash({ time }: RendererProps) {
  const phase = time.second * 24;
  return (
    <>
      <defs>
        <radialGradient id="round1020-acid-gradient" cx={`${50 + Math.sin(time.second * TAU) * 30}%`} cy={`${50 + Math.cos(time.second * TAU) * 30}%`} r="72%">
          <stop offset="0" stopColor="#faff00" />
          <stop offset="0.35" stopColor="#ff1493" />
          <stop offset="0.7" stopColor="#00f5d4" />
          <stop offset="1" stopColor="#5b00ff" />
        </radialGradient>
        <filter id="round1020-acid-wobble" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={14 + phase / 3} xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </defs>
      <circle r="96" fill="url(#round1020-acid-gradient)" />
      <ClassicFace time={time} showFace={false} rimColor="#16002b" hourColor="#16002b" minuteColor="#001f3f" secondColor="#ffffff" tickColor={(index) => index % 5 === 0 ? "#16002b" : "#ffffff"} numeralColor={() => "#16002b"} groupStyle={{ filter: "url(#round1020-acid-wobble)" }} />
    </>
  );
}

function ColorEclipse({ time }: RendererProps) {
  const hour = polar(52, time.hour);
  const minute = polar(52, time.minute);
  return (
    <>
      <defs><clipPath id="round1020-eclipse-clip"><circle r="96" /></clipPath></defs>
      <g clipPath="url(#round1020-eclipse-clip)" style={{ mixBlendMode: "multiply" }}>
        <circle r="96" fill="#fff7d1" />
        <circle cx={hour.x} cy={hour.y} r="70" fill="#ff296d" opacity="0.78" />
        <circle cx={minute.x} cy={minute.y} r="70" fill="#00c2ff" opacity="0.78" />
      </g>
      <ClassicFace time={time} showFace={false} rimColor={INK} hourColor={INK} minuteColor={INK} secondColor="#fff" tickColor={() => INK} numeralColor={() => INK} />
    </>
  );
}

function ChromaticAberration({ time }: RendererProps) {
  const shift = 2 + 4 * Math.abs(Math.sin(time.second * TAU));
  const layers = [
    { dx: -shift, color: "#ff004c" },
    { dx: 0, color: "#00ff85" },
    { dx: shift, color: "#0066ff" },
  ];
  return (
    <>
      <circle r="96" fill="#050505" />
      {layers.map((layer) => (
        <g key={layer.color} transform={`translate(${layer.dx} 0)`} style={{ mixBlendMode: "screen" }}>
          <ClassicFace time={time} showFace={false} rimColor={layer.color} hourColor={layer.color} minuteColor={layer.color} secondColor={layer.color} tickColor={() => layer.color} numeralColor={() => layer.color} groupOpacity={0.72} />
        </g>
      ))}
    </>
  );
}

export const setBRenderers: Record<number, StudyRenderer> = {
  1030: RgbSplit,
  1031: CmykGhost,
  1032: Complement,
  1033: Spectrum,
  1034: Neon,
  1035: Solarized,
  1036: HeatMap,
  1037: AcidWash,
  1038: ColorEclipse,
  1039: ChromaticAberration,
};

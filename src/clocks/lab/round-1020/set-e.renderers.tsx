import { ClassicFace, INK, RED, SERIF, TAU, hsla, pathThrough, polar, type PointMap, type RendererProps, type StudyRenderer } from "./shared";

function spiralHand(fraction: number, length: number, curl: number) {
  return pathThrough(Array.from({ length: 25 }, (_, index) => {
    const progress = index / 24;
    const radius = -10 + (length + 10) * progress;
    const twist = curl * Math.sin(Math.PI * progress) * (1 - progress * 0.25);
    return polar(radius, fraction + twist);
  }));
}

function VortexHands({ time }: RendererProps) {
  const phase = Math.sin(time.second * TAU) * 0.045;
  return (
    <ClassicFace
      time={time}
      faceFill="#10031d"
      rimColor="#f0abfc"
      tickColor={(index) => hsla(285 + index * 5, 80, 67, 0.58)}
      numeralColor={(index) => hsla(250 + index * 12, 88, 73)}
      showHands={false}
      after={(
        <>
          <path d={spiralHand(time.hour, 50, 0.15 + phase)} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <path d={spiralHand(time.minute, 74, -0.12 - phase)} fill="none" stroke="#6fffe9" strokeWidth="3" strokeLinecap="round" />
          <path d={spiralHand(time.second, 84, 0.09 + phase)} fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" />
          <circle r="4" fill="#fff" />
        </>
      )}
    />
  );
}

function MeltingNumerals({ time }: RendererProps) {
  const phase = time.second * TAU;
  return (
    <ClassicFace
      time={time}
      faceFill="#fff1d6"
      rimColor="#54124f"
      hourColor="#54124f"
      minuteColor="#007f73"
      secondColor="#ff1744"
      tickColor={(index) => hsla(315 + index * 3, 65, 34)}
      showNumerals={false}
      after={(
        <>
          {Array.from({ length: 12 }, (_, index) => {
            const point = polar(69, index / 12);
            const melt = 4 + 11 * (0.5 + 0.5 * Math.sin(phase - index * 0.7));
            return (
              <g key={index} transform={`translate(${point.x} ${point.y}) scale(1 ${1 + melt / 20})`}>
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="14" fontWeight="700" fill={hsla(305 + index * 18, 78, 34)}>{index || 12}</text>
                <line x1="0" y1="6" x2="0" y2={6 + melt} stroke={hsla(305 + index * 18, 78, 34)} strokeWidth="1.5" strokeLinecap="round" />
              </g>
            );
          })}
        </>
      )}
    />
  );
}

function prismRay(fraction: number, length: number, width: number, colors: string[]) {
  const target = polar(length, fraction);
  const entry = polar(14, fraction);
  const perpendicular = polar(1, fraction + 0.25);
  return (
    <g>
      <line x1="0" y1="0" x2={entry.x} y2={entry.y} stroke="#ffffff" strokeWidth={width} strokeLinecap="round" />
      {colors.map((color, index) => {
        const offset = index - (colors.length - 1) / 2;
        return <line key={color} x1={entry.x + perpendicular.x * offset * 2} y1={entry.y + perpendicular.y * offset * 2} x2={target.x + perpendicular.x * offset * 2.5} y2={target.y + perpendicular.y * offset * 2.5} stroke={color} strokeWidth={width / 2} strokeLinecap="round" opacity="0.85" />;
      })}
    </g>
  );
}

function PrismCore({ time }: RendererProps) {
  return (
    <ClassicFace
      time={time}
      faceFill="#070812"
      rimColor="#d8fbff"
      tickColor={(index) => hsla(190 + index * 4, 82, 72, 0.55)}
      numeralColor={() => "#ffffff"}
      showHands={false}
      after={(
        <>
          {prismRay(time.hour, 50, 5, ["#ff3168", "#ffe53d", "#00e5ff"])}
          {prismRay(time.minute, 74, 3, ["#ff00a8", "#54ffbd", "#4385ff"])}
          {prismRay(time.second, 84, 1.8, ["#ff1744", "#ffffff", "#00e5ff"])}
          <path d="M 0 -16 L 14 0 L 0 16 L -14 0 Z" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeWidth="1.2" />
        </>
      )}
    />
  );
}

function sectorPath(index: number) {
  const start = polar(96, index / 12);
  const end = polar(96, (index + 1) / 12);
  return `M 0 0 L ${start.x} ${start.y} A 96 96 0 0 1 ${end.x} ${end.y} Z`;
}

function FragmentedFace({ time }: RendererProps) {
  return (
    <>
      <defs>
        {Array.from({ length: 12 }, (_, index) => <clipPath key={index} id={`round1020-fragment-${index}`}><path d={sectorPath(index)} /></clipPath>)}
      </defs>
      <circle r="97" fill="#0b0515" />
      {Array.from({ length: 12 }, (_, index) => {
        const phase = time.second * TAU + index * 0.9;
        const rotation = Math.sin(phase) * 8;
        const scale = 0.9 + 0.12 * Math.cos(phase * 1.3);
        return (
          <g key={index} clipPath={`url(#round1020-fragment-${index})`} transform={`rotate(${rotation}) scale(${scale})`}>
            <ClassicFace time={time} faceFill={hsla(index * 30 + time.second * 120, 88, 62)} rimColor="#ffffff" hourColor="#111111" minuteColor="#111111" secondColor="#ffffff" tickColor={() => "#111111"} numeralColor={() => "#111111"} />
          </g>
        );
      })}
      <circle r="4" fill="#fff" />
    </>
  );
}

function MoireHalo({ time }: RendererProps) {
  return (
    <>
      <circle r="97" fill="#f7ffef" />
      <defs><clipPath id="round1020-moire-ring"><path d="M -98 -98 H 98 V 98 H -98 Z M 0 -66 A 66 66 0 1 0 0 66 A 66 66 0 1 0 0 -66 Z" fillRule="evenodd" /></clipPath></defs>
      <g clipPath="url(#round1020-moire-ring)">
        {[1, -1].map((direction, layer) => (
          <g key={direction} transform={`rotate(${direction * time.second * 72})`} opacity="0.62">
            {Array.from({ length: 120 }, (_, index) => {
              const start = polar(62, index / 120);
              const end = polar(100, index / 120 + direction * 0.018);
              return <line key={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={layer === 0 ? "#5b21b6" : "#00a6a6"} strokeWidth="0.65" />;
            })}
          </g>
        ))}
      </g>
      <ClassicFace time={time} showFace={false} rimColor={INK} hourColor={INK} minuteColor={INK} secondColor={RED} tickColor={() => INK} numeralColor={() => INK} />
    </>
  );
}

function MagneticNumerals({ time }: RendererProps) {
  const magnet = polar(58, time.second);
  return (
    <ClassicFace
      time={time}
      faceFill="#f5efff"
      rimColor="#3b0764"
      tickColor={(index) => hsla(270 + index * 4, 68, 42, 0.45)}
      showNumerals={false}
      hourColor="#3b0764"
      minuteColor="#0e7490"
      secondColor={RED}
      after={(
        <>
          {Array.from({ length: 12 }, (_, index) => {
            const anchor = polar(70, index / 12);
            const distance = Math.hypot(anchor.x - magnet.x, anchor.y - magnet.y);
            const pull = Math.pow(Math.max(0, 1 - distance / 100), 2) * 34;
            const length = Math.hypot(magnet.x - anchor.x, magnet.y - anchor.y) || 1;
            const x = anchor.x + (magnet.x - anchor.x) / length * pull;
            const y = anchor.y + (magnet.y - anchor.y) / length * pull;
            const orbit = time.second * TAU * 4 + index;
            return <text key={index} x={x + Math.cos(orbit) * 3} y={y + Math.sin(orbit) * 3} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="14" fontWeight="700" fill={hsla(275 + index * 17, 78, 36)}>{index || 12}</text>;
          })}
          <circle cx={magnet.x} cy={magnet.y} r="7" fill="none" stroke={RED} strokeWidth="2" />
        </>
      )}
    />
  );
}

function sineHand(fraction: number, length: number, amplitude: number, waves: number) {
  const angle = fraction * TAU - Math.PI / 2;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const normal = { x: -direction.y, y: direction.x };
  return pathThrough(Array.from({ length: 33 }, (_, index) => {
    const progress = index / 32;
    const distance = -10 + (length + 10) * progress;
    const offset = Math.sin(progress * Math.PI * waves) * Math.sin(Math.PI * progress) * amplitude;
    return { x: direction.x * distance + normal.x * offset, y: direction.y * distance + normal.y * offset };
  }));
}

function SineHands({ time }: RendererProps) {
  const phase = Math.sin(time.second * TAU);
  return (
    <ClassicFace
      time={time}
      faceFill="#e9fff8"
      rimColor="#064e3b"
      tickColor={(index) => hsla(150 + index * 4, 70, 34)}
      numeralColor={() => "#064e3b"}
      showHands={false}
      after={(
        <>
          <path d={sineHand(time.hour, 50, 8 + phase * 3, 3)} fill="none" stroke="#064e3b" strokeWidth="5" strokeLinecap="round" />
          <path d={sineHand(time.minute, 74, 7 - phase * 2, 5)} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
          <path d={sineHand(time.second, 84, 5 + phase * 2, 8)} fill="none" stroke={RED} strokeWidth="1.6" strokeLinecap="round" />
          <circle r="4" fill={INK} />
        </>
      )}
    />
  );
}

function Polarized({ time }: RendererProps) {
  const rotation = time.second * 360;
  return (
    <>
      <circle r="96" fill="#0d0720" />
      {Array.from({ length: 12 }, (_, index) => (
        <path key={index} d={sectorPath(index)} fill={hsla(index * 30 + rotation, 82, index % 2 === 0 ? 62 : 32)} opacity="0.82" />
      ))}
      <g transform={`rotate(${rotation})`} opacity="0.72" style={{ mixBlendMode: "screen" }}>
        <path d="M 0 -96 A 96 96 0 0 1 0 96 L 0 -96 Z" fill="#32ffe0" />
      </g>
      <ClassicFace time={time} showFace={false} rimColor="#ffffff" hourColor="#ffffff" minuteColor="#111111" secondColor={RED} tickColor={(index) => index % 5 === 0 ? "#ffffff" : "#111111"} numeralColor={(index) => index % 2 === 0 ? "#ffffff" : "#111111"} />
    </>
  );
}

function Hallucination({ time }: RendererProps) {
  const rings = [
    { radius: 55, direction: 1, hue: 310, opacity: 0.42 },
    { radius: 69, direction: -1, hue: 180, opacity: 0.58 },
    { radius: 80, direction: 1, hue: 55, opacity: 0.72 },
  ];
  return (
    <ClassicFace
      time={time}
      faceFill="#12031c"
      rimColor="#ffffff"
      showNumerals={false}
      tickColor={(index) => hsla(index * 6 + time.second * 240, 90, 63, 0.58)}
      hourColor="#ffffff"
      minuteColor="#7fffd4"
      secondColor={RED}
      after={(
        <>
          {rings.flatMap((ring, ringIndex) => Array.from({ length: 12 }, (_, index) => {
            const wobble = Math.sin(time.second * TAU * (ringIndex + 1) + index) * 0.025;
            const point = polar(ring.radius, index / 12 + wobble * ring.direction);
            return <text key={`${ringIndex}-${index}`} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize={9 + ringIndex * 2} fill={hsla(ring.hue + index * 18)} opacity={ring.opacity}>{index || 12}</text>;
          }))}
        </>
      )}
    />
  );
}

function Psychedelic001({ time }: RendererProps) {
  const phase = time.second * TAU;
  const pulse = 0.92 + 0.08 * Math.sin(phase * 3);
  const map: PointMap = (radius, fraction) => {
    const wave = Math.sin(fraction * TAU * 7 - phase * 2) * 7 * Math.pow(Math.abs(radius) / 96, 1.8);
    return polar(radius * pulse + wave, fraction + 0.035 * Math.sin(radius / 12 + phase));
  };
  const ghostMaps = [-0.014, 0.014];
  return (
    <>
      <circle r="98" fill="#090014" />
      {ghostMaps.map((offset, index) => (
        <g key={offset} transform={`translate(${index === 0 ? -3 : 3} ${index === 0 ? 2 : -2})`} style={{ mixBlendMode: "screen" }}>
          <ClassicFace time={time} map={(radius, fraction) => map(radius, fraction + offset)} faceFill="transparent" rimColor={index === 0 ? "#ff2ca8" : "#00e7ff"} hourColor={index === 0 ? "#ff2ca8" : "#00e7ff"} minuteColor={index === 0 ? "#ffe600" : "#8b5cff"} secondColor={index === 0 ? "#ff5a00" : "#00ff9d"} tickColor={(tick) => hsla(tick * 6 + time.second * 360 + index * 120)} numeralColor={(numeral) => hsla(numeral * 30 + time.second * 240 + index * 90)} groupOpacity={0.66} />
        </g>
      ))}
      <ClassicFace time={time} map={map} showFace={false} rimColor="#ffffff" hourColor="#ffffff" minuteColor="#e9ff4a" secondColor={RED} tickColor={(index) => hsla(index * 6 + time.second * 360)} numeralColor={(index) => hsla(index * 30 + time.second * 180, 95, 72)} groupOpacity={0.92} />
    </>
  );
}

export const setERenderers: Record<number, StudyRenderer> = {
  1060: VortexHands,
  1061: MeltingNumerals,
  1062: PrismCore,
  1063: FragmentedFace,
  1064: MoireHalo,
  1065: MagneticNumerals,
  1066: SineHands,
  1067: Polarized,
  1068: Hallucination,
  1069: Psychedelic001,
};

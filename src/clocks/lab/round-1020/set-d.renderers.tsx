import { ClassicFace, INK, RED, TAU, hsla, polar, shortestDifference, type PointMap, type RendererProps, type StudyRenderer } from "./shared";

function StrobeSecond({ time }: RendererProps) {
  const phase = time.ms / 1000;
  const flash = Math.exp(-phase * 13);
  const hue = time.secondValue * 23;
  return (
    <>
      <circle r="96" fill="#101018" />
      <circle r={94 - flash * 8} fill={hsla(hue, 95, 57)} opacity={0.18 + flash * 0.72} />
      <ClassicFace time={time} showFace={false} rimColor={flash > 0.35 ? "#ffffff" : hsla(hue + 180)} hourColor="#ffffff" minuteColor="#e5e5e5" secondColor={hsla(hue + 90)} tickColor={(index) => index === time.secondValue ? "#ffffff" : hsla(hue + index * 4, 90, 64, 0.72)} numeralColor={() => "#ffffff"} />
    </>
  );
}

function NumeralWave({ time }: RendererProps) {
  return (
    <ClassicFace
      time={time}
      faceFill="#13071f"
      rimColor="#ff98f0"
      tickColor={(index) => hsla(285 + index * 4, 80, 65, 0.5)}
      showNumerals={false}
      hourColor="#ffffff"
      minuteColor="#8cf8ff"
      secondColor="#ff3c7d"
      after={(
        <>
          {Array.from({ length: 12 }, (_, index) => {
            const distance = Math.abs(shortestDifference(index / 12, time.second));
            const wave = Math.exp(-Math.pow(distance / 0.11, 2));
            const point = polar(67 - wave * 8, index / 12);
            const scale = 1 + wave * 1.25;
            return (
              <text key={index} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily="Georgia, serif" fontSize={14 * scale} fontWeight={wave > 0.3 ? 700 : 400} fill={hsla(300 + index * 22 + wave * 80, 90, 68)}>{index || 12}</text>
            );
          })}
        </>
      )}
    />
  );
}

function TickPulse({ time }: RendererProps) {
  return (
    <ClassicFace
      time={time}
      faceFill="#f4fffb"
      rimColor="#052e2b"
      showTicks={false}
      hourColor="#052e2b"
      minuteColor="#0f766e"
      secondColor="#ff145b"
      numeralColor={() => "#052e2b"}
      before={(
        <>
          {Array.from({ length: 60 }, (_, index) => {
            const distance = Math.abs(shortestDifference(index / 60, time.second));
            const pulse = Math.exp(-Math.pow(distance / 0.055, 2));
            const inner = polar(88 - pulse * 27, index / 60);
            const outer = polar(93 + pulse * 4, index / 60);
            return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={pulse > 0.15 ? hsla(330 + pulse * 70) : INK} strokeWidth={0.8 + pulse * 5} strokeLinecap="round" />;
          })}
        </>
      )}
    />
  );
}

function AlternatingReality({ time }: RendererProps) {
  const alternate = time.ms >= 500;
  return (
    <ClassicFace
      time={time}
      faceFill={alternate ? "#17102e" : "#f8ff71"}
      rimColor={alternate ? "#f8ff71" : "#17102e"}
      hourColor={alternate ? "#ffffff" : "#17102e"}
      minuteColor={alternate ? "#40ffe0" : "#5b21b6"}
      secondColor={alternate ? "#ff4fd8" : "#ff1744"}
      tickColor={(index) => alternate ? hsla(170 + index * 4, 95, 66) : hsla(270 + index * 4, 80, 32)}
      numeralColor={(index) => alternate ? (index % 2 ? "#40ffe0" : "#ffffff") : (index % 2 ? "#5b21b6" : "#17102e")}
    />
  );
}

function handLine(fraction: number, length: number, color: string, width: number, opacity = 1) {
  const tip = polar(length, fraction);
  const tail = polar(-10, fraction);
  return <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
}

function FrameSkip({ time }: RendererProps) {
  const frame = Math.floor(time.ms / 333.334);
  const offset = [-0.0075, 0.005, -0.002][Math.min(2, frame)];
  return (
    <ClassicFace
      time={time}
      faceFill="#fff1f8"
      rimColor="#4a044e"
      tickColor={(index) => index % 5 === 0 ? "#4a044e" : "#d946ef"}
      numeralColor={() => "#4a044e"}
      showHands={false}
      after={(
        <>
          {handLine(time.hour, 50, INK, 5)}
          {handLine(time.minute, 74, INK, 3)}
          {[-0.012, 0, 0.012].map((ghost, index) => <g key={ghost}>{handLine(time.second + ghost, 84, hsla(325 + index * 35), 1.2, 0.25)}</g>)}
          {handLine(time.second + offset, 84, RED, 2.2)}
          <circle r="4" fill={INK} />
        </>
      )}
    />
  );
}

function Flashback({ time }: RendererProps) {
  const phase = time.ms / 1000;
  const previous = (time.secondValue - 1 + 60) / 60;
  const flash = Math.exp(-phase * 8);
  return (
    <ClassicFace
      time={time}
      faceFill="#f4f0ff"
      rimColor="#312e81"
      hourColor="#312e81"
      minuteColor="#5b21b6"
      secondColor={RED}
      tickColor={(index) => index === (time.secondValue + 59) % 60 ? hsla(290, 90, 55, flash) : "#8b8b95"}
      numeralColor={() => "#312e81"}
      after={<g>{handLine(previous, 84, "#d946ef", 5 * flash + 0.5, flash * 0.8)}</g>}
    />
  );
}

function LightningDial({ time }: RendererProps) {
  const points = Array.from({ length: 13 }, (_, index) => {
    const radius = index / 12 * 84;
    const wobble = index === 0 || index === 12 ? 0 : (index % 2 === 0 ? 1 : -1) * 5;
    const base = polar(radius, time.second);
    const perpendicular = polar(wobble, time.second + 0.25);
    return { x: base.x + perpendicular.x, y: base.y + perpendicular.y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const active = time.secondValue;
  return (
    <ClassicFace
      time={time}
      faceFill="#080613"
      rimColor="#f8f000"
      hourColor="#ffffff"
      minuteColor="#8cf8ff"
      secondColor="transparent"
      tickColor={(index) => index === active ? "#ffffff" : index % 5 === 0 ? "#f8f000" : "#5a5680"}
      numeralColor={() => "#ffffff"}
      after={(
        <>
          <path d={path} fill="none" stroke="#f8f000" strokeWidth="3" strokeLinejoin="miter" />
          <path d={path} fill="none" stroke="#ffffff" strokeWidth="1" />
        </>
      )}
    />
  );
}

function BreathingFace({ time }: RendererProps) {
  const pulse = 0.87 + 0.13 * (0.5 + 0.5 * Math.sin(time.ms / 1000 * TAU - Math.PI / 2));
  const map: PointMap = (radius, fraction) => polar(radius * pulse, fraction + (1 - pulse) * 0.06 * Math.sin(fraction * TAU * 4));
  return (
    <>
      <circle r="96" fill="#170b26" />
      <ClassicFace time={time} map={map} faceFill="#fdf2ff" rimColor="#a21caf" hourColor="#581c87" minuteColor="#0e7490" secondColor="#f43f5e" tickColor={(index) => hsla(280 + index * 5)} numeralColor={(index) => hsla(255 + index * 9, 72, 36)} />
    </>
  );
}

function ColorBeat({ time }: RendererProps) {
  const beat = Math.min(3, Math.floor(time.ms / 250));
  const backgrounds = ["#ff4fa3", "#ffed4a", "#3ee8c4", "#7757ff"];
  const foregrounds = ["#19001a", "#321900", "#00251e", "#ffffff"];
  return <ClassicFace time={time} faceFill={backgrounds[beat]} rimColor={foregrounds[beat]} hourColor={foregrounds[beat]} minuteColor={foregrounds[beat]} secondColor={beat % 2 ? "#ff1744" : "#ffffff"} tickColor={(index) => index % 5 === 0 ? foregrounds[beat] : hsla(beat * 90 + index * 4, 85, 35)} numeralColor={() => foregrounds[beat]} />;
}

function AfterimageBurst({ time }: RendererProps) {
  const phase = time.ms / 1000;
  const burst = Math.pow(1 - phase, 2);
  return (
    <ClassicFace
      time={time}
      faceFill="#10051d"
      rimColor="#ffffff"
      tickColor={(index) => hsla(index * 6 + time.second * 360, 90, 65, 0.62)}
      numeralColor={() => "#ffffff"}
      hourColor="#ffffff"
      minuteColor="#9cf7ff"
      secondColor={RED}
      before={(
        <>
          {Array.from({ length: 18 }, (_, index) => {
            const spread = (index - 8.5) * burst * 0.012;
            const inner = polar(25 + index * 1.8 * burst, time.second + spread);
            const outer = polar(91, time.second + spread);
            return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={hsla(index * 24 + time.secondValue * 13)} strokeWidth={1 + burst * 3} opacity={burst * 0.75} />;
          })}
        </>
      )}
    />
  );
}

export const setDRenderers: Record<number, StudyRenderer> = {
  1050: StrobeSecond,
  1051: NumeralWave,
  1052: TickPulse,
  1053: AlternatingReality,
  1054: FrameSkip,
  1055: Flashback,
  1056: LightningDial,
  1057: BreathingFace,
  1058: ColorBeat,
  1059: AfterimageBurst,
};

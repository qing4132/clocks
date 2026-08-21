import { ClassicFace, INK, RED, SERIF, TAU, hsla, polar, type RendererProps, type StudyRenderer } from "./shared";

function handLine(fraction: number, length: number, color: string, width: number, opacity = 1) {
  const tip = polar(length, fraction);
  const tail = polar(-10, fraction);
  return <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
}

function EchoHands({ time }: RendererProps) {
  const hands = [
    { fraction: time.hour, length: 50, width: 5, hue: 285, speed: 1 / 720 },
    { fraction: time.minute, length: 74, width: 3, hue: 185, speed: 1 / 60 },
    { fraction: time.second, length: 84, width: 1.5, hue: 345, speed: 1 },
  ];
  return (
    <ClassicFace
      time={time}
      faceFill="#10051f"
      rimColor="#b8fff9"
      tickColor={(index) => hsla(180 + index * 4, 82, 65, 0.6)}
      numeralColor={(index) => hsla(275 + index * 8, 88, 72)}
      showHands={false}
      after={(
        <>
          {hands.flatMap((hand, handIndex) => Array.from({ length: 10 }, (_, age) => {
            const fraction = hand.fraction - age * 0.012 * hand.speed;
            return <g key={`${handIndex}-${age}`}>{handLine(fraction, hand.length, hsla(hand.hue + age * 12), hand.width, 1 - age * 0.085)}</g>;
          }))}
          <circle r="4" fill="#ffffff" />
        </>
      )}
    />
  );
}

function ClockTunnel({ time }: RendererProps) {
  const pulse = time.second * 24;
  return (
    <>
      <circle r="98" fill="#080014" />
      {Array.from({ length: 6 }, (_, index) => {
        const scale = 1 - index * 0.135;
        const rotation = pulse * (index % 2 === 0 ? 1 : -1) + index * 8;
        const hue = 280 + index * 38;
        return (
          <g key={index} transform={`rotate(${rotation}) scale(${scale})`} opacity={0.92 - index * 0.09}>
            <ClassicFace time={time} faceFill={index === 5 ? "#110021" : "transparent"} rimColor={hsla(hue)} hourColor={hsla(hue + 30)} minuteColor={hsla(hue + 90)} secondColor={hsla(hue + 180)} tickColor={() => hsla(hue)} numeralColor={() => hsla(hue + 45)} />
          </g>
        );
      })}
    </>
  );
}

function Kaleidoscope({ time }: RendererProps) {
  const hour = polar(48, time.hour);
  const minute = polar(68, time.minute);
  const second = polar(82, time.second);
  return (
    <>
      <circle r="96" fill="#120522" stroke="#f5e7ff" strokeWidth="2" />
      {Array.from({ length: 6 }, (_, index) => (
        <g key={index} transform={`rotate(${index * 60}) scale(${index % 2 === 0 ? 1 : -1} 1)`} opacity="0.55" style={{ mixBlendMode: "screen" }}>
          <line x1="0" y1="0" x2={hour.x} y2={hour.y} stroke={hsla(index * 60 + 20)} strokeWidth="5" />
          <line x1="0" y1="0" x2={minute.x} y2={minute.y} stroke={hsla(index * 60 + 130)} strokeWidth="3" />
          <line x1="0" y1="0" x2={second.x} y2={second.y} stroke={hsla(index * 60 + 240)} strokeWidth="1.5" />
        </g>
      ))}
      <ClassicFace time={time} showFace={false} rimColor="#fff" hourColor="#fff" minuteColor="#d8d8d8" secondColor={RED} tickColor={(index) => hsla(index * 6 + time.second * 360)} numeralColor={() => "#fff"} />
    </>
  );
}

function DoubleVision({ time }: RendererProps) {
  const separation = 4 + 8 * Math.abs(Math.sin(time.second * TAU));
  return (
    <>
      <circle r="97" fill="#080816" />
      <g transform={`translate(${-separation} 0)`} style={{ mixBlendMode: "screen" }}>
        <ClassicFace time={time} showFace={false} rimColor="#ff2fa8" hourColor="#ff2fa8" minuteColor="#ff2fa8" secondColor="#ff2fa8" tickColor={() => "#ff2fa8"} numeralColor={() => "#ff2fa8"} groupOpacity={0.78} />
      </g>
      <g transform={`translate(${separation} 0)`} style={{ mixBlendMode: "screen" }}>
        <ClassicFace time={time} showFace={false} rimColor="#28e7ff" hourColor="#28e7ff" minuteColor="#28e7ff" secondColor="#28e7ff" tickColor={() => "#28e7ff"} numeralColor={() => "#28e7ff"} groupOpacity={0.78} />
      </g>
    </>
  );
}

function MiniFace({ x, y, rotation, time, hue }: { x: number; y: number; rotation: number; time: RendererProps["time"]; hue: number }) {
  const hour = polar(9, time.hour);
  const minute = polar(13, time.minute);
  const second = polar(15, time.second);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <circle r="17" fill="#100720" stroke={hsla(hue)} strokeWidth="1" />
      <line x1="0" y1="0" x2={hour.x} y2={hour.y} stroke="#fff" strokeWidth="1.5" />
      <line x1="0" y1="0" x2={minute.x} y2={minute.y} stroke={hsla(hue + 120)} strokeWidth="1" />
      <line x1="0" y1="0" x2={second.x} y2={second.y} stroke={RED} strokeWidth="0.7" />
    </g>
  );
}

function OrbitingFaces({ time }: RendererProps) {
  return (
    <>
      <circle r="97" fill="#090313" />
      {Array.from({ length: 12 }, (_, index) => {
        const point = polar(72, index / 12 + time.second * 0.04);
        return <MiniFace key={index} x={point.x} y={point.y} rotation={index * 30 + time.second * 90} time={time} hue={index * 30 + time.second * 360} />;
      })}
      <g transform="scale(0.48)">
        <ClassicFace time={time} faceFill="#fafaf7" rimColor={INK} />
      </g>
    </>
  );
}

function PhaseChoir({ time }: RendererProps) {
  return (
    <ClassicFace
      time={time}
      faceFill="#fff7fb"
      tickColor={(index) => hsla(300 + index * 5, 70, 42, 0.45)}
      numeralColor={() => INK}
      showHands={false}
      after={(
        <>
          {Array.from({ length: 12 }, (_, index) => {
            const offset = index / 12;
            return (
              <g key={index} opacity={0.16 + index * 0.025}>
                {handLine(time.hour + offset, 42, hsla(index * 30 + 260), 2.5)}
                {handLine(time.minute + offset, 61, hsla(index * 30 + 160), 1.6)}
                {handLine(time.second + offset, 79, hsla(index * 30 + 340), 0.8)}
              </g>
            );
          })}
          {handLine(time.hour, 50, INK, 5)}
          {handLine(time.minute, 74, INK, 3)}
          {handLine(time.second, 84, RED, 1.5)}
          <circle r="4" fill={INK} />
        </>
      )}
    />
  );
}

function PersistenceFan({ time }: RendererProps) {
  const trail = Array.from({ length: 16 }, (_, index) => index).reverse();
  return (
    <ClassicFace
      time={time}
      faceFill="#071627"
      rimColor="#c7f9ff"
      tickColor={(index) => hsla(180 + index * 3, 72, 65, 0.55)}
      numeralColor={() => "#e8fdff"}
      showHands={false}
      after={(
        <>
          {trail.flatMap((age) => {
            const opacity = 0.05 + (16 - age) * 0.035;
            return [
              <g key={`h-${age}`}>{handLine(time.hour - age / 7200, 50, "#ffe66d", 5, opacity)}</g>,
              <g key={`m-${age}`}>{handLine(time.minute - age / 600, 74, "#4ef5ff", 3, opacity)}</g>,
              <g key={`s-${age}`}>{handLine(time.second - age / 120, 84, "#ff3c8e", 1.5, opacity)}</g>,
            ];
          })}
          <circle r="4" fill="#fff" />
        </>
      )}
    />
  );
}

function sectorPath(index: number, radius = 96) {
  const start = polar(radius, index / 12);
  const end = polar(radius, (index + 1) / 12);
  return `M 0 0 L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`;
}

function ShutterWheel({ time }: RendererProps) {
  const rotation = 8 + 12 * Math.sin(time.second * TAU);
  return (
    <>
      <defs>
        {Array.from({ length: 12 }, (_, index) => <clipPath key={index} id={`round1020-shutter-${index}`}><path d={sectorPath(index)} /></clipPath>)}
      </defs>
      <circle r="96" fill="#0b0614" />
      {Array.from({ length: 12 }, (_, index) => (
        <g key={index} clipPath={`url(#round1020-shutter-${index})`} transform={`rotate(${index % 2 === 0 ? rotation : -rotation})`}>
          <ClassicFace time={time} faceFill={index % 2 === 0 ? "#eaff00" : "#ff3dad"} rimColor={INK} hourColor={INK} minuteColor={INK} secondColor="#fff" tickColor={() => INK} numeralColor={() => INK} />
        </g>
      ))}
      <circle r="4" fill={INK} />
    </>
  );
}

function ClockBloom({ time }: RendererProps) {
  const hour = polar(48, time.hour);
  const minute = polar(70, time.minute);
  return (
    <ClassicFace
      time={time}
      faceFill="#13051d"
      rimColor="#ffd6ff"
      tickColor={(index) => hsla(290 + index * 4, 80, 66, 0.55)}
      numeralColor={() => "#fff"}
      showHands={false}
      after={(
        <>
          {Array.from({ length: 12 }, (_, index) => (
            <g key={index} transform={`rotate(${index * 30 + time.second * 30})`} opacity="0.42" style={{ mixBlendMode: "screen" }}>
              <path d={`M 0 0 Q ${hour.x * 0.7 + 10} ${hour.y * 0.7} ${minute.x} ${minute.y}`} fill="none" stroke={hsla(index * 30 + 300)} strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
          {handLine(time.hour, 50, "#fff", 5)}
          {handLine(time.minute, 74, "#fff", 3)}
          {handLine(time.second, 84, RED, 1.5)}
          <circle r="4" fill="#fff" />
        </>
      )}
    />
  );
}

function InfiniteTwelve({ time }: RendererProps) {
  return (
    <ClassicFace
      time={time}
      faceFill="#f8ecff"
      rimColor="#4a044e"
      hourColor="#4a044e"
      minuteColor="#6d28d9"
      secondColor="#f43f5e"
      tickColor={(index) => hsla(280 + index * 4, 68, 38)}
      numeralColor={() => "#4a044e"}
      before={(
        <>
          {Array.from({ length: 24 }, (_, index) => {
            const progress = index / 24;
            const point = polar(8 + progress * 55, progress * 2.4 + time.second * 0.12);
            return <text key={index} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize={4 + progress * 13} fontWeight="700" fill={hsla(285 + index * 14, 75, 38)} opacity={0.25 + progress * 0.62}>12</text>;
          })}
        </>
      )}
    />
  );
}

export const setCRenderers: Record<number, StudyRenderer> = {
  1040: EchoHands,
  1041: ClockTunnel,
  1042: Kaleidoscope,
  1043: DoubleVision,
  1044: OrbitingFaces,
  1045: PhaseChoir,
  1046: PersistenceFan,
  1047: ShutterWheel,
  1048: ClockBloom,
  1049: InfiniteTwelve,
};

import { ClassicFace, TAU, clamp, polar, type PointMap, type RendererProps, type StudyRenderer } from "./shared";

function Melt({ time }: RendererProps) {
  const phase = time.second * TAU;
  const map: PointMap = (radius, fraction) => {
    const point = polar(radius, fraction);
    const depth = Math.pow(clamp((point.y + 96) / 192), 1.65);
    const drip = depth * (13 + 8 * Math.sin(phase + point.x / 17));
    return { x: point.x + depth * 4 * Math.sin(phase * 1.3 + point.y / 15), y: point.y + drip };
  };
  return <ClassicFace time={time} map={map} faceFill="#fff4d6" rimColor="#4d154f" hourColor="#4d154f" minuteColor="#006f78" secondColor="#ff3b30" tickColor={(index) => `hsl(${315 + index * 2} 65% 30%)`} numeralColor={(index) => `hsl(${300 + index * 7} 70% 28%)`} />;
}

function Fisheye({ time }: RendererProps) {
  const lens = polar(50, time.second);
  const map: PointMap = (radius, fraction) => {
    const point = polar(radius, fraction);
    const dx = point.x - lens.x;
    const dy = point.y - lens.y;
    const distance = Math.hypot(dx, dy);
    const force = Math.pow(clamp(1 - distance / 78), 2) * 0.9;
    return { x: point.x + dx * force, y: point.y + dy * force };
  };
  return (
    <ClassicFace
      time={time}
      map={map}
      faceFill="#e7f7ff"
      rimColor="#172554"
      hourColor="#172554"
      minuteColor="#004f6e"
      secondColor="#ff1744"
      after={<circle cx={lens.x} cy={lens.y} r="25" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" />}
    />
  );
}

function Corkscrew({ time }: RendererProps) {
  const phase = Math.sin(time.second * TAU) * 0.075;
  const map: PointMap = (radius, fraction) => {
    const twist = (1 - radius / 110) * 0.28 + phase * (radius / 96);
    return polar(radius, fraction + twist);
  };
  return <ClassicFace time={time} map={map} faceFill="#fff9ec" rimColor="#2e1065" hourColor="#2e1065" minuteColor="#0f766e" secondColor="#f43f5e" tickColor={(index) => `hsl(${index * 8 + time.second * 240} 72% 38%)`} />;
}

function Ripple({ time }: RendererProps) {
  const phase = time.second * TAU * 5;
  const map: PointMap = (radius, fraction) => {
    if (radius === 0) return { x: 0, y: 0 };
    const wave = 7 * Math.sin(radius * 0.2 - phase + fraction * TAU * 2);
    return polar(Math.max(0, radius + wave * (radius / 96)), fraction);
  };
  return <ClassicFace time={time} map={map} faceFill="#edfaff" rimColor="#073b4c" hourColor="#073b4c" minuteColor="#118ab2" secondColor="#ef476f" numeralColor={(index) => `hsl(${185 + index * 9} 72% 30%)`} />;
}

function Pinch({ time }: RendererProps) {
  const angle = time.minute * TAU - Math.PI / 2;
  const squeeze = 0.48 + 0.12 * Math.sin(time.second * TAU);
  const map: PointMap = (radius, fraction) => {
    const point = polar(radius, fraction);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const along = point.x * cos + point.y * sin;
    const across = -point.x * sin + point.y * cos;
    return {
      x: along * 1.18 * cos - across * squeeze * sin,
      y: along * 1.18 * sin + across * squeeze * cos,
    };
  };
  return <ClassicFace time={time} map={map} faceFill="#fff0f6" rimColor="#701a75" hourColor="#701a75" minuteColor="#be185d" secondColor="#ff4d00" tickColor={(index) => index % 5 === 0 ? "#701a75" : "#d946ef"} />;
}

function Rubber({ time }: RendererProps) {
  const phase = time.second * TAU;
  const stretch = 1 + 0.3 * Math.sin(phase);
  const map: PointMap = (radius, fraction) => {
    const point = polar(radius, fraction);
    const shear = 0.18 * Math.cos(phase * 0.7);
    return { x: point.x * stretch + point.y * shear, y: point.y * (2 - stretch) };
  };
  return <ClassicFace time={time} map={map} faceFill="#f4ffd8" rimColor="#183b11" hourColor="#183b11" minuteColor="#385f12" secondColor="#ff286b" tickColor={(index) => `hsl(${75 + index * 2} 76% 28%)`} />;
}

function QuadrantTwist({ time }: RendererProps) {
  const pulse = 0.035 + 0.035 * Math.sin(time.second * TAU);
  const map: PointMap = (radius, fraction) => {
    const point = polar(radius, fraction);
    const quadrant = (point.x >= 0 ? 1 : -1) * (point.y >= 0 ? 1 : -1);
    const edge = Math.pow(Math.abs(radius) / 96, 1.5);
    return polar(radius, fraction + quadrant * pulse * edge);
  };
  return <ClassicFace time={time} map={map} faceFill="#fef3c7" rimColor="#422006" hourColor="#422006" minuteColor="#7c2d12" secondColor="#dc2626" numeralColor={(index) => index % 2 ? "#7c2d12" : "#422006"} />;
}

function WaveRim({ time }: RendererProps) {
  const phase = time.second * TAU;
  const map: PointMap = (radius, fraction) => {
    const amplitude = 13 * Math.pow(Math.abs(radius) / 96, 2.5);
    const warpedRadius = radius + amplitude * Math.sin(fraction * TAU * 12 - phase * 2);
    return polar(warpedRadius, fraction);
  };
  return <ClassicFace time={time} map={map} faceFill="#e8fff8" rimColor="#064e3b" hourColor="#064e3b" minuteColor="#0f766e" secondColor="#ff2d55" tickColor={(index) => `hsl(${155 + index * 4} 70% 34%)`} />;
}

function Implosion({ time }: RendererProps) {
  const subsecond = time.ms / 1000;
  const impact = Math.exp(-subsecond * 7.5);
  const scale = 1 - impact * 0.48;
  const map: PointMap = (radius, fraction) => polar(radius * scale, fraction + impact * 0.035 * Math.sin(radius / 8));
  return (
    <>
      <circle r="96" fill="#160b2d" />
      {[1, 0.82, 0.64].map((ghostScale, index) => (
        <circle key={ghostScale} r={96 * scale * ghostScale} fill="none" stroke={`hsl(${285 + index * 45} 92% 62%)`} strokeWidth="1.5" opacity={0.6 - index * 0.14} />
      ))}
      <ClassicFace time={time} map={map} faceFill="#fdf4ff" rimColor="#86198f" hourColor="#3b0764" minuteColor="#7e22ce" secondColor="#fb2c94" tickColor={(index) => `hsl(${280 + index * 5} 82% 42%)`} />
    </>
  );
}

function Liquefy({ time }: RendererProps) {
  const phase = time.second * TAU * 2;
  const map: PointMap = (radius, fraction) => {
    const point = polar(radius, fraction);
    const strength = 4 + 10 * Math.pow(Math.abs(point.x) / 96, 1.3);
    return {
      x: point.x + Math.sin(point.y / 13 + phase) * strength,
      y: point.y + Math.cos(point.x / 18 - phase * 0.7) * 4,
    };
  };
  return <ClassicFace time={time} map={map} faceFill="#e0f2fe" rimColor="#164e63" hourColor="#164e63" minuteColor="#0369a1" secondColor="#e11d48" tickColor={(index) => `hsl(${190 + index * 3} 78% 34%)`} numeralColor={(index) => `hsl(${205 + index * 6} 74% 31%)`} />;
}

export const setARenderers: Record<number, StudyRenderer> = {
  1020: Melt,
  1021: Fisheye,
  1022: Corkscrew,
  1023: Ripple,
  1024: Pinch,
  1025: Rubber,
  1026: QuadrantTwist,
  1027: WaveRim,
  1028: Implosion,
  1029: Liquefy,
};

import { arc, Ground, pad, pathPoint, point, poly, Readout, regularPolygon, Text, theme, unitFractions, unitValues, ValueDot, type FaceProps, type Point } from "./shared";

function course(variant: number): { points: Point[]; closed: boolean } {
  if (variant === 0) return { points: Array.from({ length: 101 }, (_, index) => { const angle = index / 100 * Math.PI * 2; return { x: 100 + Math.sin(angle) * 75, y: 90 - Math.cos(angle) * 47 }; }), closed: true };
  if (variant === 1) return { points: regularPolygon(3, 84, 100, 106), closed: true };
  if (variant === 2) return { points: regularPolygon(4, 77, 100, 93), closed: true };
  if (variant === 3) return { points: regularPolygon(6, 73, 100, 93), closed: true };
  if (variant === 4) return { points: Array.from({ length: 121 }, (_, index) => ({ x: 25 + index / 120 * 150, y: 93 + Math.sin(index / 120 * Math.PI * 4) * 39 })), closed: false };
  if (variant === 5) return { points: Array.from({ length: 13 }, (_, index) => ({ x: 25 + Math.ceil(index / 2) * 24, y: 153 - Math.floor(index / 2) * 21 })), closed: false };
  if (variant === 6) return { points: Array.from({ length: 81 }, (_, index) => ({ x: 25 + index / 80 * 150, y: 146 - Math.sin(index / 80 * Math.PI) * 99 })), closed: false };
  if (variant === 7) return { points: [{ x: 24, y: 44 }, { x: 175, y: 44 }, { x: 175, y: 90 }, { x: 25, y: 90 }, { x: 25, y: 139 }, { x: 175, y: 139 }], closed: false };
  if (variant === 8) return { points: Array.from({ length: 121 }, (_, index) => { const angle = index / 120 * Math.PI * 2; return { x: 100 + Math.sign(Math.sin(angle)) * Math.abs(Math.sin(angle)) ** .45 * 72, y: 92 - Math.sign(Math.cos(angle)) * Math.abs(Math.cos(angle)) ** .45 * 58 }; }), closed: true };
  return { points: Array.from({ length: 241 }, (_, index) => point(9 + index / 240 * 64, index / 240 * 2.8, 100, 93)), closed: false };
}

export function TracksFace({ time, variant }: FaceProps) {
  const colors = theme(variant);
  const track = course(variant);
  const fractions = unitFractions(time);
  const values = unitValues(time);
  return <g><Ground colors={colors} /><path d={poly(track.points, track.closed)} fill="none" stroke={colors.pale} strokeWidth="13" strokeLinejoin="round" strokeLinecap="round" /><path d={poly(track.points, track.closed)} fill="none" stroke={colors.ink} strokeWidth=".7" strokeLinejoin="round" />
    {Array.from({ length: 13 }, (_, index) => { const tick = pathPoint(track.points, index / 12, track.closed); return <circle key={index} cx={tick.x} cy={tick.y} r={index % 3 === 0 ? 2 : 1} fill={colors.ink} />; })}
    {fractions.map((fraction, index) => { const position = pathPoint(track.points, fraction, track.closed); return <g key={index}><circle cx={position.x} cy={position.y} r={9 - index * 2} fill={[colors.ink, colors.accent, colors.second][index]} stroke={colors.paper} strokeWidth="1" />{index === 0 && <Text x={position.x} y={position.y} size={8} color={colors.paper} mono>{pad(values[index])}</Text>}</g>; })}
    <Readout time={time} colors={colors} y={182} size={13} />
  </g>;
}

export function RadialFace({ time, variant }: FaceProps) {
  const colors = theme(variant);
  const fractions = unitFractions(time);
  const values = unitValues(time);
  const inks = [colors.ink, colors.accent, colors.second];
  return <g><Ground colors={colors} round />{
    variant === 0 ? <g>{Array.from({ length: 60 }, (_, index) => { const from = point(50, index / 60); const end = point(index < time.minuteValue ? 84 : 61, index / 60); return <line key={index} x1={from.x} y1={from.y} x2={end.x} y2={end.y} stroke={index < time.minuteValue ? colors.accent : colors.pale} strokeWidth="3" />; })}<Text y={93} size={29} color={colors.ink}>{pad(time.h24)}</Text><Text y={118} size={14} color={colors.second} mono>{pad(time.secondValue)}</Text></g>
    : variant === 1 ? fractions.map((fraction, index) => { const radius = 37; const centerX = [61, 139, 100][index]; const centerY = [66, 66, 136][index]; const start = point(radius, 0, centerX, centerY); const end = point(radius, fraction, centerX, centerY); return <g key={index}><circle cx={centerX} cy={centerY} r={radius} fill={colors.pale} /><path d={`M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${fraction > .5 ? 1 : 0} 1 ${end.x} ${end.y} Z`} fill={inks[index]} /><circle cx={centerX} cy={centerY} r="14" fill={colors.paper} /><Text x={centerX} y={centerY} color={inks[index]} size={16} mono>{pad(values[index])}</Text></g>; })
    : variant === 2 ? <g>{Array.from({ length: 12 }, (_, index) => { const tip = point(83, index / 12); const left = point(31, index / 12 - .039); const right = point(31, index / 12 + .039); return <path key={index} d={`M 100 100 Q ${left.x} ${left.y} ${tip.x} ${tip.y} Q ${right.x} ${right.y} 100 100`} fill={index === time.h12 ? colors.accent : colors.pale} stroke={colors.paper} />; })}<circle cx="100" cy="100" r="23" fill={colors.paper} /><Text y={100} size={20} color={colors.ink} mono>{pad(time.minuteValue)}</Text><ValueDot position={point(87, time.second)} colors={{ ...colors, accent: colors.second }} size={3} /></g>
    : variant === 3 ? <g>{Array.from({ length: 24 }, (_, index) => { const center = point(70, index / 24); return <path key={index} d="M -4 10 L 0 -9 L 4 10 Z" transform={`translate(${center.x} ${center.y}) rotate(${index * 15})`} fill={index < time.h24 ? colors.ink : colors.pale} />; })}<path d={arc(50, 0, time.minute)} fill="none" stroke={colors.accent} strokeWidth="7" /><Text y={101} size={21} color={colors.second} mono>{pad(time.secondValue)}</Text></g>
    : variant === 4 ? fractions.map((fraction, index) => <g key={index}><path d={arc(48 + index * 17, index / 3 + .018, (index + 1) / 3 - .018)} fill="none" stroke={colors.pale} strokeWidth="9" /><path d={arc(48 + index * 17, index / 3 + .018, index / 3 + .018 + fraction * .295)} fill="none" stroke={inks[index]} strokeWidth="9" /><Text x={[100, 143, 57][index]} y={[75, 116, 116][index]} size={18} mono color={inks[index]}>{pad(values[index])}</Text></g>)
    : variant === 5 ? <g>{Array.from({ length: 24 }, (_, index) => { const end = point(85, index / 24); return <line key={index} x1="100" y1="100" x2={end.x} y2={end.y} stroke={index === time.h24 ? colors.accent : colors.pale} strokeWidth={index === time.h24 ? 5 : 1} />; })}<circle cx="100" cy="100" r="37" fill={colors.paper} /><Text y={98} size={24} color={colors.ink}>{pad(time.minuteValue)}</Text><path d={arc(44, 0, time.second)} fill="none" stroke={colors.second} strokeWidth="2" /></g>
    : variant === 6 ? <g>{Array.from({ length: 12 }, (_, index) => { const inner = point(22, index / 12 + time.second * .02); const first = point(79, index / 12 - .026); const last = point(79, (index + 1) / 12 - .044); return <path key={index} d={poly([inner, first, last], true)} fill={index === time.h12 ? colors.accent : colors.pale} stroke={colors.paper} />; })}<circle cx="100" cy="100" r="22" fill={colors.ink} /><Text y={100} size={17} mono color={colors.paper}>{pad(time.minuteValue)}</Text></g>
    : variant === 7 ? <g>{Array.from({ length: 12 }, (_, index) => { const center = point(73, index / 12); return <g key={index} transform={`translate(${center.x} ${center.y}) rotate(${index * 30})`}><rect x="-8" y="-12" width="16" height="24" fill={index === time.h12 ? colors.accent : colors.pale} /><rect x="-5" y={10 - time.minute * 20} width="10" height={time.minute * 20} fill={index === time.h12 ? colors.second : colors.ink} opacity={index === time.h12 ? 1 : .14} /></g>; })}<Readout time={time} colors={colors} y={101} size={12} /></g>
    : variant === 8 ? <g>{fractions.map((fraction, index) => <g key={index}>{Array.from({ length: 20 }, (_, mark) => { const angle = fraction - mark / 300; const start = point(22 + index * 21, angle); const end = point(39 + index * 21, angle); return <line key={mark} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={inks[index]} strokeWidth="1.2" opacity={1 - mark / 22} />; })}</g>)}<Readout time={time} colors={colors} y={182} size={12} /></g>
    : <g>{fractions.map((fraction, index) => <g key={index}><circle cx="100" cy="100" r={38 + index * 21} fill="none" stroke={colors.pale} strokeWidth="11" /><path d={arc(38 + index * 21, 0, fraction)} fill="none" stroke={inks[index]} strokeWidth="10" strokeDasharray="2 3" /></g>)}<Text y={100} size={23} color={colors.ink} mono>{pad(time.h24)}</Text></g>
  }</g>;
}
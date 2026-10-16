import { Dial, Hand, HANDS, Hub, INK, PAPER, Text, type FaceProps } from "./shared";
import { circleArc, mappedPoint, path, polar } from "./geometry";

export function PolygonsFace({ time, variant }: FaceProps) {
  const boundary = Array.from({ length: 240 }, (_, index) => mappedPoint(96, index / 240, variant));
  return <g><path d={path(boundary, true)} fill={PAPER} stroke={INK} strokeWidth="3" />{Array.from({ length: 60 }, (_, index) => {
    const major = index % 5 === 0;
    const start = mappedPoint(92, index / 60, variant);
    const end = mappedPoint(major ? 82 : 88, index / 60, variant);
    return <line key={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth={major ? 2.5 : 1} strokeLinecap="round" />;
  })}{Array.from({ length: 12 }, (_, index) => {
    const position = mappedPoint(70, index / 12, variant);
    return <Text key={index} x={position.x} y={position.y} size={14}>{index || 12}</Text>;
  })}{HANDS.map(hand => {
    const nodes = Array.from({ length: 24 }, (_, sample) => mappedPoint(-hand.tail + (hand.tip + hand.tail) * sample / 23, time[hand.key], variant));
    return <path key={hand.key} data-mapped-hand={hand.key} d={path(nodes)} fill="none" stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" />;
  })}<Hub /></g>;
}

export function SweepsFace({ time, variant }: FaceProps) {
  const hour = time.hour;
  const minute = time.minute;
  return <g><Dial />{
    variant === 0 ? <><path d={circleArc(50, hour - .16, hour)} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" /><circle cx={polar(50, hour).x} cy={polar(50, hour).y} r="3" fill={INK} /><Hand time={time} unit={1} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 1 ? <>{[hour, minute].map((fraction, index) => <g key={index}><path d={circleArc(index === 0 ? 49 : 74, fraction - .19, fraction)} fill="none" stroke={INK} strokeWidth={index === 0 ? 2 : 1.1} /><circle cx={polar(index === 0 ? 49 : 74, fraction).x} cy={polar(index === 0 ? 49 : 74, fraction).y} r={index === 0 ? 3.2 : 2.1} fill={INK} /></g>)}<Hand time={time} unit={2} /><Hub /></>
    : variant === 2 ? <><path d={circleArc(59, hour, hour + ((minute - hour + 1) % 1))} fill="none" stroke={INK} strokeWidth="1.25" />{[hour, minute].map((fraction, index) => { const place = polar(59, fraction); return <circle key={index} cx={place.x} cy={place.y} r={index ? 2 : 3.2} fill={index ? PAPER : INK} stroke={INK} strokeWidth="1" />; })}<Hand time={time} unit={2} /><Hub /></>
    : variant === 3 ? <>{HANDS.map(hand => <g key={hand.key}><path d={circleArc(hand.tip, time[hand.key] - .25, time[hand.key])} fill="none" stroke={hand.color} strokeWidth={hand.width / 1.6} /><circle cx={polar(hand.tip, time[hand.key]).x} cy={polar(hand.tip, time[hand.key]).y} r={hand.width / 2} fill={hand.color} /></g>)}</>
    : variant === 4 ? <>{HANDS.map(hand => <g key={hand.key}><path d={circleArc(hand.tail, time[hand.key] + .33, time[hand.key] + .5)} fill="none" stroke={hand.color} strokeWidth={hand.width / 1.6} /><Hand time={time} unit={HANDS.indexOf(hand) as 0 | 1 | 2} tail={hand.tail} /></g>)}<Hub /></>
    : variant === 5 ? <>{HANDS.slice(0, 2).map((hand, index) => { const root = polar(14, time[hand.key]); const tip = polar(hand.tip, time[hand.key]); return <g key={hand.key}><path d={circleArc(14, time[hand.key] - .17, time[hand.key] + .17)} fill="none" stroke={INK} strokeWidth={index ? 1.5 : 2.5} /><line x1={root.x} y1={root.y} x2={tip.x} y2={tip.y} stroke={INK} strokeWidth={hand.width} strokeLinecap="round" /></g>; })}<Hand time={time} unit={2} tail={-18} /></>
    : variant === 6 ? <><Hand time={time} unit={0} /><path d={circleArc(71, minute - .026, minute + .026)} fill="none" stroke={INK} strokeWidth="1.8" /><path d={circleArc(78, minute - .026, minute + .026)} fill="none" stroke={INK} strokeWidth="1.8" /><circle cx={polar(74.5, minute).x} cy={polar(74.5, minute).y} r="1.3" fill={INK} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 7 ? <>{HANDS.map(hand => <g key={hand.key}><path d={circleArc(hand.tip, 0, time[hand.key])} fill="none" stroke={hand.color} strokeWidth={hand.width / 2} /><circle cx={polar(hand.tip, time[hand.key]).x} cy={polar(hand.tip, time[hand.key]).y} r={hand.width / 2 + .5} fill={hand.color} /></g>)}<circle cy="-50" r="1.2" fill={INK} /></>
    : variant === 8 ? <>{HANDS.slice(0, 2).map(hand => <path key={hand.key} d={path(Array.from({ length: 61 }, (_, sample) => { const fraction = sample / 60; return polar(6 + fraction * (hand.tip - 6), time[hand.key] - .24 * (1 - fraction)); }))} fill="none" stroke={INK} strokeWidth={hand.width / 1.5} strokeLinecap="round" />)}<Hand time={time} unit={2} /><Hub /></>
    : <>{HANDS.slice(0, 2).map((hand, index) => { const tip = polar(hand.tip, time[hand.key]); const first = polar(41, time[hand.key] + (index ? -.23 : .23)); return <g key={hand.key}><path d={`M 0 0 Q ${first.x} ${first.y} ${tip.x} ${tip.y}`} fill="none" stroke={INK} strokeWidth={hand.width / 1.5} /><circle cx={tip.x} cy={tip.y} r={hand.width / 2} fill={INK} /></g>; })}<Hand time={time} unit={2} /><Hub /></>
  }</g>;
}
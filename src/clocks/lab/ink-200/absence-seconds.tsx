import { AllHands, Dial, Face, Hand, HANDS, Hub, INK, PAPER, RED, SecondDot, Text, pad, type FaceProps } from "./shared";
import { circleArc, polar } from "./geometry";

export function AbsenceFace({ time, variant, uid }: FaceProps) {
  const minute = polar(87, time.minute);
  const hour = polar(50, time.hour);
  return <g>{variant === 2 ? <><Dial rim={false} /><path d={circleArc(96, time.minute + .028, time.minute + .972)} fill="none" stroke={INK} strokeWidth="3" /></> : variant === 7 ? <><Dial rim={false} /><path d={circleArc(96, .015, .975)} fill="none" stroke={INK} strokeWidth="3" /></> : <Dial numerals={variant !== 9 && variant !== 6} />}{
    variant === 0 ? <>{HANDS.map((hand, index) => { const start = polar(9 + index * 2, time[hand.key]); const end = polar(hand.tip, time[hand.key]); return <line key={hand.key} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" />; })}</>
    : variant === 1 ? <><Hand time={time} unit={0} tail={0} /><Hand time={time} unit={1} tail={0} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 2 || variant === 7 ? <AllHands time={time} />
    : variant === 3 ? <><circle cx={hour.x} cy={hour.y} r="4.2" fill={INK} /><Hand time={time} unit={1} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 4 ? <><Hand time={time} unit={0} /><circle cx={minute.x} cy={minute.y} r="3.3" fill={PAPER} stroke={INK} strokeWidth="1.5" /><Hand time={time} unit={2} /><Hub /></>
    : variant === 5 ? <><defs><mask id={`${uid}-quiet-center`}><circle r="100" fill="white" /><circle r="40" fill="black" /></mask></defs><g mask={`url(#${uid}-quiet-center)`}><Hand time={time} unit={0} /><Hand time={time} unit={1} /></g><SecondDot time={time} radius={90} /></>
    : variant === 6 ? <><circle r="80" fill={INK} /><circle r="56" fill={PAPER} />{Array.from({ length: 12 }, (_, index) => { const place = polar(69, index / 12); return <Text key={index} x={place.x} y={place.y} size={12} ink={PAPER}>{index || 12}</Text>; })}<Hand time={time} unit={1} ink={PAPER} tip={80} tail={-56} width={3} /><Hand time={time} unit={0} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 8 ? <><circle cx={hour.x} cy={hour.y} r="4" fill={INK} /><circle cx={polar(74, time.minute).x} cy={polar(74, time.minute).y} r="2.7" fill={INK} /><Hand time={time} unit={2} tail={-78} /></>
    : <>{Array.from({ length: 12 }, (_, index) => { const distance = Math.abs(((time.hour * 12 - index + 18) % 12) - 6); const place = polar(70, index / 12); return distance < .5 ? null : <Text key={index} x={place.x} y={place.y}>{index || 12}</Text>; })}<AllHands time={time} /></>
  }</g>;
}

export function SecondsFace({ time, variant }: FaceProps) {
  const dot = polar(92, time.second);
  const along = -70 + time.second * 140;
  return <g>{variant === 5 || variant === 9 ? <Face rim={false} /> : <Dial />}<g>{
    variant === 0 ? <><AllHands time={time} seconds={false} /><path d="M -4 -92 H 4" transform={`rotate(${time.second * 360})`} stroke={RED} strokeWidth="1.7" strokeLinecap="round" /></>
    : variant === 1 ? <><AllHands time={time} seconds={false} /><circle r={5 + time.second * 19} fill="none" stroke={RED} strokeWidth="1" /></>
    : variant === 2 ? <><AllHands time={time} seconds={false} /><g transform={`translate(${polar(-28, time.minute).x} ${polar(-28, time.minute).y})`}><circle r="10" fill={PAPER} /><Text size={13} ink={RED}>{pad(time.secondValue)}</Text></g></>
    : variant === 3 ? <><AllHands time={time} seconds={false} /><rect x={polar(93, time.secondValue / 60).x - 2} y={polar(93, time.secondValue / 60).y - 2} width="4" height="4" fill={RED} /></>
    : variant === 4 ? <><AllHands time={time} seconds={false} />{Array.from({ length: 12 }, (_, index) => <path key={index} d={circleArc(94, index / 12 + .01, (index + 1) / 12 - .01)} stroke={INK} strokeWidth=".6" fill="none" />)}<circle cx={dot.x} cy={dot.y} r="2" fill={RED} /></>
    : variant === 5 ? <><Text y={-8} size={45}>{pad(time.h24)}:{pad(time.minuteValue)}</Text><path d="M -76 33 H 76" stroke={INK} strokeWidth=".6" /><path d={`M -76 33 H ${-76 + time.second * 152}`} stroke={RED} strokeWidth="1.5" /></>
    : variant === 6 ? <><AllHands time={time} seconds={false} /><Hand time={time} unit={2} tip={-7} tail={23} /><Hub /></>
    : variant === 7 ? <><AllHands time={time} seconds={false} /><circle r="92" stroke={INK} strokeWidth=".45" fill="none" /><circle cx={dot.x} cy={dot.y} r="2.7" fill={RED} /></>
    : variant === 8 ? <><AllHands time={time} seconds={false} />{Array.from({ length: 60 }, (_, index) => { const start = polar(91, index / 60); const end = polar(95, index / 60); return <line key={index} data-counted={index < time.secondValue ? "second" : undefined} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={index < time.secondValue ? RED : INK} strokeWidth="1.1" opacity={index < time.secondValue ? 1 : .2} />; })}</>
    : <><Text x={-40} y={-5} size={47}>{pad(time.h24)}</Text><Text x={40} y={-5} size={47}>{pad(time.minuteValue)}</Text><path d="M -70 42 H 70 M 0 -48 V 42" fill="none" stroke={INK} strokeWidth=".5" /><circle cx={along} cy={42} r="2.5" fill={RED} /></>
  }</g></g>;
}
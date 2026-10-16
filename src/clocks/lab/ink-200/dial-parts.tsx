import { AllHands, Dial, Face, Hand, Hub, INK, Numerals, PAPER, RED, SecondDot, Ticks, type FaceProps } from "./shared";
import { circleArc, path, polar } from "./geometry";

export function TicksFace({ time, variant }: FaceProps) {
  return <g><Face /><Numerals />{Array.from({ length: 60 }, (_, index) => {
    const major = index % 5 === 0;
    const angle = index * 6;
    const distance = Math.abs(((time.minute * 60 - index + 90) % 60) - 30);
    const stroke = major ? 2.5 : 1;
    const drawing = variant === 0 ? <path d={`M 0 -92 Q ${major ? 5 : 2.5} -87 0 ${major ? -81 : -88}`} fill="none" strokeWidth={stroke} />
      : variant === 1 ? <><path d={`M 0 -92 V ${major ? -83 : -89}`} strokeWidth={stroke} />{!major && <path d="M 0 -81 v 2" strokeWidth=".8" />}</>
      : variant === 2 ? major || distance < 1.1 ? <path d={`M 0 -92 V ${major ? -82 : -87}`} strokeWidth={stroke} /> : null
      : variant === 3 ? <><path d={`M 0 -92 V ${major ? -78 : -89}`} strokeWidth={stroke} />{major && <path d="M 0 -78 v 7" strokeWidth=".7" />}</>
      : variant === 4 ? major ? <><path d="M -2 -92 v 9 M 2 -92 v 9" strokeWidth="1" /></> : <path d="M 0 -91 v 3" strokeWidth=".7" />
      : variant === 5 ? <><path d={`M 0 -92 V ${major ? -86 : -88}`} strokeWidth={stroke} />{major && <path d="M 0 -82 v 4" strokeWidth="2" />}</>
      : variant === 6 ? <path d={`M 0 -92 V ${major ? -80 : index % 2 ? -85 : -89}`} strokeWidth={major ? 2 : 1} />
      : variant === 7 ? major ? <circle cy="-88" r="2.1" fill={INK} stroke="none" /> : <path d="M 0 -92 v 3" strokeWidth=".8" />
      : variant === 8 ? major ? <path d="M -3 -91 Q 0 -86 -3 -81 M 3 -91 Q 0 -86 3 -81" strokeWidth="1.1" fill="none" /> : <path d="M 0 -92 v 3" strokeWidth=".8" />
      : <path d={`M 0 -92 V ${major ? -76 : -88 + (index % 5) * 1.8}`} strokeWidth={major ? 1.8 : .7} />;
    return <g key={index} transform={`rotate(${angle})`} stroke={INK} fill="none" strokeLinecap="round">{drawing}</g>;
  })}<AllHands time={time} /></g>;
}

export function RimsFace({ time, variant }: FaceProps) {
  return <g><Face rim={false} /><Ticks /><Numerals />{
    variant === 0 ? [0, 1, 2, 3].map(index => <path key={index} d={circleArc(96, index / 4 + .023, (index + 1) / 4 - .023)} fill="none" stroke={INK} strokeWidth="3" />)
    : variant === 1 ? <circle r="60" fill="none" stroke={INK} strokeWidth="1.2" />
    : variant === 2 ? Array.from({ length: 12 }, (_, index) => <path key={index} d={circleArc(96, index / 12 + .007, (index + 1) / 12 - .007)} fill="none" stroke={INK} strokeWidth="3" />)
    : variant === 3 ? <><path d={circleArc(94, .254, .746, 0, -2)} fill="none" stroke={INK} strokeWidth="2" /><path d={circleArc(94, -.246, .246, 0, 2)} fill="none" stroke={INK} strokeWidth="2" /></>
    : variant === 4 ? <><circle r="95.5" fill="none" stroke={INK} strokeWidth="1" /><circle r="91" fill="none" stroke={INK} strokeWidth=".7" /><SecondDot time={time} radius={93} size={1.8} /></>
    : variant === 5 ? [0, 1, 2, 3].map(index => <path key={index} d="M -13 -94 H 13 M 0 -94 V -99" transform={`rotate(${index * 90})`} stroke={INK} strokeWidth="1.7" fill="none" />)
    : variant === 6 ? <><circle r="96" fill="none" stroke={INK} strokeWidth=".75" /><path d={circleArc(96, time.minute - .075, time.minute + .075)} stroke={INK} strokeWidth="3" fill="none" /></>
    : variant === 7 ? <><circle r="96" fill="none" stroke={INK} strokeWidth="1.3" />{[0, 1, 2, 3].map(index => <path key={index} d="M 0 -97 v 12" transform={`rotate(${index * 90 + 45})`} stroke={INK} strokeWidth="1" />)}</>
    : variant === 8 ? <path d={path(Array.from({ length: 241 }, (_, sample) => { const angle = sample / 240; const radius = 96 - 4 * Math.max(0, Math.cos(angle * Math.PI * 24)) ** 8; return polar(radius, angle); }), true)} fill="none" stroke={INK} strokeWidth="2" />
    : [0, 1, 2, 3].map(index => <path key={index} d={circleArc(96 - index * 2, index / 4 + .012, (index + 1) / 4 - .012)} fill="none" stroke={INK} strokeWidth="1.7" />)
  }<AllHands time={time} seconds={variant !== 4} /></g>;
}

export function WindowsFace({ time, variant, uid }: FaceProps) {
  const minutePosition = polar(74, time.minute);
  const hourPosition = polar(50, time.hour);
  const maskId = `${uid}-windows`;
  return <g>{
    variant === 0 ? <><Dial /><defs><mask id={maskId}><circle r="100" fill="white" />{[time.hour, time.minute, time.second].map((fraction, index) => <path key={index} d={circleArc(40 + index * 20, fraction - .017, fraction + .017)} fill="none" stroke="black" strokeWidth="9" />)}</mask></defs><circle r="67" fill={INK} mask={`url(#${maskId})`} /><circle r="30" fill={PAPER} />{[time.hour, time.minute, time.second].map((fraction, index) => { const tip = polar(40 + index * 20, fraction); return <circle key={index} cx={tip.x} cy={tip.y} r={3 - index * .4} fill={index === 2 ? RED : PAPER} stroke={index === 2 ? PAPER : INK} strokeWidth="1" />; })}</>
    : variant === 1 ? <><Dial numerals={false} /><defs><clipPath id={maskId}><path d={`M 0 0 L ${polar(85, time.hour - .085).x} ${polar(85, time.hour - .085).y} A 85 85 0 0 1 ${polar(85, time.hour + .085).x} ${polar(85, time.hour + .085).y} Z`} /></clipPath></defs><g clipPath={`url(#${maskId})`}><Numerals /></g><AllHands time={time} /></>
    : variant === 2 ? <><Dial /><circle r="58" fill={INK} />{[time.hour, time.minute].map((fraction, index) => <path key={index} d={`M 0 8 V ${index === 0 ? -46 : -58}`} transform={`rotate(${fraction * 360})`} stroke={PAPER} strokeWidth={index === 0 ? 5 : 2.5} strokeLinecap="round" />)}<Hand time={time} unit={2} /><Hub /></>
    : variant === 3 ? <><Face /><Numerals /><circle r="29" fill="none" stroke={INK} strokeWidth=".6" />{[time.hour, time.minute, time.second].map((fraction, index) => <g key={index}><circle r={38 + index * 22} fill="none" stroke={INK} strokeWidth={index === 0 ? 7 : 4} /><path d={circleArc(38 + index * 22, fraction - .015, fraction + .015)} fill="none" stroke={PAPER} strokeWidth={index === 0 ? 8 : 5} /><circle cx={polar(38 + index * 22, fraction).x} cy={polar(38 + index * 22, fraction).y} r="1.5" fill={index === 2 ? RED : INK} /></g>)}</>
    : variant === 4 ? <><Dial numerals={false} /><defs><clipPath id={maskId}><circle cx={minutePosition.x} cy={minutePosition.y} r="16" /></clipPath></defs><g clipPath={`url(#${maskId})`}><Numerals /></g><circle cx={minutePosition.x} cy={minutePosition.y} r="16" fill="none" stroke={INK} strokeWidth="1" /><AllHands time={time} /></>
    : variant === 5 ? <><Dial /><AllHands time={time} /><path d="M -31 -3 H 31 M -3 -31 V 31" stroke={PAPER} strokeWidth="6" /><Hub /></>
    : variant === 6 ? <><Dial /><path d={path([{ x: 0, y: 0 }, polar(66, time.hour - .018), polar(66, time.hour + .018)], true)} fill={INK} /><circle cx={hourPosition.x} cy={hourPosition.y} r="2" fill={PAPER} /><Hand time={time} unit={1} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 7 ? <><Face /><defs><clipPath id={maskId}>{[0, 1, 2, 3].map(index => <rect key={index} x="-18" y="-96" width="36" height="32" transform={`rotate(${index * 90})`} />)}</clipPath></defs><g clipPath={`url(#${maskId})`}><Ticks /><Numerals /></g><AllHands time={time} /></>
    : variant === 8 ? <><Dial numerals={false} /><defs><clipPath id={maskId}>{Array.from({ length: 12 }, (_, index) => { const center = polar(70, index / 12); return <rect key={index} x={center.x - 6} y={center.y - 9} width="12" height="18" />; })}</clipPath></defs><g clipPath={`url(#${maskId})`}><Numerals /></g><AllHands time={time} seconds={false} /><SecondDot time={time} radius={89} /></>
    : <><Dial />{[time.hour, time.minute].map((fraction, index) => <path key={index} d={`M -${index === 0 ? 4 : 2.5} 8 V -${index === 0 ? 44 : 68} L 0 -${index === 0 ? 50 : 74} L ${index === 0 ? 4 : 2.5} -${index === 0 ? 44 : 68} V 8 Z`} transform={`rotate(${fraction * 360})`} fill={PAPER} stroke={INK} strokeWidth={index === 0 ? 1.6 : 1.1} />)}<Hand time={time} unit={2} /><Hub /></>
  }</g>;
}
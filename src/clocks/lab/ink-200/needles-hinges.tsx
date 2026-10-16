import { Dial, Hand, HANDS, Hub, INK, PAPER, type FaceProps } from "./shared";
import { path, polar } from "./geometry";

export function NeedlesFace({ time, variant }: FaceProps) {
  return <g><Dial />{HANDS.slice(0, 2).map((hand, index) => {
    const width = hand.width;
    const half = width / 2;
    const reach = hand.tip;
    const body = variant === 0 ? <><path d={`M 0 ${hand.tail} L ${-half} 0 V ${-reach + 5} L 0 ${-reach} L ${half} ${-reach + 5} V 0 Z`} fill={INK} /><path d={`M 0 2 V ${-reach + 8}`} stroke={PAPER} strokeWidth="1.1" /></>
      : variant === 1 ? <><path d={`M 0 ${hand.tail} V ${-reach + 4}`} stroke={INK} strokeWidth={width} strokeLinecap="round" /><circle cy={-reach} r={half + 2} fill={PAPER} stroke={INK} strokeWidth="1.4" /></>
      : variant === 2 ? <><path d={`M ${-half} ${hand.tail} V ${-reach} M ${half} ${hand.tail} V ${-reach} M ${-half} ${-reach} H ${half}`} fill="none" stroke={INK} strokeWidth="1.1" /><path d={`M ${-half} ${hand.tail} H ${half}`} stroke={INK} strokeWidth="1.1" /></>
      : variant === 3 ? <path d={`M 0 ${hand.tail} L ${-width} 0 L 0 ${-reach} L ${width} 0 Z`} fill={INK} />
      : variant === 4 ? <><path d={`M 0 ${hand.tail} V ${-reach + 14}`} stroke={INK} strokeWidth={width} strokeLinecap="round" /><path d={`M 0 ${-reach + 14} L ${-width} ${-reach} M 0 ${-reach + 14} L ${width} ${-reach}`} stroke={INK} strokeWidth={width / 2} strokeLinecap="round" fill="none" /></>
      : variant === 5 ? <><path d={`M 0 ${hand.tail} V ${-reach + 9}`} stroke={INK} strokeWidth={width} strokeLinecap="round" /><path d={`M 0 ${-reach + 10} L ${-width} ${-reach} L 0 ${-reach - 5} L ${width} ${-reach} Z`} fill={PAPER} stroke={INK} strokeWidth="1.25" /></>
      : variant === 6 ? <><path d={`M 0 ${hand.tail} V ${-reach}`} stroke={INK} strokeWidth=".9" /><path d={`M 0 -10 V ${-reach + 12}`} stroke={INK} strokeWidth={width} /><path d={`M -3 ${-reach} h 6`} stroke={INK} /></>
      : variant === 7 ? <path d={`M 0 ${hand.tail} L ${-width} ${-reach} H ${width} Z`} fill={INK} />
      : variant === 8 ? <path d={`M 0 ${hand.tail} Q ${-width * 1.7} ${-reach * .3} 0 ${-reach} Q ${width * 1.7} ${-reach * .3} 0 ${hand.tail} Z`} fill="none" stroke={INK} strokeWidth={index === 0 ? 1.8 : 1.15} />
      : <><path d={`M 0 ${hand.tail} V ${-reach}`} stroke={INK} strokeWidth={width} strokeLinecap="round" /><path d={`M ${-width * 1.4} ${-reach} H ${width * 1.4}`} stroke={INK} strokeWidth={width / 2} strokeLinecap="round" /></>;
    return <g key={hand.key} data-needle={hand.key} transform={`rotate(${time[hand.key] * 360})`}>{body}</g>;
  })}<Hand time={time} unit={2} /><Hub /></g>;
}

export function HingesFace({ time, variant }: FaceProps) {
  const second = time.second * Math.PI * 2;
  return <g><Dial />{HANDS.slice(0, 2).map((hand, index) => {
    const turns = time[hand.key];
    const tip = polar(hand.tip, turns);
    const tail = polar(-hand.tail, turns);
    const knee = polar(hand.tip * .48, turns);
    const bend = index === 0 ? -1 : 1;
    let body;
    if (variant === 0) {
      const joint = { x: knee.x + Math.sin(second) * 9, y: knee.y };
      body = <><path d={path([tail, { x: 0, y: 0 }, joint, tip])} /><circle cx={joint.x} cy={joint.y} r="2.3" fill={PAPER} strokeWidth="1.1" /></>;
    } else if (variant === 1) {
      const joint = polar(16, turns + bend * .16);
      body = <path d={path([tail, joint, tip])} />;
    } else if (variant === 2) {
      const first = polar(15, turns - bend * .14);
      const next = polar(35, turns + bend * .055);
      body = <path d={path([tail, { x: 0, y: 0 }, first, next, tip])} />;
    } else if (variant === 3) {
      const first = polar(25, turns + bend * .12);
      const next = polar(38, turns - bend * .1);
      body = <path d={`M ${tail.x} ${tail.y} L 0 0 C ${first.x} ${first.y} ${next.x} ${next.y} ${tip.x} ${tip.y}`} />;
    } else if (variant === 4) {
      const root = { x: 0, y: index === 0 ? 12 : -12 };
      body = <><path d={path([root, tip])} /><circle cx={root.x} cy={root.y} r="3.2" fill={PAPER} strokeWidth="1.2" /></>;
    } else if (variant === 5) {
      const root = polar(-16, time[HANDS[1 - index].key]);
      body = <><path d={path([root, { x: 0, y: 0 }, tip])} /><circle cx={root.x} cy={root.y} r="2.7" fill={PAPER} strokeWidth="1.1" /></>;
    } else if (variant === 6) {
      const joint = { x: knee.x + Math.cos(second + index * Math.PI) * 8, y: knee.y + Math.sin(second + index * Math.PI) * 8 };
      body = <><path d={path([tail, joint, tip])} /><circle cx={joint.x} cy={joint.y} r="3" fill={PAPER} strokeWidth="1.1" /></>;
    } else if (variant === 7) {
      const root = polar(20, turns + bend * .25);
      body = <path d={path([tail, root, tip])} />;
    } else if (variant === 8) {
      const root = { x: index === 0 ? -10 : 10, y: index === 0 ? 7 : -7 };
      body = <><path d={path([root, { x: knee.x, y: root.y }, tip])} /><circle cx={root.x} cy={root.y} r="3" fill={PAPER} strokeWidth="1.1" /></>;
    } else {
      const first = polar(20, turns);
      const next = polar(30, turns + bend * .035);
      body = <><path d={path([tail, first])} /><path d={path([first, next])} strokeWidth="1" /><path d={path([next, tip])} /><circle cx={next.x} cy={next.y} r="2.1" fill={PAPER} strokeWidth="1" /></>;
    }
    return <g key={hand.key} data-hinged={hand.key} fill="none" stroke={INK} strokeWidth={hand.width} strokeLinecap="round" strokeLinejoin="round">{body}</g>;
  })}<Hand time={time} unit={2} /><Hub /></g>;
}
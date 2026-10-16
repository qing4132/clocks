import { FixedDial, Hand, Hub, HANDS, INK, PAPER, RED, type FaceProps } from "./anatomy";
import { balancedHand, bypassHand, crescentHand, plumbHand, spanHands, supportedHand } from "./further.geometry";
import { radialPoint } from "./geometry";

export function PlumbFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand) => {
        const line = plumbHand(time[hand.key], hand.tip);
        return (
          <g key={hand.key} data-plumb-hand={hand.key}>
            <line x1={line.tip.x} y1={line.tip.y} x2={line.foot.x} y2={line.foot.y} stroke={INK} strokeWidth={hand.width} strokeLinecap="round" />
            <circle cx={line.tip.x} cy={line.tip.y} r={hand.width / 2 + 1} fill={PAPER} stroke={INK} strokeWidth="1.2" />
          </g>
        );
      })}
      <Hand time={time} index={2} />
    </g>
  );
}

export function SpanFace({ time }: FaceProps) {
  const state = spanHands(time.hour, time.minute);
  return (
    <g>
      <FixedDial time={time} />
      <line data-span="true" x1={state.hourTip.x} y1={state.hourTip.y} x2={state.minuteTip.x} y2={state.minuteTip.y} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx={state.hourTip.x} cy={state.hourTip.y} r="4.2" fill={INK} />
      <circle cx={state.minuteTip.x} cy={state.minuteTip.y} r="3.1" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      <Hand time={time} index={2} />
    </g>
  );
}

export function BypassFace({ time }: FaceProps) {
  const secondStart = radialPoint(18, time.second);
  const secondTip = radialPoint(84, time.second);
  return (
    <g>
      <FixedDial time={time} />
      <circle r="18" fill="none" stroke={INK} strokeWidth="0.65" opacity="0.32" />
      {HANDS.slice(0, 2).map((hand, index) => {
        const line = bypassHand(time[hand.key], hand.tip, index === 0);
        return <path key={hand.key} data-bypass-hand={hand.key} d={line.path} fill="none" stroke={INK} strokeWidth={hand.width} strokeLinecap="round" strokeLinejoin="round" />;
      })}
      <line x1={secondStart.x} y1={secondStart.y} x2={secondTip.x} y2={secondTip.y} stroke={RED} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export function CarrierFace({ time }: FaceProps) {
  const supports = HANDS.slice(0, 2).map((hand, index) => (
    supportedHand(time[hand.key], hand.tip, hand.tail, radialPoint(index === 0 ? -12 : 30, time.second))
  ));
  return (
    <g>
      <FixedDial time={time} />
      {supports.map((line, index) => (
        <line key={index} data-carried-hand={HANDS[index].key} x1={line.start.x} y1={line.start.y} x2={line.tip.x} y2={line.tip.y} stroke={INK} strokeWidth={HANDS[index].width} strokeLinecap="round" />
      ))}
      <Hand time={time} index={2} />
      <Hub />
      {supports.map((line, index) => (
        <circle key={index} cx={line.anchor.x} cy={line.anchor.y} r="3" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      ))}
    </g>
  );
}

export function CounterpoiseFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand) => {
        const line = balancedHand(time[hand.key], hand.tip);
        return (
          <g key={hand.key} data-balanced-hand={hand.key}>
            <line x1={line.back.x} y1={line.back.y} x2="0" y2="0" stroke={INK} strokeWidth={hand.width / 2} strokeLinecap="round" />
            <line x1="0" y1="0" x2={line.front.x} y2={line.front.y} stroke={INK} strokeWidth={hand.width} strokeLinecap="round" />
            <circle cx={line.back.x} cy={line.back.y} r={hand.width / 2 + 1} fill={PAPER} stroke={INK} strokeWidth="1.1" />
          </g>
        );
      })}
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function CrescentFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand) => {
        const arc = crescentHand(time[hand.key], hand.tip, hand.width);
        return (
          <g key={hand.key} data-crescent-hand={hand.key}>
            <path d={arc.path} fill={INK} />
            <circle cx={arc.tip.x} cy={arc.tip.y} r={hand.width / 2} fill={INK} />
          </g>
        );
      })}
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}
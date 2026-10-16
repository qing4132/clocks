import { FixedDial, Hand, Hub, HANDS, INK, PAPER, type FaceProps } from "./anatomy";
import { loopHand, rightAngleHand, sharedStem, splitPinHand } from "./continuations.geometry";
import { radialPoint } from "./geometry";

export function LoopFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand) => {
        const loop = loopHand(time[hand.key], hand.tip);
        return (
          <g key={hand.key} data-loop-hand={hand.key}>
            <circle cx={loop.center.x} cy={loop.center.y} r={loop.radius} fill="none" stroke={INK} strokeWidth={hand.width / 2} />
            <circle cx={loop.tip.x} cy={loop.tip.y} r={hand.width / 2} fill={INK} />
          </g>
        );
      })}
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function SplitPinFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand, index) => {
        const line = splitPinHand(time[hand.key], hand.tip, hand.tail, index === 0 ? -18 : 18);
        return (
          <g key={hand.key} data-split-pin={hand.key}>
            <line x1={line.start.x} y1={line.start.y} x2={line.tip.x} y2={line.tip.y} stroke={INK} strokeWidth={hand.width} strokeLinecap="round" />
            <circle cx={line.anchor.x} cy={line.anchor.y} r="3.4" fill={PAPER} stroke={INK} strokeWidth="1.6" />
          </g>
        );
      })}
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function RightAngleFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand, index) => {
        const line = rightAngleHand(time[hand.key], hand.tip, index === 0);
        return <path key={hand.key} data-right-angle={hand.key} d={line.path} fill="none" stroke={INK} strokeWidth={hand.width} strokeLinecap="round" strokeLinejoin="round" />;
      })}
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function CommonStemFace({ time }: FaceProps) {
  const state = sharedStem(time.hour, time.minute);
  return (
    <g>
      <FixedDial time={time} />
      <path data-common-stem="true" d={`M 0 0 L ${state.joint.x} ${state.joint.y} L ${state.hourTip.x} ${state.hourTip.y}`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={state.joint.x} y1={state.joint.y} x2={state.minuteTip.x} y2={state.minuteTip.y} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function DistantFace({ time }: FaceProps) {
  const starts = [34, 53, 74];
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.map((hand, index) => {
        const start = radialPoint(starts[index], time[hand.key]);
        const end = radialPoint(hand.tip, time[hand.key]);
        return <line key={hand.key} data-distant-hand={hand.key} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" />;
      })}
    </g>
  );
}
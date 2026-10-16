import { FixedDial, Hand, Hub, HANDS, INK, PAPER, RED, type FaceProps } from "./anatomy";
import { bowedHand, courtesyBend, crosswiseHand, inwardHand, radialPoint, wanderingHand } from "./geometry";

export function InwardFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.map((hand) => {
        const line = inwardHand(time[hand.key], hand.tip + hand.tail);
        return (
          <g key={hand.key} data-edge-hand={hand.key}>
            <line x1={line.anchor.x} y1={line.anchor.y} x2={line.end.x} y2={line.end.y} stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" />
            <circle cx={line.anchor.x} cy={line.anchor.y} r={hand.key === "second" ? 1.5 : 2.5} fill={PAPER} stroke={hand.color} strokeWidth="1.2" />
          </g>
        );
      })}
    </g>
  );
}

export function HandInHandFace({ time }: FaceProps) {
  const elbow = radialPoint(50, time.hour);
  const end = radialPoint(74, time.minute);
  return (
    <g>
      <FixedDial time={time} />
      <Hand time={time} index={0} />
      <line data-linked-hand="minute" x1={elbow.x} y1={elbow.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx={elbow.x} cy={elbow.y} r="3.4" fill={PAPER} stroke={INK} strokeWidth="1.4" />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function CourtesyFace({ time }: FaceProps) {
  const bend = courtesyBend(time.hour, time.minute);
  return (
    <g>
      <FixedDial time={time} />
      <path data-bowed-hand="hour" d={bowedHand(time.hour, 50, 10, -bend)} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path data-bowed-hand="minute" d={bowedHand(time.minute, 74, 14, bend)} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand time={time} index={2} />
      <Hub />
    </g>
  );
}

export function WanderingPivotFace({ time }: FaceProps) {
  const pivot = radialPoint(20, time.second);
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.slice(0, 2).map((hand) => {
        const line = wanderingHand(time[hand.key], hand.tip, hand.tail, time.second);
        return <line key={hand.key} data-wandering-hand={hand.key} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke={INK} strokeWidth={hand.width} strokeLinecap="round" />;
      })}
      <circle data-seconds-pivot="true" cx={pivot.x} cy={pivot.y} r="4" fill={RED} />
    </g>
  );
}

export function CrosswiseFace({ time }: FaceProps) {
  return (
    <g>
      <FixedDial time={time} />
      {HANDS.map((hand) => {
        const line = crosswiseHand(time[hand.key], hand.tip);
        return <line key={hand.key} data-crosswise-hand={hand.key} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke={hand.color} strokeWidth={hand.width} strokeLinecap="round" />;
      })}
    </g>
  );
}
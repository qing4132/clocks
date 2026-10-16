import { Dial, Hand, Hub, INK, PAPER, RED, Readout, SecondDot, Text, pad, type FaceProps } from "./shared";
import { circleArc, polar, smooth, steppedSecond } from "./geometry";

export function CadenceFace({ time, variant }: FaceProps) {
  const clock = { ...time };
  if (variant === 0 || variant === 4) clock.minute = time.minuteValue / 60;
  if (variant === 1 || variant === 4) clock.hour = time.h12 / 12;
  if (variant === 2) clock.minute = Math.floor(time.minuteValue / 5) * 5 / 60;
  if (variant === 3) clock.second = steppedSecond(time.secondValue, time.ms, "hold");
  if (variant === 4 || variant === 9) clock.second = steppedSecond(time.secondValue, time.ms, "step");
  if (variant === 6) clock.second = steppedSecond(time.secondValue, time.ms, "half");
  const secondsVisible = ![7, 8].includes(variant);
  return <g><Dial /><Hand time={clock} unit={0} />{variant !== 8 && <Hand time={clock} unit={1} />}{secondsVisible && <Hand time={clock} unit={2} />}{
    variant === 0 ? <circle r="11" fill="none" stroke={INK} strokeWidth=".6" />
    : variant === 1 ? <path d={circleArc(23, time.hour - .018, time.hour + .018)} fill="none" stroke={RED} strokeWidth="1.2" />
    : variant === 2 ? <g><circle r="17" fill={PAPER} /><Text size={15}>{time.minuteValue % 5}</Text></g>
    : variant === 3 ? <circle r="7" fill={PAPER} stroke={INK} strokeWidth=".75" />
    : variant === 4 ? <circle r="8.5" fill="none" stroke={RED} strokeWidth=".7" />
    : variant === 5 ? <circle r={6 + 14 * (1 - smooth(time.ms / 300))} opacity={.15 + .5 * (1 - smooth(time.ms / 300))} fill="none" stroke={RED} strokeWidth=".9" />
    : variant === 6 ? <circle r="9" fill="none" stroke={INK} strokeWidth=".7" strokeDasharray="1 3" />
    : variant === 7 ? <><path d={circleArc(24 + time.second * 39, -.012, .988)} fill="none" stroke={RED} strokeWidth="1" /><circle r="17" fill="none" stroke={INK} strokeWidth=".5" /></>
    : variant === 8 ? <><Text y={27} size={20}>{pad(time.minuteValue)}</Text><SecondDot time={time} radius={88} size={1.8} /></>
    : <circle cx={polar(89, (time.secondValue + time.ms / 1000) / 60).x} cy={polar(89, (time.secondValue + time.ms / 1000) / 60).y} r="1.7" fill={RED} />
  }{variant !== 2 && <Hub />}</g>;
}

function HorizontalScale({ y, value, maximum, red = false, reverse = false, length = 146, labels = true }: { y: number; value: number; maximum: number; red?: boolean; reverse?: boolean; length?: number; labels?: boolean }) {
  const position = -length / 2 + (reverse ? 1 - value / maximum : value / maximum) * length;
  return <g><path d={`M ${-length / 2} ${y} H ${length / 2}`} stroke={INK} strokeWidth=".8" />{Array.from({ length: 13 }, (_, index) => <path key={index} d={`M ${-length / 2 + index * length / 12} ${y} v ${index % 3 === 0 ? 8 : 4}`} stroke={INK} strokeWidth={index % 3 === 0 ? 1.1 : .6} />)}{labels && [0, .5, 1].map(fraction => <Text key={fraction} x={-length / 2 + fraction * length} y={y + 17} size={9}>{Math.round((reverse ? 1 - fraction : fraction) * maximum)}</Text>)}<path d={`M ${position - 3} ${y - 7} L ${position} ${y - 1} L ${position + 3} ${y - 7}`} fill={red ? RED : INK} /></g>;
}

export function RulersFace({ time, variant }: FaceProps) {
  const currentHour = time.h24 + time.minute;
  const currentMinute = time.minuteValue + time.second;
  return <g>{
    variant === 0 ? <><HorizontalScale y={-54} value={currentHour} maximum={24} /><HorizontalScale y={6} value={currentMinute} maximum={60} /><HorizontalScale y={62} value={time.second * 60} maximum={60} red labels={false} /><Text x={-73} y={-78} anchor="start" size={17}>{pad(time.h24)}</Text><Text x={73} y={-20} anchor="end" size={17}>{pad(time.minuteValue)}</Text></>
    : variant === 1 ? <><HorizontalScale y={0} value={currentHour} maximum={24} /><g transform="rotate(-90)"><HorizontalScale y={0} value={currentMinute} maximum={60} labels={false} /></g><Text x={-49} y={-57} size={28}>{pad(time.h24)}</Text><Text x={49} y={53} size={28}>{pad(time.minuteValue)}</Text><circle cx={-73 + time.second * 146} cy="84" r="2" fill={RED} /></>
    : variant === 2 ? <><path d="M -8 -75 V 75" stroke={INK} />{Array.from({ length: 25 }, (_, index) => <path key={index} d={`M -8 ${-75 + index * 6.25} h ${index % 6 === 0 ? 11 : 5}`} stroke={INK} strokeWidth=".7" />)}<circle cx="-8" cy={-75 + currentHour / 24 * 150} r="3" fill={INK} /><Text x={25} y={-75 + currentHour / 24 * 150} size={21}>{pad(time.minuteValue)}</Text><Text x={-42} y={-75 + currentHour / 24 * 150} size={28}>{pad(time.h24)}</Text><Text y={90} ink={RED} size={12}>{pad(time.secondValue)}</Text></>
    : variant === 3 ? <><Text y={-45} size={59}>{pad(time.h24)}</Text><HorizontalScale y={22} value={currentMinute} maximum={60} reverse /><Text y={78} ink={RED} size={14}>{pad(time.secondValue)}</Text></>
    : variant === 4 ? <><Text x={-35} y={-38} size={74}>{pad(time.h24)}</Text><HorizontalScale y={33} value={currentMinute} maximum={60} /><Text x={65} y={-13} size={18} ink={RED}>{pad(time.secondValue)}</Text></>
    : variant === 5 ? <>{[currentHour / 24, currentMinute / 60].map((fraction, index) => <g key={index} transform={`translate(0 ${index === 0 ? -36 : 36})`}><path d="M -75 0 H -6 M 6 0 H 75" stroke={INK} />{Array.from({ length: 13 }, (_, mark) => <path key={mark} d={`M ${-75 + mark * 12.5} 0 v 6`} stroke={INK} strokeWidth=".6" />)}<circle cx={-75 + fraction * 150} cy="0" r="3" fill={index ? RED : INK} /><Text y={-22} size={24}>{pad(index ? time.minuteValue : time.h24)}</Text></g>)}</>
    : variant === 6 ? <><path d="M -32 -75 V 75 M 32 -75 V 75" stroke={INK} strokeWidth=".7" />{Array.from({ length: 13 }, (_, mark) => <path key={mark} d={`M -36 ${-75 + mark * 12.5} h 8 M 28 ${-75 + mark * 12.5} h 8`} stroke={INK} strokeWidth=".7" />)}<Text x={-55} y={-75 + time.day * 150} size={21}>{pad(time.h24)}</Text><Text x={55} y={75 - time.minute * 150} size={21}>{pad(time.minuteValue)}</Text><path d={`M -32 ${-75 + time.day * 150} L 32 ${75 - time.minute * 150}`} stroke={RED} strokeWidth="1" /></>
    : variant === 7 ? <><HorizontalScale y={-16} value={time.h12 + time.minute} maximum={12} /><path d="M -73 49 H 73" stroke={INK} strokeWidth=".5" /><path d={`M -73 49 H ${-73 + time.minute * 146}`} stroke={RED} strokeWidth="1.4" /><Text y={-56} size={37}>{pad(time.h24)}:{pad(time.minuteValue)}</Text></>
    : variant === 8 ? <><path d="M -60 -71 V 60 H 78" fill="none" stroke={INK} strokeWidth="1" />{Array.from({ length: 13 }, (_, index) => <path key={index} d={`M -60 ${-70 + index * 10.8} h 5 M ${-60 + index * 11.5} 60 v -5`} stroke={INK} strokeWidth=".7" />)}<circle cx="-60" cy={60 - time.day * 130} r="3" fill={INK} /><circle cx={-60 + time.minute * 138} cy="60" r="2.5" fill={RED} /><Readout time={time} y={-13} size={30} /></>
    : <><Text y={-28} size={64}>{pad(time.h24)}</Text><path d="M -76 35 H 76 M -76 46 H 76" stroke={INK} strokeWidth=".8" /><path d={`M ${-76 + time.minute * 152} 29 v 23`} stroke={INK} strokeWidth="2" /><Text y={73} size={18}>{pad(time.minuteValue)}</Text><circle cx={-76 + time.second * 152} cy="40.5" r="2" fill={RED} /></>
  }</g>;
}
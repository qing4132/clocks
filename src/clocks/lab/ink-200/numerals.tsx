import { AllHands, Face, Hand, Hub, INK, Numerals, PAPER, Text, Ticks, pad, type FaceProps } from "./shared";
import { polar } from "./geometry";

export function NumeralsFace({ time, variant }: FaceProps) {
  const offset = variant === 3 ? -time.minute : 0;
  const hourIndex = time.h12;
  return <g><Face />{variant !== 7 && <Ticks offset={offset} />}{
    variant === 0 ? Array.from({ length: 12 }, (_, index) => { const place = polar(70, index / 12); const active = index === hourIndex || index === (hourIndex + 1) % 12; return <Text key={index} x={place.x} y={place.y} size={active ? 18 : 11}>{index || 12}</Text>; })
    : variant === 1 ? <><Numerals radius={74} size={12} minute /><Text y={26} size={21}>{pad(time.h24)}</Text></>
    : variant === 2 ? Array.from({ length: 12 }, (_, index) => { const place = polar(index % 2 ? 64 : 76, index / 12); return <Text key={index} x={place.x} y={place.y} size={index % 2 ? 12 : 15}>{index || 12}</Text>; })
    : variant === 3 ? <Numerals offset={offset} />
    : variant === 4 ? Array.from({ length: 12 }, (_, index) => { const place = polar(70, index / 12); return <g key={index} transform={`translate(${place.x} ${place.y}) rotate(${index * 30 + 180})`}><Text>{index || 12}</Text></g>; })
    : variant === 5 ? <Text y={-64} size={32}>12</Text>
    : variant === 6 ? <><Numerals radius={53} size={13} /><Numerals radius={76} size={9} minute /></>
    : variant === 7 ? <><Ticks opacity={.7} />{Array.from({ length: 12 }, (_, index) => { const place = polar(70, index / 12); const distance = Math.abs(((time.hour * 12 - index + 18) % 12) - 6); return <Text key={index} x={place.x} y={place.y} size={14} weight={distance < .65 ? 700 : 400} opacity={distance < .65 ? 1 : .6}>{index || 12}</Text>; })}</>
    : variant === 8 ? [0, 1, 2, 3].map(index => { const place = polar(66, index / 4); return <Text key={index} x={place.x} y={place.y} size={27}>{[12, 3, 6, 9][index]}</Text>; })
    : <Numerals size={11} />
  }{variant === 1 ? <><Hand time={time} unit={1} /><Hand time={time} unit={2} /><Hub /></> : variant === 3 ? <><Hand time={time} unit={0} offset={offset} /><Hand time={time} unit={1} offset={offset} /><Hand time={time} unit={2} offset={offset} /><Hub /></> : <AllHands time={time} />}{variant === 9 && [time.hour, time.minute].map((fraction, index) => { const place = polar(index === 0 ? 50 : 74, fraction); return <g key={index}><circle cx={place.x} cy={place.y} r={index === 0 ? 10 : 9} fill={PAPER} stroke={INK} strokeWidth=".8" /><Text x={place.x} y={place.y} size={index === 0 ? 11 : 10}>{pad(index === 0 ? time.h24 : time.minuteValue)}</Text></g>; })}</g>;
}
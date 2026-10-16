import { intervalState, nextMinuteBoundary, duration } from "../open-200/motion-intervals";
import { AllHands, Dial, Face, Hand, Hub, INK, PAPER, RED, Readout, SecondDot, Text, pad, type FaceProps } from "./shared";
import { circleArc, path, polar } from "./geometry";

export function civilState(date: Date) {
  const year = date.getFullYear();
  const yearStart = new Date(date);
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);
  const yearEnd = new Date(yearStart);
  yearEnd.setFullYear(year + 1);
  const day = intervalState(date);
  return {
    daysInMonth: new Date(year, date.getMonth() + 1, 0).getDate(),
    daysInYear: (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000,
    weekday: (date.getDay() + 6) % 7,
    dayProgress: day.elapsed / day.dayLength,
    yearProgress: (date.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime()),
  };
}

export function CivilFace({ time, variant }: FaceProps) {
  const date = time.date;
  const state = civilState(date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const noonPhase = .022 + ((time.day + .5) % 1) * .956;
  return <g data-days-in-month={state.daysInMonth} data-local-weekday={state.weekday + 1}>{
    variant === 0 ? <><Face />{Array.from({ length: 24 }, (_, index) => { const start = polar(91, index / 24); const end = polar(index % 3 === 0 ? 82 : 85, index / 24); const label = polar(73, index / 24); return <g key={index}><path d={path([start, end])} stroke={INK} strokeWidth={index % 3 === 0 ? 1.9 : .9} /><Text x={label.x} y={label.y} size={10}>{index || 24}</Text></g>; })}{Array.from({ length: 60 }, (_, index) => { const start = polar(58, index / 60); const end = polar(index % 5 === 0 ? 54 : 56, index / 60); return <path key={index} d={path([start, end])} stroke={INK} strokeWidth=".6" />; })}<Hand time={{ ...time, hour: time.day }} unit={0} tip={78} width={3.5} /><Hand time={time} unit={1} tip={52} width={2} /><Hand time={time} unit={2} /><Hub /></>
    : variant === 1 ? <><Face rim={false} /><path d="M -90 0 A 90 90 0 0 0 90 0 Z" fill={INK} opacity={.055} />{[0, 1].map(half => <path key={half} d={circleArc(90, half * .5 + .01, (half + 1) * .5 - .01)} fill="none" stroke={INK} strokeWidth={half === 0 ? .8 : 2} />)}{Array.from({ length: 8 }, (_, index) => { const label = polar(73, index / 8); return <Text key={index} x={label.x} y={label.y} size={12}>{index * 3 || 24}</Text>; })}<Hand time={{ ...time, hour: time.day }} unit={0} tip={61} width={3} /><Hub /><Text y={33} size={19}>{pad(time.minuteValue)}</Text><SecondDot time={time} radius={90} size={2} /></>
    : variant === 2 ? <><path d={circleArc(87, .022, .978)} fill="none" stroke={INK} strokeWidth="1.2" />{Array.from({ length: 24 }, (_, index) => { const fraction = .022 + ((index / 24 + .5) % 1) * .956; const marker = polar(87, fraction); const label = polar(72, fraction); return <g key={index}><circle cx={marker.x} cy={marker.y} r={index % 3 === 0 ? 1.4 : .7} fill={INK} /><Text x={label.x} y={label.y} size={10}>{index || 24}</Text></g>; })}<circle cx={polar(87, noonPhase).x} cy={polar(87, noonPhase).y} r="3.3" fill={INK} /><Readout time={time} y={-6} size={35} /><Text y={30} size={15} ink={RED}>{pad(time.secondValue)}</Text></>
    : variant === 3 ? <><Text y={-44} size={57}>{pad(time.h24)}</Text>{Array.from({ length: 24 }, (_, index) => <g key={index}><path d={`M ${-81 + index * 6.8} 3 h 4.9`} stroke={INK} strokeWidth={index === time.h24 ? 2 : .7} />{index % 6 === 0 && <Text x={-81 + index * 6.8} y={20} size={9}>{pad(index)}</Text>}</g>)}<circle cx={-81 + time.h24 * 6.8} cy="-4" r="2.1" fill={INK} /><circle cx={-81 + (time.h24 + time.minute) * 6.8} cy="3" r="1.6" fill={RED} /><Text y={58} size={31}>{pad(time.minuteValue)}</Text></>
    : variant === 4 ? <><Dial /><AllHands time={time} seconds={false} /><circle r="20" fill={PAPER} /><Text y={-4} size={25}>{pad(day)}</Text><Text y={15} size={8}>{pad(month)}</Text><SecondDot time={time} radius={91} size={2} /></>
    : variant === 5 ? <>{Array.from({ length: 7 }, (_, index) => { const label = polar(81, (index + .5) / 7); return <g key={index}><path d={circleArc(94, (index + .045) / 7, (index + .955) / 7)} fill="none" stroke={INK} strokeWidth={index === state.weekday ? 2.8 : .7} opacity={index === state.weekday ? 1 : .4} /><Text x={label.x} y={label.y} size={11} weight={index === state.weekday ? 700 : 400}>{index + 1}</Text></g>; })}<circle r="70" fill="none" stroke={INK} strokeWidth=".55" /><Hand time={time} unit={0} tip={40} /><Hand time={time} unit={1} tip={64} width={2} /><Hub /><SecondDot time={time} radius={70} size={1.7} /></>
    : variant === 6 ? <><circle r="94" fill="none" stroke={INK} strokeWidth=".65" />{Array.from({ length: state.daysInMonth }, (_, index) => { const start = polar(92, index / state.daysInMonth); const end = polar(index + 1 === day ? 79 : 86, index / state.daysInMonth); const label = polar(72, index / state.daysInMonth); return <g key={index}><path d={path([start, end])} stroke={index + 1 === day ? RED : INK} strokeWidth={index + 1 === day ? 1.8 : .8} />{(index % 5 === 0 || index + 1 === day) && <Text x={label.x} y={label.y} size={10} ink={index + 1 === day ? RED : INK}>{index + 1}</Text>}</g>; })}<Readout time={time} y={-6} size={34} /><Text y={28} size={14}>{pad(month)}.{pad(day)}</Text><SecondDot time={time} radius={58} size={1.5} /></>
    : variant === 7 ? <><Text y={-66} size={19}>{date.getFullYear()}</Text><Readout time={time} y={-18} size={41} /><path d="M -81 37 H 81" stroke={INK} strokeWidth=".6" opacity={.3} /><path d={`M -81 37 H ${-81 + state.yearProgress * 162}`} stroke={INK} strokeWidth="1.2" />{[0, .25, .5, .75, 1].map(fraction => <path key={fraction} d={`M ${-81 + fraction * 162} 33 v 8`} stroke={INK} strokeWidth=".6" />)}<Text y={71} size={19}>{pad(month)}.{pad(day)}</Text><circle cx={-81 + time.second * 162} cy="90" r="1.6" fill={RED} /></>
    : variant === 8 ? <><circle r="86" fill="none" stroke={INK} strokeWidth=".6" opacity={.25} /><path d={circleArc(86, 0, state.dayProgress)} fill="none" stroke={INK} strokeWidth="1.9" /><Readout time={time} y={-7} size={39} /><Text y={30} size={15}>{pad(month)}.{pad(day)}</Text><SecondDot time={time} radius={62} size={1.6} /></>
    : <>{[0, 1].map(half => <g key={half} opacity={Math.floor(time.h24 / 12) === half ? 1 : .3}><path d={`M -79 ${half === 0 ? -37 : 37} H 79`} stroke={INK} strokeWidth=".8" />{Array.from({ length: 13 }, (_, index) => <g key={index}><path d={`M ${-79 + index / 12 * 158} ${half === 0 ? -37 : 37} v ${half === 0 ? -5 : 5}`} stroke={INK} strokeWidth=".7" />{index % 3 === 0 && <Text x={-79 + index / 12 * 158} y={half === 0 ? -59 : 59} size={12}>{index + half * 12}</Text>}</g>)}{Math.floor(time.h24 / 12) === half && <circle cx={-79 + time.hour * 158} cy={half === 0 ? -37 : 37} r="3.1" fill={INK} />}</g>)}<Readout time={time} y={-1} size={32} /><SecondDot time={time} radius={89} size={1.7} /></>
  }</g>;
}

export function IntervalsFace({ time, variant }: FaceProps) {
  const state = intervalState(time.date);
  const nextHour = new Date(nextMinuteBoundary(time.date, 60)).getHours();
  const elapsed = state.elapsed / state.dayLength;
  return <g data-minute-remaining={state.minute} data-hour-remaining={state.hour} data-midnight-remaining={state.day}>{
    variant === 0 ? <><Dial /><AllHands time={time} seconds={false} /><path d={circleArc(94, 1 - state.minute / 60, 1)} fill="none" stroke={RED} strokeWidth="1.3" /></>
    : variant === 1 ? <><Text x={-62} y={-50} size={34}>{pad(time.h24)}</Text><Text x={62} y={-50} size={34}>{pad(nextHour)}</Text><Text y={8} size={39}>{duration(state.hour)}</Text><path d="M -77 50 H 77" stroke={INK} strokeWidth=".65" /><circle cx={-77 + (1 - Math.min(1, state.hour / 3600)) * 154} cy="50" r="2.1" fill={RED} /></>
    : variant === 2 ? <><Text y={-53} size={17}>{pad(time.date.getMonth() + 1)}.{pad(time.date.getDate())}</Text><Text y={-5} size={34}>{duration(state.day, true)}</Text><path d="M -80 41 H 80" stroke={INK} strokeWidth=".6" opacity={.25} /><path d={`M -80 41 H ${-80 + state.day / state.dayLength * 160}`} stroke={INK} strokeWidth="1.2" /><Text y={75} size={17} ink={RED}>00:00</Text></>
    : variant === 3 ? <>{Array.from({ length: 4 }, (_, index) => { const current = Math.floor(time.minuteValue / 15); return <g key={index}><path d={circleArc(86, index / 4 + .013, (index + 1) / 4 - .013)} fill="none" stroke={INK} strokeWidth=".65" opacity={.3} /><path d={circleArc(86, index / 4 + .013, index / 4 + .013 + .224 * (index === current ? state.quarter / 900 : 1))} fill="none" stroke={INK} strokeWidth={index === current ? 2.2 : .65} opacity={index < current ? .2 : 1} /></g>; })}<Readout time={time} y={-12} size={37} /><Text y={28} size={18} ink={RED}>{duration(state.quarter)}</Text></>
    : variant === 4 ? <><Readout time={time} y={-43} size={38} /><circle cy="44" r="33" fill="none" stroke={INK} strokeWidth=".65" />{Array.from({ length: 5 }, (_, index) => { const label = polar(44, index / 5, 0, 44); return <Text key={index} x={label.x} y={label.y} size={11}>{index || 5}</Text>; })}<line x1="0" y1="44" x2={polar(29, state.five / 300, 0, 44).x} y2={polar(29, state.five / 300, 0, 44).y} stroke={RED} strokeWidth="1.3" /><circle cy="44" r="2.3" fill={INK} /></>
    : variant === 5 ? <>{[-1, 0, 1].map(offset => { const adjacent = new Date(time.date.getTime() + offset * 60_000); return <Text key={offset} y={offset * 55} size={offset === 0 ? 48 : 23} opacity={offset === 0 ? 1 : .35}>{pad(adjacent.getHours())}:{pad(adjacent.getMinutes())}</Text>; })}<path d={`M -64 29 H ${-64 + time.second * 128}`} stroke={RED} strokeWidth="1.1" /></>
    : variant === 6 ? <><Readout time={time} y={-49} size={39} /><path d="M -79 0 H -5 M 5 0 H 79" stroke={INK} strokeWidth=".6" opacity={.25} /><path d={`M -5 0 h ${-74 * elapsed} M 5 0 h ${74 * (1 - elapsed)}`} stroke={INK} strokeWidth="1.7" /><Text x={-44} y={27} size={14}>{duration(Math.floor(state.elapsed), true)}</Text><Text x={44} y={27} size={14}>{duration(state.day, true)}</Text><circle cx={-79 + time.second * 158} cy="70" r="1.7" fill={RED} /></>
    : variant === 7 ? <><Readout time={time} y={-39} size={40} /><Text y={36} size={29}>{pad(time.secondValue)}</Text><circle cy="36" r="30" fill="none" stroke={INK} strokeWidth=".5" /><path d={circleArc(30, 0, time.ms / 1000, 0, 36)} fill="none" stroke={RED} strokeWidth="1.4" /></>
    : variant === 8 ? <><Text x={-64} y={-22} size={31}>{pad(time.h24)}</Text><Text x={64} y={-22} size={31}>{pad(nextHour)}</Text><Text y={-22} size={23}>{pad(time.minuteValue)}</Text><path d="M -79 25 H 79" stroke={INK} strokeWidth=".8" />{Array.from({ length: 13 }, (_, index) => <path key={index} d={`M ${-79 + index / 12 * 158} 21 v 8`} stroke={INK} strokeWidth=".6" />)}<circle cx={-79 + (1 - Math.min(1, state.hour / 3600)) * 158} cy="25" r="2.3" fill={RED} /><Text y={72} size={14}>{pad(time.secondValue)}</Text></>
    : <><Text y={-42} size={48}>{duration(state.minute)}</Text><path d="M -69 0 H 69" stroke={INK} strokeWidth=".6" /><Text y={42} size={38}>{duration(state.hour)}</Text><path d={`M -69 0 H ${-69 + state.minute / 60 * 138}`} stroke={RED} strokeWidth="1.2" /></>
  }</g>;
}
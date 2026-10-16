import { arc, Ground, pad, point, poly, Readout, Text, theme, unitFractions, unitValues, type FaceProps } from "./shared";

export function MotionFace({ time, variant, uid }: FaceProps) {
  const colors = theme(variant);
  const fractions = unitFractions(time);
  const values = unitValues(time);
  const inks = [colors.ink, colors.accent, colors.second];
  const phase = time.second * Math.PI * 2;
  return <g><Ground colors={colors} />{
    variant === 0 ? <g>{values.map((value, index) => { const centerX = 46 + index * 54; const fraction = [time.minute, time.second, time.ms / 1000][index]; const rotation = fraction * Math.PI * 2; return <g key={index}><ellipse cx={centerX} cy="94" rx="23" ry="42" fill={colors.pale} stroke={inks[index]} /><path d={poly(Array.from({ length: 41 }, (_, sample) => ({ x: centerX + Math.sin(sample / 40 * Math.PI) * 23, y: 94 - Math.cos(sample / 40 * Math.PI) * 42 })))} fill="none" stroke={inks[index]} strokeWidth="1" /><Text x={centerX + Math.sin(rotation) * 3} y={94 + Math.cos(rotation) * 4} size={29} mono color={inks[index]}>{pad(value)}</Text><circle cx={centerX + Math.cos(rotation) * 20} cy={94 + Math.sin(rotation) * 38} r="2.5" fill={inks[index]} /></g>; })}<path d="M 25 149 H 175" stroke={colors.pale} /><Readout time={time} colors={colors} y={178} size={12} /></g>
    : variant === 1 ? <g>{fractions.map((fraction, index) => { const position = point(30 + index * 23, fraction, 100, 94); return <g key={index}><circle cx="100" cy="94" r={30 + index * 23} fill="none" stroke={colors.pale} /><circle cx={position.x} cy={position.y} r="12" fill={colors.paper} /><Text x={position.x} y={position.y} size={index === 0 ? 20 : 15} mono color={inks[index]}>{pad(values[index])}</Text></g>; })}<Readout time={time} colors={colors} y={184} size={11} /></g>
    : variant === 2 ? <g>{values.map((value, index) => <g key={index} transform={`rotate(${Math.sin(phase + index * .7) * (7 + index * 3)} ${43 + index * 57} 86)`}><path d={`M ${43 + index * 57} 30 V 61`} stroke={inks[index]} strokeWidth=".8" /><circle cx={43 + index * 57} cy="28" r="2" fill={inks[index]} /><Text x={43 + index * 57} y={102} size={43 - index * 4} color={inks[index]}>{pad(value)}</Text><path d={`M ${23 + index * 57} 130 h 40`} stroke={inks[index]} /></g>)}<Readout time={time} colors={colors} y={177} size={12} /></g>
    : variant === 3 ? <g>{fractions.map((fraction, index) => { const baseX = 47 + index * 53; const length = 29 + fraction * 75; const spring = Array.from({ length: 41 }, (_, step) => ({ x: baseX + (step === 0 || step === 40 ? 0 : step % 2 ? 7 : -7), y: 36 + step / 40 * length })); return <g key={index}><path d={`M ${baseX - 15} 30 H ${baseX + 15}`} stroke={inks[index]} strokeWidth="2" /><path d={poly(spring)} stroke={inks[index]} strokeWidth="1.3" fill="none" /><rect x={baseX - 15} y={39 + length} width="30" height="27" fill={inks[index]} /><Text x={baseX} y={52.5 + length} size={15} mono color={colors.paper}>{pad(values[index])}</Text></g>; })}</g>
    : variant === 4 ? <g><path d="M 48 35 H 152" stroke={colors.ink} strokeWidth="3" /><path d={arc(109, -.095, .095, 100, 35)} fill="none" stroke={colors.pale} strokeWidth="1.3" />{(() => { const angle = Math.sin(phase) * .68; const position = { x: 100 + Math.sin(angle) * 90, y: 35 + Math.cos(angle) * 90 }; return <g><line x1="100" y1="35" x2={position.x} y2={position.y} stroke={colors.ink} strokeWidth="2" /><circle cx={position.x} cy={position.y} r="20" fill={colors.accent} /><Text x={position.x} y={position.y} size={22} color={colors.paper} mono>{pad(time.minuteValue)}</Text></g>; })()}<circle cx="100" cy="35" r="4" fill={colors.ink} /><Readout time={time} colors={colors} y={178} size={17} /></g>
    : variant === 5 ? <g><defs><clipPath id={`${uid}-conveyor`}><rect x="22" y="29" width="156" height="127" /></clipPath></defs>{values.map((value, index) => <g key={index}><rect x="22" y={34 + index * 46} width="156" height="32" fill={colors.pale} /><g clipPath={`url(#${uid}-conveyor)`}>{[-2, -1, 0, 1, 2].map(offset => <Text key={offset} x={100 + offset * 54 - time.second * 8} y={50 + index * 46} size={21} mono color={offset === 0 ? inks[index] : colors.ink} opacity={offset === 0 ? 1 : .24}>{pad((value + offset + (index === 0 ? 24 : 60)) % (index === 0 ? 24 : 60))}</Text>)}</g><path d={`M 78 ${31 + index * 46} v 38 M 119 ${31 + index * 46} v 38`} stroke={inks[index]} strokeWidth="1" /></g>)}<Readout time={time} colors={colors} y={184} size={11} /></g>
    : variant === 6 ? <g>{fractions.map((fraction, index) => { const centerX = 47 + index * 53; const level = 139 - fraction * 90; return <g key={index}><path d={`M ${centerX - 19} 28 V 162 M ${centerX + 19} 28 V 162`} stroke={colors.pale} strokeWidth="2" /><path d={`M ${centerX} 28 V ${level}`} stroke={inks[index]} /><rect x={centerX - 17} y={level - 14} width="34" height="29" fill={inks[index]} /><Text x={centerX} y={level} size={17} mono color={colors.paper}>{pad(values[index])}</Text><path d={`M ${centerX - 19} 162 h 38`} stroke={inks[index]} strokeWidth="2" /></g>; })}</g>
    : variant === 7 ? <g>{Array.from(`${pad(time.h24)}${pad(time.minuteValue)}`).map((digit, index) => { const scale = 1 + Math.sin(phase + index * .85) * .16; return <g key={index} transform={`translate(${38 + index * 42} 101) scale(1 ${scale})`}><Text x={0} y={0} size={56} color={index < 2 ? colors.ink : colors.accent}>{digit}</Text><path d="M -16 38 H 16" stroke={colors.pale} /></g>; })}<Text y={164} size={17} mono color={colors.second}>{pad(time.secondValue)}</Text></g>
    : variant === 8 ? <g>{fractions.map((fraction, index) => { const level = 46 + index * 51; const path = Array.from({ length: 91 }, (_, sample) => ({ x: 25 + sample / 90 * 150, y: level + Math.sin(sample / 90 * Math.PI * 2) * 12 })); const position = { x: 25 + fraction * 150, y: level + Math.sin(fraction * Math.PI * 2) * 12 }; return <g key={index}><path d={poly(path)} fill="none" stroke={colors.pale} strokeWidth="1.5" />{Array.from({ length: 13 }, (_, tick) => <circle key={tick} cx={25 + tick / 12 * 150} cy={level + Math.sin(tick / 12 * Math.PI * 2) * 12} r="1.5" fill={inks[index]} />)}<circle cx={position.x} cy={position.y} r="7" fill={inks[index]} /><Text x={177} y={level - 21} size={14} mono anchor="end" color={inks[index]}>{pad(values[index])}</Text></g>; })}</g>
    : <g><defs><clipPath id={`${uid}-falling`}><rect x="27" y="26" width="146" height="125" /></clipPath></defs><g clipPath={`url(#${uid}-falling)`}>{Array.from({ length: 13 }, (_, index) => { const value = (time.secondValue - index + 60) % 60; const horizontal = 34 + index % 4 * 39; const level = 30 + Math.floor(index / 4) * 30 + time.ms / 1000 * 9; return <Text key={index} x={horizontal} y={level} size={index === 0 ? 23 : 15} color={index === 0 ? colors.second : colors.accent} opacity={1 - index / 16} mono>{pad(value)}</Text>; })}</g><path d="M 25 151 H 175" stroke={colors.ink} strokeWidth="1.4" /><Text y={178} size={24} mono color={colors.ink}>{pad(time.h24)}:{pad(time.minuteValue)}</Text></g>
  }</g>;
}

export function nextMinuteBoundary(date: Date, step: number) {
  let candidate = date.getTime();
  let current = date;
  for (let attempt = 0; attempt < 4; attempt++) {
    const remainder = (current.getMinutes() % step) * 60_000 + current.getSeconds() * 1000 + current.getMilliseconds();
    candidate += step * 60_000 - remainder;
    current = new Date(candidate);
    if (current.getMinutes() % step === 0 && current.getSeconds() === 0) return candidate;
  }
  return candidate;
}

export function intervalState(date: Date) {
  const now = date.getTime();
  const midnight = new Date(date);
  midnight.setHours(24, 0, 0, 0);
  const dawn = new Date(date);
  dawn.setHours(0, 0, 0, 0);
  return {
    minute: (nextMinuteBoundary(date, 1) - now) / 1000,
    hour: (nextMinuteBoundary(date, 60) - now) / 1000,
    quarter: (nextMinuteBoundary(date, 15) - now) / 1000,
    five: (nextMinuteBoundary(date, 5) - now) / 1000,
    day: (midnight.getTime() - now) / 1000,
    elapsed: (now - dawn.getTime()) / 1000,
    dayLength: (midnight.getTime() - dawn.getTime()) / 1000,
  };
}

export function duration(seconds: number, hours = false) {
  const total = Math.max(0, Math.ceil(seconds));
  return hours
    ? `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total % 3600 / 60))}:${pad(total % 60)}`
    : `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function IntervalsFace({ time, variant }: FaceProps) {
  const colors = theme(variant);
  const state = intervalState(time.date);
  return <g><Ground colors={colors} />{
    variant === 0 ? <g><circle cx="100" cy="88" r="64" fill="none" stroke={colors.pale} strokeWidth="6" /><path d={arc(64, 0, state.minute / 60, 100, 88)} fill="none" stroke={colors.accent} strokeWidth="6" strokeLinecap="round" /><Text y={84} size={48} color={colors.ink}>{pad(Math.ceil(state.minute))}</Text><Text y={116} size={10} mono color={colors.accent}>s</Text><Readout time={time} colors={colors} y={178} size={19} /></g>
    : variant === 1 ? <g>{Array.from({ length: 60 }, (_, index) => { const first = point(82, index / 60, 100, 91); const last = point(72, index / 60, 100, 91); return <line key={index} x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke={index < state.hour / 60 ? colors.accent : colors.pale} strokeWidth="3" />; })}<Text y={89} size={30} mono color={colors.ink}>{duration(state.hour)}</Text><Text y={121} size={10} color={colors.accent} mono>to :00</Text><Readout time={time} colors={colors} y={186} size={13} /></g>
    : variant === 2 ? <g><Text y={42} size={11} color={colors.accent} mono>to 00:00</Text><Text y={94} size={30} color={colors.ink} mono>{duration(state.day, true)}</Text><rect x="25" y="125" width="150" height="11" fill={colors.pale} /><rect x="25" y="125" width={150 * state.day / state.dayLength} height="11" fill={colors.accent} /><Readout time={time} colors={colors} y={171} size={16} /></g>
    : variant === 3 ? <g>{[0, 1, 2, 3].map(quarter => <path key={quarter} d={arc(74, quarter / 4 + .012, (quarter + 1) / 4 - .012, 100, 91)} fill="none" stroke={quarter === Math.floor(time.minuteValue / 15) ? colors.accent : colors.pale} strokeWidth="12" />)}<Text y={85} size={29} color={colors.ink} mono>{duration(state.quarter)}</Text><Text y={115} size={10} color={colors.accent} mono>to quarter</Text><Readout time={time} colors={colors} y={185} size={14} /></g>
    : variant === 4 ? <g>{Array.from({ length: 5 }, (_, index) => { const remaining = Math.max(0, Math.min(1, state.five / 60 - index)); return <g key={index}><rect x={29 + index * 30} y="40" width="22" height="96" fill={colors.pale} /><rect x={29 + index * 30} y={136 - remaining * 96} width="22" height={remaining * 96} fill={colors.accent} /><Text x={40 + index * 30} y={150} size={10} mono color={colors.ink}>{index + 1}</Text></g>; })}<Text y={176} size={20} mono color={colors.ink}>{duration(state.five)}</Text><Text y={22} size={11} mono color={colors.second}>{pad(time.h24)}:{pad(time.minuteValue)}</Text></g>
    : variant === 5 ? <g>{[-1, 0, 1].map(offset => { const date = new Date(time.date.getTime() + offset * 60_000); return <g key={offset}><rect x="26" y={39 + (offset + 1) * 43} width="148" height="35" fill={offset === 0 ? colors.ink : colors.pale} /><Text y={56.5 + (offset + 1) * 43} size={offset === 0 ? 31 : 21} color={offset === 0 ? colors.paper : colors.accent} mono>{pad(date.getHours())}:{pad(date.getMinutes())}</Text></g>; })}<path d={`M 26 179 h ${148 * state.minute / 60}`} stroke={colors.second} strokeWidth="3" /></g>
    : variant === 6 ? <g><Text x={43} y={73} size={38} color={colors.ink}>{pad(time.h24)}</Text><Text x={158} y={73} size={38} color={colors.accent}>{pad(new Date(nextMinuteBoundary(time.date, 60)).getHours())}</Text><path d="M 24 98 v 37 h 152 v -37" fill="none" stroke={colors.ink} strokeWidth="1.4" /><path d={`M 24 135 h ${152 * (1 - Math.min(1, state.hour / 3600))}`} stroke={colors.second} strokeWidth="4" /><Text y={114} size={22} color={colors.accent} mono>{duration(state.hour)}</Text><Readout time={time} colors={colors} y={180} size={13} /></g>
    : variant === 7 ? <g><path d="M 100 28 V 155" stroke={colors.pale} /><rect x="24" y="68" width={152 * state.elapsed / state.dayLength} height="42" fill={colors.ink} /><rect x={24 + 152 * state.elapsed / state.dayLength} y="68" width={152 * state.day / state.dayLength} height="42" fill={colors.accent} /><Text x={24} y={47} size={11} mono anchor="start" color={colors.ink}>{duration(state.elapsed, true)}</Text><Text x={176} y={132} size={11} mono anchor="end" color={colors.accent}>{duration(state.day, true)}</Text><Readout time={time} colors={colors} y={176} size={19} /></g>
    : variant === 8 ? <g><path d="M 66 36 H 134 V 145 H 66 Z" fill="none" stroke={colors.ink} strokeWidth="1.4" /><rect x="73" y={137 - time.ms / 1000 * 93} width="54" height={time.ms / 1000 * 93} fill={colors.accent} />{Array.from({ length: 11 }, (_, mark) => <path key={mark} d={`M 58 ${41 + mark * 9.3} h 8 M 134 ${41 + mark * 9.3} h 8`} stroke={colors.pale} />)}<Text y={91} size={30} color={colors.ink} mono>{pad(time.secondValue)}</Text><Readout time={time} colors={colors} y={178} size={18} /></g>
    : <g>{[{ label: ":00", remaining: state.minute, total: 60 }, { label: "00:00", remaining: state.hour, total: 3600 }, { label: "24:00", remaining: state.day, total: state.dayLength }].map((entry, index) => <g key={index}><Text x={24} y={32 + index * 49} size={9} mono anchor="start" color={colors.accent}>{entry.label}</Text><Text x={175} y={33 + index * 49} size={19} mono anchor="end" color={colors.ink}>{duration(entry.remaining, index === 2)}</Text><path d={`M 24 ${52 + index * 49} H 176`} stroke={colors.pale} strokeWidth="5" /><path d={`M 24 ${52 + index * 49} h ${152 * Math.min(1, entry.remaining / entry.total)}`} stroke={index === 2 ? colors.second : colors.accent} strokeWidth="5" /></g>)}<Readout time={time} colors={colors} y={185} size={12} /></g>
  }</g>;
}
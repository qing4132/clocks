import { arc, Ground, pad, point, poly, Readout, regularPolygon, Text, theme, unitFractions, unitValues, type FaceProps } from "./shared";

export function OrbitsFace({ time, variant }: FaceProps) {
  const colors = theme(variant);
  const fractions = unitFractions(time);
  const values = unitValues(time);
  const inks = [colors.ink, colors.accent, colors.second];
  const phase = time.second * Math.PI * 2;
  return <g><Ground colors={colors} round={variant !== 9} />{
    variant === 0 ? <g><circle cx="100" cy="94" r="55" fill="none" stroke={colors.pale} />{[time.hour, time.minute].map((fraction, index) => {
      const center = point(55, fraction, 100, 94);
      const marker = point(19, time.second + index / 2, center.x, center.y);
      return <g key={index}><circle cx={center.x} cy={center.y} r="19" fill="none" stroke={inks[index]} /><line x1="100" y1="94" x2={center.x} y2={center.y} stroke={inks[index]} strokeWidth="1.4" /><circle cx={center.x} cy={center.y} r="9" fill={inks[index]} /><Text x={center.x} y={center.y} size={8} mono color={colors.paper}>{pad(values[index])}</Text><circle cx={marker.x} cy={marker.y} r="3" fill={colors.second} /></g>;
    })}<Readout time={time} colors={colors} y={184} size={11} /></g>
    : variant === 1 ? <g>{[0, 1].map(index => {
      const position = point(index === 0 ? 31 : 63, time.minute + index / 2, 100, 95);
      return <g key={index}><circle cx="100" cy="95" r={index === 0 ? 31 : 63} fill="none" stroke={colors.pale} strokeDasharray="2 3" /><path d={`M 100 95 L ${position.x} ${position.y}`} stroke={inks[index]} /><circle cx={position.x} cy={position.y} r={index === 0 ? 15 : 10} fill={inks[index]} /><Text x={position.x} y={position.y} size={index === 0 ? 12 : 9} color={colors.paper} mono>{pad(values[index])}</Text></g>;
    })}<path d="M 95 95 h 10 M 100 90 v 10" stroke={colors.second} /><path d={arc(78, 0, time.second, 100, 95)} fill="none" stroke={colors.second} strokeWidth="2" /><Readout time={time} colors={colors} y={185} size={11} /></g>
    : variant === 2 ? <g>{fractions.map((fraction, index) => {
      const angle = fraction * Math.PI * 2;
      return <g key={index} transform={`rotate(${index * 60} 100 95)`}><ellipse cx="100" cy="95" rx="77" ry="29" fill="none" stroke={inks[index]} strokeWidth="1.2" /><circle cx={100 + Math.cos(angle) * 77} cy={95 + Math.sin(angle) * 29} r={5 - index * .6} fill={inks[index]} /></g>;
    })}<circle cx="100" cy="95" r="5" fill={colors.ink} /><Readout time={time} colors={colors} y={182} size={16} /></g>
    : variant === 3 ? <g><circle cx="71" cy="95" r="41" fill="none" stroke={colors.ink} /><circle cx="129" cy="95" r="41" fill="none" stroke={colors.accent} /><path d="M 29 95 C 70 8 130 182 171 95" fill="none" stroke={colors.pale} strokeWidth="6" />{fractions.map((fraction, index) => {
      const centerX = index === 0 ? 71 : 129;
      const marker = point(index === 2 ? 27 : 41, fraction, centerX, 95);
      return <g key={index}><circle cx={marker.x} cy={marker.y} r={index === 2 ? 4 : 10} fill={inks[index]} stroke={colors.paper} /><Text x={index === 2 ? 100 : centerX} y={index === 2 ? 174 : 95} size={index === 2 ? 13 : 19} color={inks[index]} mono>{pad(values[index])}</Text></g>;
    })}</g>
    : variant === 4 ? <g>{(() => {
      const first = point(46, time.hour, 100, 98);
      const second = point(22, time.minute, first.x, first.y);
      const third = point(10, time.second, second.x, second.y);
      return <g><circle cx="100" cy="98" r="46" fill="none" stroke={colors.pale} /><circle cx={first.x} cy={first.y} r="22" fill="none" stroke={colors.ink} /><circle cx={second.x} cy={second.y} r="10" fill="none" stroke={colors.accent} /><path d={poly([{ x: 100, y: 98 }, first, second, third])} fill="none" stroke={colors.ink} strokeWidth="1.3" /><circle cx={first.x} cy={first.y} r="6" fill={colors.ink} /><circle cx={second.x} cy={second.y} r="4" fill={colors.accent} /><circle cx={third.x} cy={third.y} r="3" fill={colors.second} /></g>;
    })()}<Readout time={time} colors={colors} y={182} size={17} /></g>
    : variant === 5 ? <g>{(() => {
      const vertices = fractions.map((fraction, index) => point(35 + index * 19, fraction, 100, 96));
      return <g>{vertices.map((vertex, index) => <circle key={index} cx="100" cy="96" r={35 + index * 19} fill="none" stroke={colors.pale} />)}<path d={poly(vertices, true)} fill={colors.accent} fillOpacity=".12" stroke={colors.accent} strokeWidth="1.5" />{vertices.map((vertex, index) => <g key={index}><circle cx={vertex.x} cy={vertex.y} r="9" fill={inks[index]} /><Text x={vertex.x} y={vertex.y} size={8} mono color={colors.paper}>{pad(values[index])}</Text></g>)}</g>;
    })()}<Text y={184} size={11} color={colors.ink} mono>{pad(time.h24)}:{pad(time.minuteValue)}:{pad(time.secondValue)}</Text></g>
    : variant === 6 ? <g>{[0, 1].map(index => {
      const position = { x: 100 + Math.cos(time.minute * Math.PI * 2 + index * Math.PI) * 54, y: 90 + Math.sin(time.minute * Math.PI * 2 + index * Math.PI) * 35 };
      return <g key={index}><ellipse cx="100" cy="90" rx="54" ry="35" fill="none" stroke={colors.pale} /><circle cx={position.x} cy={position.y} r={index === 0 ? 18 : 12} fill={inks[index]} /><circle cx={position.x} cy={position.y} r={index === 0 ? 23 : 17} fill="none" stroke={inks[index]} strokeDasharray="1 4" /><Text x={position.x} y={position.y} size={index === 0 ? 15 : 10} color={colors.paper} mono>{pad(values[index])}</Text></g>;
    })}<path d={arc(81, 0, time.second, 100, 90)} fill="none" stroke={colors.second} strokeWidth="2" /><Text y={178} size={18} mono color={colors.second}>{pad(time.secondValue)}</Text></g>
    : variant === 7 ? <g><circle cx="100" cy="94" r="72" fill="none" stroke={colors.pale} strokeWidth="9" strokeDasharray="3 3" />{[0, 1, 2].map(index => {
      const center = point(46, time.minute + index / 3, 100, 94);
      return <g key={index}><circle cx={center.x} cy={center.y} r="22" fill={colors.paper} stroke={inks[index]} strokeWidth="3" strokeDasharray="3 2" /><path d={poly(regularPolygon(3, 13, center.x, center.y), true)} fill="none" stroke={inks[index]} transform={`rotate(${time.second * 120} ${center.x} ${center.y})`} /><Text x={center.x} y={center.y} size={9} mono color={inks[index]}>{pad(values[index])}</Text></g>;
    })}<circle cx="100" cy="94" r="20" fill={colors.ink} /><Text y={94} size={14} mono color={colors.paper}>{pad(time.h24)}</Text><Text y={185} size={10} mono color={colors.ink}>{pad(time.minuteValue)}:{pad(time.secondValue)}</Text></g>
    : variant === 8 ? <g>{fractions.map((fraction, index) => {
      const major = 71 - index * 12;
      const minor = 25 + index * 7;
      const angle = fraction * Math.PI * 2;
      return <g key={index} transform={`rotate(${index * 33 - 25} 100 92)`}><ellipse cx="100" cy="92" rx={major} ry={minor} fill="none" stroke={inks[index]} strokeWidth="1" /><line x1={100 - major} y1="92" x2={100 + major} y2="92" stroke={colors.pale} strokeDasharray="2 4" /><circle cx={100 + major * Math.cos(angle)} cy={92 + minor * Math.sin(angle)} r="4" fill={inks[index]} /></g>;
    })}<Readout time={time} colors={colors} y={179} size={18} /></g>
    : <g>{fractions.map((fraction, index) => {
      const centerY = 47 + index * 51;
      const angle = fraction * Math.PI * 2;
      return <g key={index}><ellipse cx="92" cy={centerY} rx="63" ry="16" fill="none" stroke={colors.pale} strokeWidth="4" /><ellipse cx="92" cy={centerY} rx="63" ry="16" fill="none" stroke={inks[index]} strokeWidth=".7" /><circle cx={92 + Math.sin(angle) * 63} cy={centerY - Math.cos(angle) * 16} r="5" fill={inks[index]} /><Text x={172} y={centerY} size={15} color={inks[index]} mono>{pad(values[index])}</Text></g>;
    })}<path d={`M 26 ${181 + Math.sin(phase) * 2} H 177`} stroke={colors.pale} /></g>
  }</g>;
}

const WINDOW_NUMBERS: Record<string, string[]> = {
  "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"], "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"], "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"], "9": ["111", "101", "111", "001", "111"],
};

export function ArchitectureFace({ time, variant }: FaceProps) {
  const colors = theme(variant);
  const fractions = unitFractions(time);
  const values = unitValues(time);
  const inks = [colors.ink, colors.accent, colors.second];
  return <g><Ground colors={colors} />{
    variant === 0 ? <g><path d="M 25 160 V 36 L 100 20 L 175 36 V 160 Z" fill={colors.pale} stroke={colors.ink} />{Array.from({ length: 60 }, (_, index) => <rect key={index} x={35 + index % 10 * 13.4} y={47 + Math.floor(index / 10) * 16} width="8" height="10" fill={index < time.minuteValue ? colors.accent : colors.paper} />)}<rect x="83" y="135" width="34" height="25" fill={colors.ink} /><Text y={147} size={13} mono color={colors.paper}>{pad(time.h24)}</Text><Readout time={time} colors={colors} y={181} size={15} /></g>
    : variant === 1 ? <g><path d="M 66 164 V 46 H 134 V 164 M 56 164 H 144 M 76 46 V 27 H 124 V 46 M 100 27 V 17" fill={colors.pale} stroke={colors.ink} strokeWidth="1.2" /><circle cx="100" cy="73" r="22" fill={colors.paper} stroke={colors.ink} />{(() => { const hour = point(12, time.hour, 100, 73); const minute = point(18, time.minute, 100, 73); return <g><line x1="100" y1="73" x2={hour.x} y2={hour.y} stroke={colors.ink} strokeWidth="2.5" /><line x1="100" y1="73" x2={minute.x} y2={minute.y} stroke={colors.accent} strokeWidth="1.4" /></g>; })()}{Array.from({ length: 6 }, (_, index) => <rect key={index} x="89" y={108 + index * 7} width="22" height="4" fill={index < time.second * 6 ? colors.second : colors.paper} />)}<Readout time={time} colors={colors} y={183} size={12} /></g>
    : variant === 2 ? <g>{fractions.map((fraction, index) => {
      const level = 54 + index * 48;
      return <g key={index}><path d={`M 27 ${level + 13} V ${level} Q 100 ${level - 40} 173 ${level} V ${level + 13}`} fill="none" stroke={inks[index]} strokeWidth="3" />{Array.from({ length: 7 }, (_, support) => <path key={support} d={`M ${28 + support * 24} ${level - Math.sin(support / 6 * Math.PI) * 18} V ${level + 14}`} stroke={inks[index]} strokeWidth=".8" />)}<path d={`M 22 ${level + 14} H 178`} stroke={colors.pale} strokeWidth="2" /><circle cx={27 + fraction * 146} cy={level - 36 * fraction * (1 - fraction)} r="4" fill={colors.paper} stroke={inks[index]} /><Text x={174} y={level + 25} size={11} mono color={inks[index]} anchor="end">{pad(values[index])}</Text></g>;
    })}</g>
    : variant === 3 ? <g>{Array.from({ length: 12 }, (_, index) => {
      const originX = 24 + index % 6 * 25.5;
      const originY = 45 + Math.floor(index / 6) * 57;
      return <path key={index} d={`M ${originX} ${originY + 36} V ${originY + 12} a 10 12 0 0 1 20 0 V ${originY + 36} Z`} fill={index === time.h12 ? colors.accent : colors.pale} stroke={colors.ink} strokeWidth=".7" />;
    })}<Text y={30} size={15} color={colors.ink} mono>{pad(time.h24)}</Text><Text y={175} size={25} color={colors.accent} mono>{pad(time.minuteValue)}:{pad(time.secondValue)}</Text></g>
    : variant === 4 ? <g><path d="M 25 151 H 175" stroke={colors.ink} />{fractions.map((fraction, index) => {
      const base = 47 + index * 53;
      const height = 34 + fraction * 78;
      const shift = 12 + Math.sin(time.second * Math.PI * 2 + index) * 8;
      return <g key={index}><path d={`M ${base - 10} 151 L ${base + shift} ${151 - height * .4} L ${base + shift + 15} ${151 - height * .4} L ${base + 10} 151 Z`} fill={colors.pale} /><rect x={base - 8} y={151 - height} width="16" height={height} fill={inks[index]} /><path d={`M ${base - 13} ${151 - height} h 26 M ${base - 13} 151 h 26`} stroke={inks[index]} strokeWidth="3" /><Text x={base} y={174} size={16} mono color={inks[index]}>{pad(values[index])}</Text></g>;
    })}</g>
    : variant === 5 ? <g>{values.map((value, index) => {
      const floors = Math.floor(value / 5);
      return <g key={index}><path d={`M ${29 + index * 53} 160 V 30 H ${65 + index * 53} V 160`} fill="none" stroke={colors.pale} />{Array.from({ length: 12 }, (_, floor) => <rect key={floor} x={30 + index * 53} y={149 - floor * 10} width="34" height="8" fill={floor < floors ? inks[index] : colors.pale} />)}<rect x={30 + index * 53} y={149 - Math.min(11, floors) * 10} width={34 * (value % 5) / 5} height="8" fill={inks[index]} /><Text x={47 + index * 53} y={180} size={17} mono color={inks[index]}>{pad(value)}</Text></g>;
    })}</g>
    : variant === 6 ? <g>{Array.from(`${pad(time.h24)}${pad(time.minuteValue)}`).map((digit, index) => <g key={index}><path d={`M ${20 + index * 42} 139 V 56 H ${57 + index * 42} V 139`} fill={colors.ink} /><path d={`M ${17 + index * 42} 54 H ${60 + index * 42}`} stroke={colors.accent} strokeWidth="3" />{WINDOW_NUMBERS[digit].flatMap((row, rowIndex) => Array.from(row).map((cell, column) => <rect key={`${rowIndex}-${column}`} x={25 + index * 42 + column * 9} y={64 + rowIndex * 14} width="6" height="9" fill={cell === "1" ? colors.accent : colors.pale} opacity={cell === "1" ? 1 : .15} />))}</g>)}<Text y={163} size={13} mono color={colors.second}>{pad(time.secondValue)}</Text></g>
    : variant === 7 ? <g>{values.map((value, index) => {
      const height = 40 + value / (index === 0 ? 24 : 60) * 75;
      const base = 25 + index * 53;
      return <g key={index}><path d={`M ${base} 152 V ${152 - height} L ${base + 21} ${135 - height} L ${base + 42} ${152 - height} V 152 Z`} fill={inks[index]} /><path d={`M ${base + 21} ${135 - height} V 152`} stroke={colors.paper} strokeWidth=".9" opacity=".5" /><Text x={base + 21} y={174} size={17} color={inks[index]} mono>{pad(value)}</Text></g>;
    })}<path d="M 19 153 H 183" stroke={colors.ink} strokeWidth="1.3" /></g>
    : variant === 8 ? <g><path d="M 25 40 H 175 V 155 H 25 Z M 65 75 V 124 H 135 V 75 Z" fill={colors.pale} fillRule="evenodd" stroke={colors.ink} />{Array.from({ length: 24 }, (_, index) => {
      const side = Math.floor(index / 6);
      const offset = index % 6;
      const center = side === 0 ? { x: 42 + offset * 23, y: 56 } : side === 1 ? { x: 153, y: 54 + offset * 17 } : side === 2 ? { x: 157 - offset * 23, y: 139 } : { x: 44, y: 139 - offset * 17 };
      return <rect key={index} x={center.x - 3} y={center.y - 4} width="6" height="8" fill={index === time.h24 ? colors.second : colors.accent} />;
    })}<Text y={100} size={20} mono color={colors.ink}>{pad(time.minuteValue)}</Text><Readout time={time} colors={colors} y={182} size={12} /></g>
    : <g>{Array.from({ length: 12 }, (_, index) => {
      const level = 151 - index * 10;
      const left = 26 + index * 5;
      const width = 150 - index * 10;
      return <g key={index}><path d={`M ${left} ${level} H ${left + width} V ${level + 7} H ${left} Z`} fill={index < time.h12 ? colors.accent : colors.pale} /><path d={`M ${left} ${level} H ${left + width}`} stroke={colors.ink} strokeWidth=".7" /></g>;
    })}<circle cx={32 + time.minute * 136} cy="166" r="3" fill={colors.second} /><Readout time={time} colors={colors} y={184} size={14} /></g>
  }</g>;
}
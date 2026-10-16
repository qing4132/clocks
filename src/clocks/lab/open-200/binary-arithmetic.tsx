import { arc, Ground, pad, point, Readout, Text, theme, unitValues, type FaceProps } from "./shared";

export function timeBits(value: number, gray = false) {
  const encoded = gray ? value ^ (value >> 1) : value;
  return Array.from({ length: 6 }, (_, index) => (encoded >> (5 - index)) & 1);
}

export function BinaryFace({ time, variant }: FaceProps) {
  const colors = theme(variant);
  const values = unitValues(time);
  const inks = [colors.ink, colors.accent, colors.second];
  return <g><Ground colors={colors} round={variant === 1 || variant === 4} />{
    variant === 0 ? <g>{values.map((value, row) => <g key={row}><Text x={22} y={49 + row * 47} size={14} color={inks[row]} mono>{pad(value)}</Text>{timeBits(value).map((bit, index) => <rect key={index} x={44 + index * 23} y={36 + row * 47} width="17" height="25" rx="2" fill={bit ? inks[row] : colors.pale} />)}</g>)}{[32,16,8,4,2,1].map((weight,index)=><Text key={weight} x={52.5+index*23} y={178} size={8} mono color={colors.ink}>{weight}</Text>)}</g>
    : variant === 1 ? <g>{values.map((value,row)=><g key={row}>{timeBits(value).map((bit,index)=><path key={index} d={arc(35+row*22,index/6+.018,(index+1)/6-.018)} stroke={bit?inks[row]:colors.pale} strokeWidth="12" fill="none" />)}</g>)}<Readout time={time} colors={colors} y={100} size={10}/>{[32,16,8,4,2,1].map((weight,index)=>{const place=point(94,(index+.5)/6);return <Text key={weight} x={place.x} y={place.y} size={8} mono color={colors.ink}>{weight}</Text>;})}</g>
    : variant === 2 ? <g>{values.map((value,row)=><g key={row}>{timeBits(value).map((bit,index)=><rect key={index} x={25+index*24} y={28+row*43+index*3} width="20" height={10+index*4} fill={bit?inks[row]:colors.pale} />)}<Text x={174} y={64+row*43} size={13} anchor="end" mono color={inks[row]}>{pad(value)}</Text></g>)}</g>
    : variant === 3 ? <g>{values.map((value,row)=><g key={row}><Text x={27} y={44+row*51} size={16} mono color={inks[row]}>{pad(value)}</Text>{timeBits(value,true).map((bit,index)=><g key={index}><path d={`M ${48+index*22} ${28+row*51} h 18 v 30 h -18 Z`} fill={bit?inks[row]:colors.pale}/><path d={`M ${48+index*22} ${43+row*51} h 18`} stroke={colors.paper}/></g>)}</g>)}<Text y={184} size={9} mono color={colors.accent}>GRAY / 6</Text></g>
    : variant === 4 ? <g>{values.map((value,row)=><g key={row}>{timeBits(value).map((bit,index)=>{const position=point(27+row*25,index/6+row*.028);return <g key={index}><circle cx={position.x} cy={position.y} r={bit?5:2.5} fill={bit?inks[row]:colors.pale}/>{bit&&<path d={`M 100 100 L ${position.x} ${position.y}`} stroke={inks[row]} strokeWidth=".6" opacity=".4"/>}</g>;})}</g>)}<circle cx="100" cy="100" r="16" fill={colors.paper}/><Text y={100} size={12} color={colors.ink} mono>{pad(time.h24)}</Text><Readout time={time} colors={colors} y={186} size={11}/></g>
    : variant === 5 ? <g>{values.map((value,row)=><g key={row}>{timeBits(value).map((bit,index)=><g key={index}><rect x={24+index*26} y={27+row*50} width="22" height="24" fill={bit?inks[row]:colors.pale}/><Text x={35+index*26} y={39+row*50} size={9} mono color={bit?colors.paper:colors.ink}>{2**(5-index)}</Text></g>)}<Text x={177} y={61+row*50} size={12} anchor="end" mono color={inks[row]}>{pad(value)}</Text></g>)}</g>
    : variant === 6 ? <g>{values.map((value,row)=>{const centerX=[58,142,100][row];const centerY=[65,65,137][row];return <g key={row}>{timeBits(value).map((bit,index)=>{const petal=point(23,index/6,centerX,centerY);return <ellipse key={index} cx={petal.x} cy={petal.y} rx="8" ry="13" transform={`rotate(${index*60} ${petal.x} ${petal.y})`} fill={bit?inks[row]:colors.pale}/>;})}<circle cx={centerX} cy={centerY} r="14" fill={colors.paper}/><Text x={centerX} y={centerY} size={14} mono color={inks[row]}>{pad(value)}</Text></g>;})}</g>
    : variant === 7 ? <g>{values.map((value,row)=><g key={row}><rect x="23" y={28+row*50} width="154" height="36" fill={inks[row]}/>{timeBits(value).map((bit,index)=><circle key={index} cx={37+index*25} cy={46+row*50} r={bit?8:2} fill={colors.paper}/>)}<Text x={175} y={74+row*50} size={10} anchor="end" color={inks[row]} mono>{pad(value)}</Text></g>)}</g>
    : variant === 8 ? <g>{values.map((value,row)=><g key={row}>{timeBits(value).map((bit,index)=>{const level=29+index*22;return <g key={index}><path d={`M ${47+row*53} ${level} v 21`} stroke={colors.pale}/><circle cx={47+row*53+(bit?8:-8)} cy={level} r="5" fill={bit?inks[row]:colors.pale}/></g>;})}<Text x={47+row*53} y={177} size={18} color={inks[row]} mono>{pad(value)}</Text></g>)}</g>
    : <g>{values.map((value,row)=><g key={row}>{timeBits(value).map((bit,index)=><path key={index} d={bit?`M ${28+index*25} ${35+row*49} h 14 v 26 h -14`:`M ${42+index*25} ${35+row*49} h -14 v 26 h 14`} stroke={bit?inks[row]:colors.pale} fill="none" strokeWidth={bit?3:1.2}/>)}<Text x={23} y={24+row*49} size={11} color={inks[row]} mono anchor="start">{pad(value)}</Text></g>)}</g>
  }</g>;
}

export function arithmeticExpression(value: number, variant: number, unit: number) {
  const basis = unit === 0 ? 24 : 60;
  const factor = [3, 4, 5][unit];
  const half = Math.floor(value / 2);
  const root = Math.floor(Math.sqrt(value));
  const divisor = [7, 6, 5, 4, 3, 2].find(candidate => value % candidate === 0) ?? 1;
  const result = { value, expression: "", evaluated: value };
  if (variant === 0) return { ...result, expression: `${half} + ${value-half}`, evaluated: half + (value-half) };
  if (variant === 1) return { ...result, expression: `${divisor} * ${value/divisor}`, evaluated: divisor * (value/divisor) };
  if (variant === 2) return { ...result, expression: `${value+basis} - ${basis}`, evaluated: value+basis-basis };
  if (variant === 3) return { ...result, expression: `${value*factor} / ${factor}`, evaluated: value*factor/factor };
  if (variant === 4) return { ...result, expression: `${root}^2 + ${value-root**2}`, evaluated: root**2 + (value-root**2) };
  if (variant === 5) return { ...result, expression: `${basis} - ${basis-value}`, evaluated: basis-(basis-value) };
  if (variant === 6) return { ...result, expression: `? + ${factor} = ${value+factor}`, evaluated: value+factor-factor };
  if (variant === 7) return { ...result, expression: `${value*2+1}/2 - 0.5`, evaluated: (value*2+1)/2-.5 };
  if (variant === 8) return { ...result, expression: `${value+basis} % ${basis}`, evaluated: (value+basis)%basis };
  return { ...result, expression: `${Math.floor(value/10)}*10 + ${value%10}`, evaluated: Math.floor(value/10)*10+value%10 };
}

export function ArithmeticFace({ time, variant }: FaceProps) {
  const colors=theme(variant);
  const values=unitValues(time);
  const inks=[colors.ink,colors.accent,colors.second];
  const expressions=values.map((value,index)=>arithmeticExpression(value,variant,index));
  return <g><Ground colors={colors}/>{
    variant===5?<g>{values.map((value,index)=>{const basis=index===0?24:60;return <g key={index}><Text x={28} y={37+index*51} size={22} color={inks[index]} mono anchor="start">{pad(value)}</Text><Text x={171} y={37+index*51} size={15} color={inks[index]} mono anchor="end">{basis-value}</Text><rect x="28" y={56+index*51} width={143*value/basis} height="9" fill={inks[index]}/><rect x={28+143*value/basis} y={56+index*51} width={143*(1-value/basis)} height="9" fill={colors.pale}/></g>;})}</g>
    :variant===4?<g>{expressions.map((entry,index)=><g key={index}><rect x="23" y={25+index*52} width="36" height="36" fill={inks[index]}/><Text x={41} y={43+index*52} size={19} color={colors.paper}>{Math.floor(Math.sqrt(values[index]))}</Text><Text x={71} y={43+index*52} size={17} color={inks[index]} mono anchor="start">^2 + {values[index]-Math.floor(Math.sqrt(values[index]))**2}</Text><path d={`M 23 ${67+index*52} H 177`} stroke={colors.pale}/></g>)}</g>
    :variant===7?<g>{values.map((value,index)=><g key={index}><Text x={59} y={30+index*55} size={19} color={inks[index]} mono>{value*2+1}</Text><path d={`M 35 ${46+index*55} H 83`} stroke={inks[index]}/><Text x={59} y={60+index*55} size={16} color={inks[index]} mono>2</Text><Text x={99} y={46+index*55} size={20} color={inks[index]} mono anchor="start">- 0.5</Text></g>)}</g>
    :variant===6?<g>{expressions.map((entry,index)=><g key={index}><Text x={24} y={43+index*52} size={16} color={inks[index]} mono anchor="start">{entry.expression}</Text><Text x={175} y={63+index*52} size={10} color={inks[index]} mono anchor="end">? = {pad(entry.value)}</Text><path d={`M 24 ${73+index*52} H 176`} stroke={colors.pale}/></g>)}</g>
    :<g>{expressions.map((entry,index)=><g key={index}>{variant===1?<circle cx={31} cy={45+index*52} r="5" fill={inks[index]}/>:variant===8?<path d={`M 23 ${29+index*52} v 31 h 9`} stroke={inks[index]} fill="none"/>:null}<Text x={variant===1?49:30} y={45+index*52} size={variant===9?20:24} mono color={inks[index]} anchor="start">{entry.expression}</Text>{variant===2?<path d={`M 30 ${67+index*52} h ${values[index]*2}`} stroke={inks[index]} strokeWidth="2"/>:variant===3?<path d={`M 30 ${66+index*52} H 172`} stroke={inks[index]} strokeDasharray="1 4"/>:variant===9?<Text x={177} y={65+index*52} size={9} mono color={inks[index]} anchor="end">{pad(entry.value)}</Text>:<path d={`M 30 ${67+index*52} H 170`} stroke={colors.pale}/>}</g>)}</g>
  }</g>;
}
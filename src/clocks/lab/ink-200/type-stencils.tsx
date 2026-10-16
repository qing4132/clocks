import { INK, PAPER, RED, SERIF, Text, pad, type FaceProps } from "./shared";
import { circleArc, polar } from "./geometry";

export function TypographyFace({ time, variant }: FaceProps) {
  const hour = pad(time.h24);
  const minute = pad(time.minuteValue);
  const second = pad(time.secondValue);
  const dot = polar(76, time.second);
  return <g>{
    variant === 0 ? <><Text y={-32} size={58}>{hour}</Text><Text y={27} size={58}>{minute}</Text><circle cy="-1" r="2.2" fill={RED} /><path d={circleArc(3 + time.second * 9, 0, .999)} stroke={RED} fill="none" strokeWidth=".65" /></>
    : variant === 1 ? <><Text x={-47} y={-11} size={52}>{hour}</Text><Text x={47} y={11} size={52}>{minute}</Text><path d="M 0 -64 V 64" stroke={INK} strokeWidth=".6" /><circle cy={-64 + time.second * 128} r="2.1" fill={RED} /></>
    : variant === 2 ? <><Text x={-24} y={12} size={81}>{hour}</Text><Text x={58} y={-37} size={27}>{minute}</Text><Text x={60} y={36} size={15} ink={RED}>{second}</Text></>
    : variant === 3 ? <><Text x={15} y={-7} size={87}>{minute}</Text><Text x={-61} y={54} size={26}>{hour}</Text><circle cx={dot.x} cy={dot.y} r="2" fill={RED} /></>
    : variant === 4 ? <><Text x={-29} y={-38} size={49}>{hour}</Text><Text x={29} y={30} size={49}>{minute}</Text><path d="M -81 -7 H 23 M -23 75 H 81" stroke={INK} strokeWidth=".8" /><circle cx={-60 + time.second * 120} cy="3" r="2.5" fill={RED} /></>
    : variant === 5 ? <>{[hour[0], hour[1], minute[1], minute[0]].map((digit, index) => <Text key={index} x={[-48, 48, 48, -48][index]} y={[-47, -47, 45, 45][index]} size={56}>{digit}</Text>)}<circle cx={dot.x * .3} cy={dot.y * .3} r="2.3" fill={RED} /></>
    : variant === 6 ? <><Text x={-57} y={0} size={47}>{hour}</Text><Text y={-20} size={25}>{minute[0]}</Text><Text y={15} size={25}>{minute[1]}</Text><Text x={61} y={0} size={28} ink={RED}>{second}</Text></>
    : variant === 7 ? <><g transform="scale(.72 1.15)"><Text y={-36} size={62}>{hour}</Text><Text y={26} size={62}>{minute}</Text></g><path d="M 58 -63 V 65" stroke={INK} strokeWidth=".5" /><path d={`M 58 -63 V ${-63 + time.second * 128}`} stroke={RED} strokeWidth="1.5" /></>
    : variant === 8 ? <><Text x={-51} y={-1} size={47}>{hour}</Text><Text x={51} y={-1} size={47}>{minute}</Text><path d="M -14 13 H 14" stroke={INK} strokeWidth=".7" /><circle cx={-14 + time.second * 28} cy="13" r="2" fill={RED} /></>
    : <>{Array.from(`${hour}${minute}`).map((digit, index) => <g key={index} transform={`translate(${-65 + index * 43} ${index === 3 ? -Math.sin(time.second * Math.PI) * 8 : 0})`}><Text y={-3} size={53} ink={index === 3 ? RED : INK}>{digit}</Text></g>)}<path d="M -83 43 H 83" stroke={INK} strokeWidth=".65" /></>
  }</g>;
}

export function StencilsFace({ time, variant, uid }: FaceProps) {
  const hour = pad(time.h24);
  const minute = pad(time.minuteValue);
  const textId = `${uid}-letters`;
  const cutId = `${uid}-cuts`;
  const shape = <><Text y={-35} size={63} weight={variant === 4 ? 700 : 400}>{hour}</Text><Text y={28} size={63} weight={variant === 4 ? 700 : 400}>{minute}</Text></>;
  const second = polar(86, time.second);
  return <g><defs><clipPath id={textId}>{shape}</clipPath><mask id={cutId}><rect x="-100" y="-100" width="200" height="200" fill="white" />{variant === 0 ? <path d="M -85 -28 H 85 M -85 35 H 85" stroke="black" strokeWidth="2.2" /> : variant === 5 ? <path d="M -9 -90 V 90 M 9 -90 V 90 M -90 -10 H 90 M -90 10 H 90" stroke="black" strokeWidth="1.6" /> : null}</mask></defs>{
    variant === 0 || variant === 5 ? <g mask={`url(#${cutId})`}>{shape}</g>
    : variant === 1 ? <g fill="none" stroke={INK} strokeWidth="1.1">{[hour, minute].map((value, index) => <text key={index} x="0" y={index === 0 ? -35 : 28} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="63">{value}</text>)}</g>
    : variant === 2 ? <g clipPath={`url(#${textId})`}>{Array.from({ length: 48 }, (_, index) => <path key={index} d={`M ${-72 + index * 3} -87 V 82`} stroke={INK} strokeWidth="1.65" />)}</g>
    : variant === 3 ? <g clipPath={`url(#${textId})`}>{Array.from({ length: 53 }, (_, index) => <path key={index} d={`M -88 ${-81 + index * 3} H 88`} stroke={INK} strokeWidth="1.4" />)}</g>
    : variant === 4 ? <>{shape}<g fill="none" stroke={PAPER} strokeWidth="1.2">{[hour, minute].map((value, index) => <text key={index} x="0" y={index === 0 ? -35 : 28} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="58">{value}</text>)}</g></>
    : variant === 6 ? <g clipPath={`url(#${textId})`}>{Array.from({ length: 35 }, (_, row) => Array.from({ length: 28 }, (_, column) => <circle key={`${row}-${column}`} cx={-67 + column * 5} cy={-78 + row * 4.7} r="1.25" fill={INK} />))}</g>
    : variant === 7 ? <>{[hour, minute].map((value, index) => <g key={index}><text x="0" y={index === 0 ? -37 : 30} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="75" fill="none" stroke={INK} strokeWidth=".8">{value}</text><Text y={index === 0 ? -37 : 30} size={37}>{value}</Text></g>)}</>
    : variant === 8 ? <g clipPath={`url(#${textId})`}>{Array.from({ length: 70 }, (_, index) => <path key={index} d={`M ${-200 + index * 4} 100 l 200 -200`} stroke={INK} strokeWidth="1.4" />)}</g>
    : <><defs><clipPath id={`${uid}-left-half`}><path d="M -44 -90 H -19 V 90 H -44 Z M -6 -90 H 19 V 90 H -6 Z" /></clipPath><clipPath id={`${uid}-right-half`}><path d="M -19 -90 H 6 V 90 H -19 Z M 19 -90 H 44 V 90 H 19 Z" /></clipPath></defs>{[hour, minute].map((value, row) => Array.from(value).map((digit, column) => <g key={`${row}-${column}`}><g clipPath={`url(#${uid}-left-half)`}><Text x={column === 0 ? -19 : 19} y={row === 0 ? -35 : 28} size={63}>{digit}</Text></g><g clipPath={`url(#${uid}-right-half)`}><text x={column === 0 ? -19 : 19} y={row === 0 ? -35 : 28} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF} fontSize="63" fill="none" stroke={INK} strokeWidth="1.1">{digit}</text></g></g>))}</>
  }{variant === 1 ? <Text y={83} size={14} ink={RED}>{pad(time.secondValue)}</Text> : variant === 2 ? <circle cx={-72 + time.second * 144} cy="84" r="2" fill={RED} /> : <circle cx={second.x} cy={second.y} r="2" fill={RED} />}</g>;
}
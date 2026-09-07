"use client";

import { useWallClock } from "../../useWallClock";

const INK = "#1a1a1a";
const PAPER = "#fafaf7";
const RED = "#c1121f";
const PALE = "#deddd7";
const MUTED = "#73736d";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function pad(value: number, width = 2) {
  return String(Math.floor(value)).padStart(width, "0");
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getDayOfYear(date: Date) {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86_400_000) + 1;
}

function formatOffset(date: Date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  return `${sign}${pad(absolute / 60)}:${pad(absolute % 60)}`;
}

function formatDuration(totalSeconds: number, includeHours: boolean) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = includeHours
    ? Math.floor(seconds % 3600 / 60)
    : Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return includeHours
    ? `${pad(hours)}:${pad(minutes)}:${pad(remainder)}`
    : `${pad(minutes)}:${pad(remainder)}`;
}

type ProgressRow = {
  kind: "day" | "month" | "year";
  progress: number;
  detail: string;
};

function ProgressIcon({ kind, x, y }: { kind: ProgressRow["kind"]; x: number; y: number }) {
  if (kind === "day") {
    return (
      <g stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <circle cx={x} cy={y} r="5" />
        {[0, 45, 90, 135].map((angle) => (
          <line key={angle} x1={x} y1={y - 9} x2={x} y2={y - 12} transform={`rotate(${angle} ${x} ${y})`} />
        ))}
      </g>
    );
  }

  if (kind === "month") {
    return (
      <g stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x={x - 8} y={y - 8} width="16" height="16" />
        <line x1={x - 8} y1={y - 3} x2={x + 8} y2={y - 3} />
        <line x1={x - 4} y1={y - 11} x2={x - 4} y2={y - 6} />
        <line x1={x + 4} y1={y - 11} x2={x + 4} y2={y - 6} />
      </g>
    );
  }

  return (
    <g stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round">
      <circle cx={x} cy={y} r="4" />
      <ellipse cx={x} cy={y} rx="11" ry="6" transform={`rotate(-28 ${x} ${y})`} />
      <circle cx={x + 9} cy={y - 5} r="1.8" fill={RED} stroke="none" />
    </g>
  );
}

function ProgressLine({ row, index }: { row: ProgressRow; index: number }) {
  const y = 218 + index * 56;
  const width = 352;
  const amount = Math.min(1, Math.max(0, row.progress));
  return (
    <g>
      <ProgressIcon kind={row.kind} x={27} y={y - 4} />
      <text x="52" y={y} fontFamily={MONO} fontSize="14" fontWeight="700" fill={INK}>{row.detail}</text>
      <text x="368" y={y} textAnchor="end" fontFamily={MONO} fontSize="14" fontWeight="700" fill={INK}>
        {(amount * 100).toFixed(1)}%
      </text>
      <rect x="16" y={y + 14} width={width} height="11" fill={PALE} />
      <rect x="16" y={y + 14} width={width * amount} height="11" fill={INK} />
      <rect x={16 + width * amount - 1} y={y + 12} width="2" height="15" fill={RED} />
    </g>
  );
}

export function TimeConsoleClock() {
  const now = useWallClock(1000);

  if (!now) {
    return (
      <svg viewBox="0 0 384 384" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label="--:--:--">
        <rect x="1.5" y="1.5" width="381" height="381" fill={PAPER} stroke={INK} strokeWidth="3" />
        <text x="192" y="195" textAnchor="middle" fontFamily={MONO} fontSize="18" fill={MUTED}>--:--:--</text>
      </svg>
    );
  }

  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const secondsOfDay = hours * 3600 + minutes * 60 + seconds;
  const dayProgress = secondsOfDay / 86_400;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const ordinal = getDayOfYear(now);
  const monthProgress = (day - 1 + dayProgress) / daysInMonth;
  const yearProgress = (ordinal - 1 + dayProgress) / daysInYear;
  const offset = formatOffset(now);
  const utc = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  const local = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const toHour = 3600 - (minutes * 60 + seconds);
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const toMidnight = (nextMidnight.getTime() - now.getTime()) / 1000;
  const progressRows: ProgressRow[] = [
    { kind: "day", progress: dayProgress, detail: `${pad(hours)}:${pad(minutes)} / 24:00` },
    { kind: "month", progress: monthProgress, detail: `${day} / ${daysInMonth}` },
    { kind: "year", progress: yearProgress, detail: `${ordinal} / ${daysInYear}` },
  ];
  const numericDate = `${year}-${pad(month + 1)}-${pad(day)}`;

  return (
    <svg
      viewBox="0 0 384 384"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label={`${local} · ${numericDate} · ${offset}`}
    >
      <rect x="1.5" y="1.5" width="381" height="381" fill={PAPER} stroke={INK} strokeWidth="3" />

      <text x="16" y="24" fontFamily={MONO} fontSize="13" fontWeight="700" fill={INK}>{numericDate}</text>
      <text x="368" y="24" textAnchor="end" fontFamily={MONO} fontSize="12" fill={MUTED}>{offset}</text>
      <text x="14" y="86" fontFamily={MONO} fontSize="62" fontWeight="800" fill={INK}>{local}</text>
      <line x1="14" y1="105" x2="370" y2="105" stroke={INK} strokeWidth="1" />

      <line x1="133" y1="116" x2="133" y2="177" stroke={PALE} />
      <line x1="257" y1="116" x2="257" y2="177" stroke={PALE} />
      <g transform="translate(26 127)" fill="none" stroke={MUTED} strokeWidth="1.5">
        <circle r="8" />
        <ellipse rx="4" ry="8" />
        <line x1="-8" y1="0" x2="8" y2="0" />
      </g>
      <text x="16" y="164" fontFamily={MONO} fontSize="19" fontWeight="700" fill={INK}>{utc}</text>
      <text x="145" y="132" fontFamily={MONO} fontSize="12" fill={MUTED}>→ :00</text>
      <text x="145" y="164" fontFamily={MONO} fontSize="19" fontWeight="700" fill={INK}>{formatDuration(toHour, false)}</text>
      <text x="269" y="132" fontFamily={MONO} fontSize="12" fill={MUTED}>→ 00:00</text>
      <text x="269" y="164" fontFamily={MONO} fontSize="19" fontWeight="700" fill={INK}>{formatDuration(toMidnight, true)}</text>
      <line x1="14" y1="188" x2="370" y2="188" stroke={INK} strokeWidth="1" />

      {progressRows.map((row, index) => <ProgressLine key={row.kind} row={row} index={index} />)}
    </svg>
  );
}

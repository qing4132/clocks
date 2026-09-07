"use client";

import { useWallClock } from "../../useWallClock";

const PAPER = "#fafaf7";
const INK = "#1a1a1a";
const GREEN = "#9acd32";
const LCD_RED = "#9b1738";
const ETA_FILL = "#eeeeec";
const NEXT_ETA_FILL = "#e2b735";
const SERIF = "Georgia, 'Times New Roman', serif";
const JAPANESE = "'Hiragino Sans', 'Yu Gothic', sans-serif";
const RADIUS = 96;
const SEGMENT_SECONDS = 120;
const STOP_SECONDS = 45;

const STATIONS = [
  ["JY01", "東京"],
  ["JY02", "神田"],
  ["JY03", "秋葉原"],
  ["JY04", "御徒町"],
  ["JY05", "上野"],
  ["JY06", "鶯谷"],
  ["JY07", "日暮里"],
  ["JY08", "西日暮里"],
  ["JY09", "田端"],
  ["JY10", "駒込"],
  ["JY11", "巣鴨"],
  ["JY12", "大塚"],
  ["JY13", "池袋"],
  ["JY14", "目白"],
  ["JY15", "高田馬場"],
  ["JY16", "新大久保"],
  ["JY17", "新宿"],
  ["JY18", "代々木"],
  ["JY19", "原宿"],
  ["JY20", "渋谷"],
  ["JY21", "恵比寿"],
  ["JY22", "目黒"],
  ["JY23", "五反田"],
  ["JY24", "大崎"],
  ["JY25", "品川"],
  ["JY26", "高輪ゲートウェイ"],
  ["JY27", "田町"],
  ["JY28", "浜松町"],
  ["JY29", "新橋"],
  ["JY30", "有楽町"],
] as const;

const OUTER_LOOP_STATIONS = [STATIONS[0], ...STATIONS.slice(1).reverse()];
const MAJOR_STATION_IDS = new Set(["JY01", "JY05", "JY13", "JY17", "JY20", "JY25"]);
const SHINJUKU_INDEX = OUTER_LOOP_STATIONS.findIndex(([id]) => id === "JY17");
const LOOP_ROTATION = 3 / 4 - SHINJUKU_INDEX / OUTER_LOOP_STATIONS.length;

function pad(value: number) {
  return String(Math.floor(value)).padStart(2, "0");
}

function loopPoint(progress: number, radius = RADIUS) {
  const angle = (LOOP_ROTATION + progress) * Math.PI * 2;
  return {
    x: Math.sin(angle) * radius,
    y: -Math.cos(angle) * radius,
  };
}

export function YamanoteClock() {
  const now = useWallClock(32);

  if (!now) {
    return (
      <svg viewBox="-100 -100 200 200" className="h-72 w-72 sm:h-96 sm:w-96" role="img" aria-label="山手線">
        <circle r={RADIUS} fill={PAPER} stroke={GREEN} strokeWidth="9" />
      </svg>
    );
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const preciseSecond = now.getSeconds() + now.getMilliseconds() / 1000;
  const minuteOfHour = minutes + preciseSecond / 60;
  const stationIndex = Math.floor(minuteOfHour / 2) % OUTER_LOOP_STATIONS.length;
  const currentStation = OUTER_LOOP_STATIONS[stationIndex];
  const nextStationIndex = (stationIndex + 1) % OUTER_LOOP_STATIONS.length;
  const nextStation = OUTER_LOOP_STATIONS[nextStationIndex];
  const segmentElapsed = (minuteOfHour % 2) * 60;
  const isStopped = segmentElapsed < STOP_SECONDS;
  const travelProgress = isStopped
    ? 0
    : (segmentElapsed - STOP_SECONDS) / (SEGMENT_SECONDS - STOP_SECONDS);
  const markerProgress = (stationIndex + travelProgress) / OUTER_LOOP_STATIONS.length;
  const markerPoint = loopPoint(markerProgress);
  const markerRotation = (LOOP_ROTATION + markerProgress) * 360;
  const displayStation = isStopped ? currentStation : nextStation;
  const statusLabel = isStopped ? "ただいま" : "次は";
  const longName = displayStation[1].length > 5;
  const time = `${pad(hours)}:${pad(minutes)}`;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label={`${time}、${statusLabel}${displayStation[1]}`}
    >
      <circle r={RADIUS} fill={PAPER} stroke={GREEN} strokeWidth="9" />

      {OUTER_LOOP_STATIONS.map((station, index) => {
        const stationPoint = loopPoint(index / OUTER_LOOP_STATIONS.length);
        const stepsAhead = (index - stationIndex + OUTER_LOOP_STATIONS.length) % OUTER_LOOP_STATIONS.length;
        const etaSeconds = stepsAhead * SEGMENT_SECONDS - segmentElapsed;
        const etaMinutes = Math.ceil(etaSeconds / 60);
        const showEta = etaSeconds > 0 && etaSeconds <= 30 * 60;
        const isNextStation = !isStopped && index === nextStationIndex;
        return (
          <g
            key={station[0]}
            transform={`translate(${stationPoint.x} ${stationPoint.y})`}
          >
            {showEta ? (
              <>
                <circle r="4" fill={isNextStation ? NEXT_ETA_FILL : ETA_FILL} />
                <text
                  y="0.2"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily={JAPANESE}
                  fontSize={etaMinutes >= 10 ? "3.7" : "4.6"}
                  fontWeight="700"
                  fill={INK}
                >
                  {etaMinutes}
                </text>
              </>
            ) : (
              <circle r="2.5" fill={PAPER} />
            )}
          </g>
        );
      })}

      {OUTER_LOOP_STATIONS.map((station, index) => {
        if (!MAJOR_STATION_IDS.has(station[0])) return null;
        const labelPoint = loopPoint(index / OUTER_LOOP_STATIONS.length, 79);
        return (
          <text
            key={`${station[0]}-label`}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={JAPANESE}
            fontSize="6"
            fontWeight="700"
            fill={INK}
          >
            {station[1]}
          </text>
        );
      })}

      <g transform={`translate(${markerPoint.x} ${markerPoint.y}) rotate(${markerRotation})`}>
        {isStopped ? (
          <>
            <path d="M -6 -4.5 H 2 L 6 0 L 2 4.5 H -6 Z" fill={LCD_RED} />
            <circle r="2.4" fill={PAPER} />
          </>
        ) : (
          <path d="M -6 -3.2 H 1 V -5.6 L 7 0 L 1 5.6 V 3.2 H -6 Z" fill={LCD_RED} />
        )}
      </g>

      <text x="0" y="-2" textAnchor="middle" fontFamily={SERIF} fontSize="39" fontWeight="700" fill={INK}>{time}</text>
      <line x1="-36" y1="9" x2="36" y2="9" stroke={GREEN} strokeWidth="4" />
      <text x="0" y="18" textAnchor="middle" fontFamily={JAPANESE} fontSize="5" fontWeight="700" fill={INK} opacity="0.62">{statusLabel}</text>
      <text x="0" y="33" textAnchor="middle" fontFamily={JAPANESE} fontSize={longName ? 9 : 14} fontWeight="700" fill={INK}>{displayStation[1]}</text>
    </svg>
  );
}

export default function NowClock() {
  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96 drop-shadow-xl"
      role="img"
      aria-label="Now clock"
    >
      <circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="34"
        fontStyle="italic"
        fill="#1a1a1a"
      >
        now
      </text>
    </svg>
  );
}
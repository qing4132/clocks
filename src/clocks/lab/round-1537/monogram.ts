export type SignPoint = { x: number; y: number };
export type SignSegment = { start: SignPoint; end: SignPoint; quadrant: number; digit: number };

const TOP: [SignPoint, SignPoint] = [{ x: 0, y: -56 }, { x: 34, y: -56 }];
const BOTTOM: [SignPoint, SignPoint] = [{ x: 0, y: -18 }, { x: 34, y: -18 }];
const FALLING: [SignPoint, SignPoint] = [{ x: 0, y: -56 }, { x: 34, y: -18 }];
const RISING: [SignPoint, SignPoint] = [{ x: 0, y: -18 }, { x: 34, y: -56 }];
const SIDE: [SignPoint, SignPoint] = [{ x: 34, y: -56 }, { x: 34, y: -18 }];
const DIGITS = [[], [TOP], [BOTTOM], [FALLING], [RISING], [TOP, RISING], [SIDE], [TOP, SIDE], [BOTTOM, SIDE], [TOP, SIDE, BOTTOM]];

export function monogramSegments(hour: number, minute: number): SignSegment[] {
  const digits = [minute % 10, Math.floor(minute / 10), hour % 10, Math.floor(hour / 10)];
  return digits.flatMap((digit, quadrant) => {
    const horizontal = quadrant % 2 === 0 ? 1 : -1;
    const vertical = quadrant < 2 ? 1 : -1;
    return DIGITS[digit].map(([start, end]) => ({
      start: { x: start.x * horizontal, y: start.y * vertical },
      end: { x: end.x * horizontal, y: end.y * vertical },
      quadrant,
      digit,
    }));
  });
}
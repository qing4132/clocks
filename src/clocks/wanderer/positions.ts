export const WANDERER_CANONICAL_POSITION = 31;

export function getWandererPosition(hour: number): number {
  const normalizedHour = ((Math.trunc(hour) % 24) + 24) % 24;
  return normalizedHour === 0 ? 24 : normalizedHour;
}

export function getDisplayedPosition(
  canonicalPosition: number,
  hour: number,
): number {
  const wandererPosition = getWandererPosition(hour);

  if (canonicalPosition === WANDERER_CANONICAL_POSITION) {
    return wandererPosition;
  }

  if (canonicalPosition === wandererPosition) {
    return WANDERER_CANONICAL_POSITION;
  }

  return canonicalPosition;
}
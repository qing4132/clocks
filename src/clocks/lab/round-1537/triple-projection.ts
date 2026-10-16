import { projectionMask } from "./projection";

export const TRIPLE_GRID = 15;
export const TRIPLE_CELL = .18;
const FRAME_WIDTH = .055;
const FULL_ROW = (1 << TRIPLE_GRID) - 1;
const FRAME_SIDES = 1 | (1 << (TRIPLE_GRID - 1));
const HALF_EXTENT = ((TRIPLE_GRID - 2) * TRIPLE_CELL + 2 * FRAME_WIDTH) / 2;

export type TripleBlock = { vertical: number; depth: number; start: number; length: number };

export function framedProjectionMask(value: number): number[] {
  const digits = projectionMask(value);
  return Array.from({ length: TRIPLE_GRID }, (_, row) => {
    if (row === 0 || row === TRIPLE_GRID - 1) return FULL_ROW;
    let bits = FRAME_SIDES;
    if (row >= 4 && row < 11) {
      for (let column = 0; column < 11; column++) {
        if (digits[row - 4][column] === "1") bits |= 1 << (column + 2);
      }
    }
    return bits;
  });
}

const MASKS = Array.from({ length: 60 }, (_, value) => framedProjectionMask(value));

export function tripleProjectionVolume(hour: number, minute: number, second: number): TripleBlock[] {
  const hours = MASKS[hour];
  const minutes = MASKS[minute];
  const seconds = MASKS[second];
  const blocks: TripleBlock[] = [];
  for (let vertical = 0; vertical < TRIPLE_GRID; vertical++) {
    for (let depth = 0; depth < TRIPLE_GRID; depth++) {
      const occupied = (hours[vertical] & (1 << depth)) ? minutes[vertical] & seconds[TRIPLE_GRID - 1 - depth] : 0;
      let start = -1;
      for (let column = 0; column <= TRIPLE_GRID; column++) {
        const filled = (occupied & (1 << column)) !== 0;
        if (filled && start < 0) start = column;
        if (!filled && start >= 0) {
          blocks.push({ vertical, depth, start, length: column - start });
          start = -1;
        }
      }
    }
  }
  return blocks;
}

function edge(index: number) {
  if (index === 0) return -HALF_EXTENT;
  if (index === TRIPLE_GRID) return HALF_EXTENT;
  return -HALF_EXTENT + FRAME_WIDTH + (index - 1) * TRIPLE_CELL;
}

export function tripleBlockBounds(block: TripleBlock) {
  const left = edge(block.start);
  const right = edge(block.start + block.length);
  const top = -edge(block.vertical);
  const bottom = -edge(block.vertical + 1);
  const front = -edge(block.depth);
  const back = -edge(block.depth + 1);
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    z: (front + back) / 2,
    width: right - left,
    height: top - bottom,
    depth: front - back,
  };
}
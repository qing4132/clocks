const GLYPHS = [
  ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
];

export const PROJECTION_CELL = .22;
export type ProjectionBlock = { row: number; minuteStart: number; hourStart: number; minuteLength: number; hourLength: number };

export function projectionMask(value: number) {
  const digits = String(value).padStart(2, "0");
  return GLYPHS[Number(digits[0])].map((row, index) => `${row}0${GLYPHS[Number(digits[1])][index]}`);
}

function runs(row: string) {
  const result: { start: number; length: number }[] = [];
  let start = -1;
  for (let column = 0; column <= row.length; column++) {
    if (row[column] === "1" && start < 0) start = column;
    if (row[column] !== "1" && start >= 0) {
      result.push({ start, length: column - start });
      start = -1;
    }
  }
  return result;
}

export function projectionVolume(hour: number, minute: number): ProjectionBlock[] {
  const hours = projectionMask(hour);
  const minutes = projectionMask(minute);
  return hours.flatMap((row, index) => runs(row).flatMap(hourRun => runs(minutes[index]).map(minuteRun => ({
    row: index,
    hourStart: hourRun.start,
    hourLength: hourRun.length,
    minuteStart: minuteRun.start,
    minuteLength: minuteRun.length,
  }))));
}

export function blockBounds(block: ProjectionBlock) {
  return {
    x: (block.minuteStart + block.minuteLength / 2 - 5.5) * PROJECTION_CELL,
    y: (3 - block.row) * PROJECTION_CELL,
    z: -(block.hourStart + block.hourLength / 2 - 5.5) * PROJECTION_CELL,
    width: block.minuteLength * PROJECTION_CELL,
    height: PROJECTION_CELL,
    depth: block.hourLength * PROJECTION_CELL,
  };
}
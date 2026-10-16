export type FieldKind = "organic" | "caustic" | "stress";
export type FieldTime = { milliseconds: number; hour: number; minute: number };
export type ReactionTexture = { size: number; values: Float32Array };

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(low: number, high: number, value: number) {
  const amount = clamp((value - low) / (high - low));
  return amount * amount * (3 - 2 * amount);
}

export function createReactionTexture(size = 96, iterations = 320): ReactionTexture {
  let reagent = new Float32Array(size * size).fill(1);
  let activator = new Float32Array(size * size);
  let nextReagent = new Float32Array(size * size);
  let nextActivator = new Float32Array(size * size);
  let seed = 823741;
  const patchCount = Math.max(4, Math.round(size * size / 768));
  for (let patch = 0; patch < patchCount; patch++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const centerX = seed % size;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const centerY = seed % size;
    for (let offsetY = -4; offsetY <= 4; offsetY++) {
      for (let offsetX = -4; offsetX <= 4; offsetX++) {
        if (offsetX ** 2 + offsetY ** 2 > 16) continue;
        const index = ((centerY + offsetY + size) % size) * size + (centerX + offsetX + size) % size;
        reagent[index] = 0.5;
        activator[index] = 0.5;
      }
    }
  }
  for (let iteration = 0; iteration < iterations; iteration++) {
    for (let row = 0; row < size; row++) {
      const above = (row + size - 1) % size * size;
      const below = (row + 1) % size * size;
      const current = row * size;
      for (let column = 0; column < size; column++) {
        const index = current + column;
        const left = (column + size - 1) % size;
        const right = (column + 1) % size;
        const laplaceReagent = -reagent[index]
          + 0.2 * (reagent[current + left] + reagent[current + right] + reagent[above + column] + reagent[below + column])
          + 0.05 * (reagent[above + left] + reagent[above + right] + reagent[below + left] + reagent[below + right]);
        const laplaceActivator = -activator[index]
          + 0.2 * (activator[current + left] + activator[current + right] + activator[above + column] + activator[below + column])
          + 0.05 * (activator[above + left] + activator[above + right] + activator[below + left] + activator[below + right]);
        const reaction = reagent[index] * activator[index] ** 2;
        nextReagent[index] = clamp(reagent[index] + laplaceReagent - reaction + 0.035 * (1 - reagent[index]));
        nextActivator[index] = clamp(activator[index] + 0.5 * laplaceActivator + reaction - 0.096 * activator[index]);
      }
    }
    [reagent, nextReagent] = [nextReagent, reagent];
    [activator, nextActivator] = [nextActivator, activator];
  }
  return { size, values: activator };
}

function sample(values: Float32Array, size: number, pointX: number, pointY: number, wrap = false) {
  if (!wrap && (pointX < 0 || pointY < 0 || pointX >= size - 1 || pointY >= size - 1)) return 0;
  const wrappedX = (pointX % size + size) % size;
  const wrappedY = (pointY % size + size) % size;
  const column = Math.floor(wrappedX);
  const row = Math.floor(wrappedY);
  const amountX = wrappedX - column;
  const amountY = wrappedY - row;
  const right = (column + 1) % size;
  const below = (row + 1) % size;
  return (values[row * size + column] * (1 - amountX) + values[row * size + right] * amountX) * (1 - amountY)
    + (values[below * size + column] * (1 - amountX) + values[below * size + right] * amountX) * amountY;
}

export function renderField(kind: FieldKind, pixels: Uint8ClampedArray, size: number, time: FieldTime, mask: Float32Array, reaction?: ReactionTexture) {
  const phase = (time.milliseconds - 1_704_067_200_000) / 1000;
  const scale = size / 240;
  const hourAngle = time.hour * Math.PI * 2;
  const minuteAngle = time.minute * Math.PI * 2;
  const hourTip = { x: Math.sin(hourAngle) * 0.5, y: -Math.cos(hourAngle) * 0.5 };
  const minuteTip = { x: Math.sin(minuteAngle) * 0.74, y: -Math.cos(minuteAngle) * 0.74 };
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const pixel = (row * size + column) * 4;
      const pointX = column / scale;
      const pointY = row / scale;
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 255;
      if (kind === "organic") {
        const displacementX = 1.7 * Math.sin(pointY * 0.085 + phase * 0.24);
        const displacementY = 1.6 * Math.sin(pointX * 0.072 - phase * 0.19);
        const glyph = sample(mask, size, column + displacementX * scale, row + displacementY * scale);
        const reagent = reaction ? sample(reaction.values, reaction.size,
          pointX * 0.49 + phase * 0.65 + 5 * Math.sin(pointY * 0.028 + phase * 0.08) + glyph * 3,
          pointY * 0.49 + 4 * Math.cos(pointX * 0.032 - phase * 0.07), true) : 0.2;
        const ridge = smoothstep(0.16, 0.33, reagent);
        const cell = glyph * (0.62 + 0.38 * smoothstep(0.08, 0.23, reagent));
        red = (9 + ridge * 14) * (1 - cell) + (152 + ridge * 67) * cell;
        green = (17 + ridge * 45) * (1 - cell) + (207 + ridge * 43) * cell;
        blue = (36 + ridge * 87) * (1 - cell) + (28 + ridge * 37) * cell;
      } else if (kind === "caustic") {
        const waveX = pointX + 7 * Math.sin(pointY * 0.049 + phase * 0.21);
        const waveY = pointY + 6 * Math.sin(pointX * 0.035 - phase * 0.17);
        const first = (1 - Math.abs(Math.sin(waveX * 0.29 + waveY * 0.084 + phase * 0.3))) ** 5;
        const second = (1 - Math.abs(Math.sin(waveX * 0.087 - waveY * 0.27 - phase * 0.24))) ** 5;
        const third = (1 - Math.abs(Math.sin(waveX * 0.13 + waveY * 0.17 + Math.sin(waveX * 0.055 + phase * 0.15) * 2))) ** 9;
        const light = first * 0.8 + second * 0.62 + third * 0.7;
        const glyph = sample(mask, size, column + Math.sin(pointY * 0.12 + phase * 0.21) * scale, row + Math.sin(pointX * 0.1 - phase * 0.18) * scale);
        const glow = glyph * (0.38 + light * 1.2);
        const warm = (1 + Math.sin(waveX * 0.03 + phase * 0.11)) / 2;
        red = 4 + light * 6 + glow * (128 + warm * 115);
        green = 20 + light * 18 + glow * 220;
        blue = 27 + light * 24 + glow * (200 - warm * 95);
      } else {
        const horizontal = (column - size / 2) / (size * 0.47);
        const vertical = (row - size / 2) / (size * 0.47);
        const radius = Math.hypot(horizontal, vertical);
        if (radius > 1) {
          alpha = 0;
        } else {
          const hourX = horizontal - hourTip.x;
          const hourY = vertical - hourTip.y;
          const minuteX = horizontal - minuteTip.x;
          const minuteY = vertical - minuteTip.y;
          const hourDistance = hourX ** 2 + hourY ** 2 + 0.038;
          const minuteDistance = minuteX ** 2 + minuteY ** 2 + 0.032;
          const normal = 0.35 * Math.cos(hourAngle * 2) + 0.47 * Math.cos(minuteAngle * 2)
            + 0.14 * (hourX ** 2 - hourY ** 2) / hourDistance ** 2
            + 0.17 * (minuteX ** 2 - minuteY ** 2) / minuteDistance ** 2;
          const shear = 0.35 * Math.sin(hourAngle * 2) + 0.47 * Math.sin(minuteAngle * 2)
            + 0.28 * hourX * hourY / hourDistance ** 2
            + 0.34 * minuteX * minuteY / minuteDistance ** 2;
          const retardation = Math.hypot(normal, shear) * (4.8 + 0.3 * Math.sin(phase * 0.05)) * (1.14 - radius * 0.25);
          const polarization = 0.24 + 0.76 * Math.sin(Math.atan2(shear, normal) - 0.2) ** 2;
          red = 14 + 239 * polarization * Math.sin(retardation * 0.89) ** 2;
          green = 18 + 233 * polarization * Math.sin(retardation * 1.16 + 0.12) ** 2;
          blue = 21 + 234 * polarization * Math.sin(retardation * 1.48 + 0.28) ** 2;
          alpha = Math.round(255 * clamp((1 - radius) * size / 2));
        }
      }
      pixels[pixel] = red;
      pixels[pixel + 1] = green;
      pixels[pixel + 2] = blue;
      pixels[pixel + 3] = alpha;
    }
  }
}
/**
 * DermaPro — Operações Morfológicas
 *
 * Binário (Uint8Array, valores 0 ou 1):
 *   erode, dilate, morphOpen, morphClose
 *
 * Grayscale (Uint8Array/Uint8ClampedArray, valores 0-255):
 *   grayErode, grayDilate, grayOpen, grayClose
 *
 * Kernels:
 *   createBoxKernel — quadrado de 1s
 *   createDiskKernel — kernel circular
 *
 * Threshold:
 *   otsuThreshold — binarização automática pela variância inter-classes (Otsu 1979)
 */

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type Kernel = {
  mask: Uint8Array;  // flat row-major, 1 = ativo, 0 = ignorado
  size: number;      // largura/altura (sempre ímpar)
};

// ─── KERNELS ─────────────────────────────────────────────────────────────────

/** Kernel quadrado de tamanho size×size, todos elementos ativos. */
export function createBoxKernel(size: number): Kernel {
  if (size % 2 === 0) throw new Error('Kernel size deve ser ímpar');
  return { mask: new Uint8Array(size * size).fill(1), size };
}

/** Kernel circular com raio dado. Size resultante = 2*radius+1. */
export function createDiskKernel(radius: number): Kernel {
  const size = 2 * radius + 1;
  const mask = new Uint8Array(size * size);
  const center = radius;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist2 = (x - center) ** 2 + (y - center) ** 2;
      if (dist2 <= radius * radius) {
        mask[y * size + x] = 1;
      }
    }
  }
  return { mask, size };
}

// ─── MORFOLOGIA BINÁRIA ───────────────────────────────────────────────────────

function clampCoord(v: number, max: number): number {
  return Math.min(max - 1, Math.max(0, v));
}

/** Erosão binária: pixel = 1 apenas se TODOS os vizinhos ativos do kernel são 1. */
export function erode(
  binary: Uint8Array,
  width: number,
  height: number,
  kernelSize: number,
): Uint8Array {
  const kernel = createBoxKernel(kernelSize);
  return _erodeWithKernel(binary, width, height, kernel);
}

function _erodeWithKernel(
  binary: Uint8Array,
  width: number,
  height: number,
  kernel: Kernel,
): Uint8Array {
  const out = new Uint8Array(binary.length);
  const half = Math.floor(kernel.size / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let fits = 1;
      for (let ky = 0; ky < kernel.size && fits; ky++) {
        for (let kx = 0; kx < kernel.size && fits; kx++) {
          if (kernel.mask[ky * kernel.size + kx] === 0) continue;
          const ny = clampCoord(y + ky - half, height);
          const nx = clampCoord(x + kx - half, width);
          if (binary[ny * width + nx] === 0) fits = 0;
        }
      }
      out[y * width + x] = fits;
    }
  }
  return out;
}

/** Dilatação binária: pixel = 1 se QUALQUER vizinho ativo do kernel é 1. */
export function dilate(
  binary: Uint8Array,
  width: number,
  height: number,
  kernelSize: number,
): Uint8Array {
  const kernel = createBoxKernel(kernelSize);
  return _dilateWithKernel(binary, width, height, kernel);
}

function _dilateWithKernel(
  binary: Uint8Array,
  width: number,
  height: number,
  kernel: Kernel,
): Uint8Array {
  const out = new Uint8Array(binary.length);
  const half = Math.floor(kernel.size / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let hit = 0;
      for (let ky = 0; ky < kernel.size && !hit; ky++) {
        for (let kx = 0; kx < kernel.size && !hit; kx++) {
          if (kernel.mask[ky * kernel.size + kx] === 0) continue;
          const ny = clampCoord(y + ky - half, height);
          const nx = clampCoord(x + kx - half, width);
          if (binary[ny * width + nx] === 1) hit = 1;
        }
      }
      out[y * width + x] = hit;
    }
  }
  return out;
}

/** Abertura morfológica binária: erosão seguida de dilatação. Remove ruído pequeno. */
export function morphOpen(
  binary: Uint8Array,
  width: number,
  height: number,
  kernelSize: number,
): Uint8Array {
  return dilate(erode(binary, width, height, kernelSize), width, height, kernelSize);
}

/** Fechamento morfológico binário: dilatação seguida de erosão. Preenche buracos. */
export function morphClose(
  binary: Uint8Array,
  width: number,
  height: number,
  kernelSize: number,
): Uint8Array {
  return erode(dilate(binary, width, height, kernelSize), width, height, kernelSize);
}

// ─── MORFOLOGIA GRAYSCALE ─────────────────────────────────────────────────────

/** Erosão grayscale: mínimo local sobre o kernel (flat structuring element). */
export function grayErode(
  img: Uint8Array,
  width: number,
  height: number,
  kernel: Kernel,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(img.length);
  const half = Math.floor(kernel.size / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minVal = 255;
      for (let ky = 0; ky < kernel.size; ky++) {
        for (let kx = 0; kx < kernel.size; kx++) {
          if (kernel.mask[ky * kernel.size + kx] === 0) continue;
          const ny = clampCoord(y + ky - half, height);
          const nx = clampCoord(x + kx - half, width);
          const v = img[ny * width + nx]!;
          if (v < minVal) minVal = v;
        }
      }
      out[y * width + x] = minVal;
    }
  }
  return out;
}

/** Dilatação grayscale: máximo local sobre o kernel. */
export function grayDilate(
  img: Uint8Array,
  width: number,
  height: number,
  kernel: Kernel,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(img.length);
  const half = Math.floor(kernel.size / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0;
      for (let ky = 0; ky < kernel.size; ky++) {
        for (let kx = 0; kx < kernel.size; kx++) {
          if (kernel.mask[ky * kernel.size + kx] === 0) continue;
          const ny = clampCoord(y + ky - half, height);
          const nx = clampCoord(x + kx - half, width);
          const v = img[ny * width + nx]!;
          if (v > maxVal) maxVal = v;
        }
      }
      out[y * width + x] = maxVal;
    }
  }
  return out;
}

/** Abertura grayscale: erosão seguida de dilatação. */
export function grayOpen(
  img: Uint8Array,
  width: number,
  height: number,
  kernel: Kernel,
): Uint8ClampedArray {
  const eroded = grayErode(img, width, height, kernel);
  return grayDilate(new Uint8Array(eroded.buffer), width, height, kernel);
}

/** Fechamento grayscale: dilatação seguida de erosão. */
export function grayClose(
  img: Uint8Array,
  width: number,
  height: number,
  kernel: Kernel,
): Uint8ClampedArray {
  const dilated = grayDilate(img, width, height, kernel);
  return grayErode(new Uint8Array(dilated.buffer), width, height, kernel);
}

// ─── OTSU THRESHOLD ──────────────────────────────────────────────────────────

/**
 * Binarização automática via método de Otsu (1979).
 * Maximiza a variância inter-classes sobre o histograma.
 *
 * @param img Imagem grayscale [0,255].
 * @param factor Multiplicador do threshold (default 1.0).
 * @returns Threshold encontrado + imagem binária (0 ou 1).
 */
export function otsuThreshold(
  img: Uint8Array,
  factor = 1.0,
): { threshold: number; binary: Uint8Array } {
  const hist = new Float64Array(256);
  for (const v of img) { hist[v] = (hist[v] ?? 0) + 1; }
  const total = img.length;

  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * hist[i]!;

  let wB = 0, wF = 0, sumB = 0;
  let maxVar = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t++) {
    wB += hist[t]!;
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t]!;
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) ** 2;
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }

  const effectiveThreshold = Math.round(threshold * factor);
  const binary = new Uint8Array(img.length);
  for (let i = 0; i < img.length; i++) {
    binary[i] = img[i]! > effectiveThreshold ? 1 : 0;
  }

  return { threshold: effectiveThreshold, binary };
}

/**
 * DermaPro — Gaussian Blur 2D Separável
 *
 * Implementação eficiente via duas convoluções 1D (horizontal + vertical).
 * Tratamento de bordas por replicação simétrica (BORDER_REFLECT_101):
 *   [a,b,c,d] → ...c,b,a,b,c,d,c,b...
 */

// ─── KERNEL 1D ────────────────────────────────────────────────────────────────

/**
 * Gera kernel Gaussiano 1D normalizado (soma = 1).
 * Tamanho automático: ceil(3σ) * 2 + 1.
 */
export function createGaussianKernel1D(sigma: number): Float32Array {
  const halfSize = Math.ceil(3 * sigma);
  const size = 2 * halfSize + 1;
  const kernel = new Float32Array(size);
  const twoSigma2 = 2 * sigma * sigma;
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - halfSize;
    kernel[i] = Math.exp(-(x * x) / twoSigma2);
    sum += kernel[i]!;
  }
  for (let i = 0; i < size; i++) kernel[i]! / sum;  // normaliza em-place
  for (let i = 0; i < size; i++) kernel[i] = kernel[i]! / sum;
  return kernel;
}

// ─── BORDA ────────────────────────────────────────────────────────────────────

/** Índice com reflexão simétrica: [a,b,c] → b,a,b,c,b,a */
function reflectIdx(i: number, n: number): number {
  if (i < 0)  return -i;            // -1→1, -2→2 (sem repetir borda)
  if (i >= n) return 2 * n - 2 - i; // n→n-2, n+1→n-3
  return i;
}

// ─── CONVOLUÇÕES 1D ──────────────────────────────────────────────────────────

/**
 * Convolução 1D horizontal: aplica o kernel a cada linha.
 */
export function convolve1DHorizontal(
  img: Float32Array,
  width: number,
  height: number,
  kernel: Float32Array,
): Float32Array {
  const out = new Float32Array(img.length);
  const half = Math.floor(kernel.length / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const sx = reflectIdx(x + k - half, width);
        sum += img[y * width + sx]! * kernel[k]!;
      }
      out[y * width + x] = sum;
    }
  }
  return out;
}

/**
 * Convolução 1D vertical: aplica o kernel a cada coluna.
 */
export function convolve1DVertical(
  img: Float32Array,
  width: number,
  height: number,
  kernel: Float32Array,
): Float32Array {
  const out = new Float32Array(img.length);
  const half = Math.floor(kernel.length / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const sy = reflectIdx(y + k - half, height);
        sum += img[sy * width + x]! * kernel[k]!;
      }
      out[y * width + x] = sum;
    }
  }
  return out;
}

// ─── GAUSSIAN BLUR 2D ────────────────────────────────────────────────────────

/**
 * Gaussian blur 2D separável.
 *
 * @param img Imagem de entrada (Uint8Array, Uint8ClampedArray ou Float32Array).
 * @param sigma Desvio-padrão em pixels.
 * @returns Float32Array com valores borrados no intervalo original.
 */
export function gaussianBlur(
  img: Uint8Array | Uint8ClampedArray | Float32Array,
  width: number,
  height: number,
  sigma: number,
): Float32Array {
  const kernel = createGaussianKernel1D(sigma);
  const f32 = img instanceof Float32Array
    ? img
    : Float32Array.from(img);
  const horizontal = convolve1DHorizontal(f32, width, height, kernel);
  return convolve1DVertical(horizontal, width, height, kernel);
}

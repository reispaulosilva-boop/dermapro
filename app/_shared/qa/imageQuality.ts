/**
 * DermaPro — QA de Imagem
 *
 * Valida uploads antes de processamento:
 *   - Dimensões mínimas
 *   - Foco (variância do Laplaciano)
 *   - Brilho médio (canal V do HSV)
 *   - Assimetria lateral de iluminação (side bias)
 *
 * Funções puras recebem dados brutos para facilitar testes.
 * runQualityChecks() é o ponto de entrada para uso com HTMLCanvasElement.
 */

import { rgbToHsv } from '../ml/hsvColorSpace';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type QualityCheckResult = {
  passed: boolean;
  warnings: string[];
  errors: string[];
  metrics: {
    width: number;
    height: number;
    aspectRatio: number;
    blurScore: number;       // variância do Laplaciano — maior = mais nítido
    avgBrightness: number;   // média de V do HSV [0,255]
    sideBias: number;        // |média esquerda − média direita| em V
  };
};

export type QualityCheckOptions = {
  minWidth: number;
  minHeight: number;
  maxBlurScore?: number;     // erro se blurScore < maxBlurScore (imagem muito borrada)
  minBrightness?: number;    // warning se avgBrightness < minBrightness
  maxBrightness?: number;    // warning se avgBrightness > maxBrightness
  maxSideBias?: number;      // warning se sideBias > maxSideBias
};

// ─── FUNÇÕES PURAS ───────────────────────────────────────────────────────────

/**
 * Variância do Laplaciano como medida de nitidez/foco.
 * Kernel Laplaciano: [0,1,0; 1,-4,1; 0,1,0].
 * Alta variância = imagem nítida. Baixa variância = borrada.
 */
export function computeLaplacianVariance(
  gray: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
): number {
  if (width < 3 || height < 3) return 0;
  const lap: number[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const center = gray[y * width + x]!;
      const val =
        gray[(y - 1) * width + x]! +
        gray[(y + 1) * width + x]! +
        gray[y * width + (x - 1)]! +
        gray[y * width + (x + 1)]! -
        4 * center;
      lap.push(val);
    }
  }

  if (lap.length === 0) return 0;
  const mean = lap.reduce((s, v) => s + v, 0) / lap.length;
  return lap.reduce((s, v) => s + (v - mean) ** 2, 0) / lap.length;
}

/**
 * Brilho médio via canal V do HSV [0,255].
 * Usa imageData (RGBA) como entrada.
 */
export function computeAvgBrightness(imageData: ImageData): number {
  const { data, width, height } = imageData;
  const n = width * height;
  if (n === 0) return 0;
  let sumV = 0;
  for (let i = 0; i < n; i++) {
    const r = data[i * 4]!;
    const g = data[i * 4 + 1]!;
    const b = data[i * 4 + 2]!;
    sumV += rgbToHsv({ r, g, b }).v;
  }
  return sumV / n;
}

/**
 * Assimetria lateral de iluminação.
 * Compara média de brilho (V) entre metade esquerda e direita.
 * Retorna diferença absoluta [0,255].
 */
export function computeSideBias(imageData: ImageData): number {
  const { data, width, height } = imageData;
  if (width < 2) return 0;
  const half = Math.floor(width / 2);
  let leftSum = 0, rightSum = 0;
  let leftN = 0, rightN = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const v = rgbToHsv({ r: data[i * 4]!, g: data[i * 4 + 1]!, b: data[i * 4 + 2]! }).v;
      if (x < half) { leftSum += v; leftN++; }
      else          { rightSum += v; rightN++; }
    }
  }

  const leftMean  = leftN  > 0 ? leftSum  / leftN  : 0;
  const rightMean = rightN > 0 ? rightSum / rightN : 0;
  return Math.abs(leftMean - rightMean);
}

// ─── EXTRAÇÃO DE GRAYSCALE ────────────────────────────────────────────────────

function toGray(imageData: ImageData): Uint8ClampedArray {
  const { data, width, height } = imageData;
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = Math.round(
      0.299 * data[i * 4]! +
      0.587 * data[i * 4 + 1]! +
      0.114 * data[i * 4 + 2]!,
    );
  }
  return gray;
}

// ─── PONTO DE ENTRADA ─────────────────────────────────────────────────────────

/**
 * Executa todas as verificações de qualidade em um canvas.
 *
 * @param canvas HTMLCanvasElement com a imagem carregada.
 * @param opts Critérios de aceitação.
 */
export function runQualityChecks(
  canvas: HTMLCanvasElement,
  opts: QualityCheckOptions,
): QualityCheckResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const { width, height } = canvas;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      passed: false, warnings, errors: ['Não foi possível obter contexto 2D do canvas.'],
      metrics: { width, height, aspectRatio: 0, blurScore: 0, avgBrightness: 0, sideBias: 0 },
    };
  }

  // Dimensões mínimas
  if (width < opts.minWidth || height < opts.minHeight) {
    errors.push(
      `Imagem muito pequena (${width}×${height}px). Mínimo: ${opts.minWidth}×${opts.minHeight}px.`,
    );
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const gray = toGray(imageData);

  const blurScore     = computeLaplacianVariance(gray, width, height);
  const avgBrightness = computeAvgBrightness(imageData);
  const sideBias      = computeSideBias(imageData);
  const aspectRatio   = height > 0 ? width / height : 0;

  // Foco
  if (opts.maxBlurScore !== undefined && blurScore < opts.maxBlurScore) {
    errors.push(`Imagem muito borrada (score ${blurScore.toFixed(1)}, mínimo ${opts.maxBlurScore}).`);
  }

  // Brilho
  if (opts.minBrightness !== undefined && avgBrightness < opts.minBrightness) {
    warnings.push(`Imagem muito escura (brilho médio ${avgBrightness.toFixed(0)}/255).`);
  }
  if (opts.maxBrightness !== undefined && avgBrightness > opts.maxBrightness) {
    warnings.push(`Imagem muito clara/sobreexposta (brilho médio ${avgBrightness.toFixed(0)}/255).`);
  }

  // Assimetria lateral
  if (opts.maxSideBias !== undefined && sideBias > opts.maxSideBias) {
    warnings.push(`Iluminação lateral desigual (bias ${sideBias.toFixed(1)}). Prefira luz frontal difusa.`);
  }

  return {
    passed: errors.length === 0,
    warnings, errors,
    metrics: { width, height, aspectRatio, blurScore, avgBrightness, sideBias },
  };
}

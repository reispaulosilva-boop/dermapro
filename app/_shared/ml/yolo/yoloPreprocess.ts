/**
 * DermaPro — YOLOv8 Pré-processamento
 *
 * Converte um HTMLCanvasElement para o tensor de entrada do YOLOv8:
 *   1. Letterbox: redimensiona mantendo aspect ratio, preenche com cinza 114.
 *   2. Normalização: [0,255] → [0,1].
 *   3. Reordenação: HWC (RGBA) → CHW (RGB), layout esperado pelo ONNX.
 */

export interface PreprocessResult {
  /** Float32Array no layout CHW [1, 3, H, W], valores em [0, 1] */
  tensor: Float32Array;
  dims: [1, 3, number, number];
  /** Fator de escala aplicado: min(targetSize/origW, targetSize/origH) */
  scale: number;
  /** Padding horizontal (px, cada lado) adicionado para centralizar no letterbox */
  padX: number;
  /** Padding vertical (px, cada lado) adicionado para centralizar no letterbox */
  padY: number;
}

// ─── HELPERS PUROS (exportados para testes) ───────────────────────────────────

export interface LetterboxParams {
  scale: number;
  scaledW: number;
  scaledH: number;
  padX: number;
  padY: number;
}

/** Calcula os parâmetros do letterbox sem fazer I/O de pixel. */
export function computeLetterboxParams(
  origW: number,
  origH: number,
  targetSize: number,
): LetterboxParams {
  const scale   = Math.min(targetSize / origW, targetSize / origH);
  const scaledW = Math.round(origW * scale);
  const scaledH = Math.round(origH * scale);
  const padX    = Math.floor((targetSize - scaledW) / 2);
  const padY    = Math.floor((targetSize - scaledH) / 2);
  return { scale, scaledW, scaledH, padX, padY };
}

/**
 * Converte pixels RGBA (Uint8ClampedArray, layout HWC) para Float32Array CHW.
 * `size` = largura = altura da imagem (quadrada após letterbox).
 * Canal alpha é descartado.
 */
export function imageDataToTensor(
  data: Uint8ClampedArray,
  size: number,
): Float32Array {
  const n = size * size;
  const tensor = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    tensor[i]         = data[i * 4]!     / 255; // R
    tensor[n + i]     = data[i * 4 + 1]! / 255; // G
    tensor[2 * n + i] = data[i * 4 + 2]! / 255; // B
  }
  return tensor;
}

// ─── PONTO DE ENTRADA ─────────────────────────────────────────────────────────

/**
 * Redimensiona o canvas para targetSize×targetSize via letterbox (padding cinza 114),
 * extrai RGB normalizado em [0,1] e reorganiza em layout CHW para inferência YOLOv8.
 */
export function preprocessImageForYOLO(
  canvas: HTMLCanvasElement,
  targetSize: number,
): PreprocessResult {
  const { scale, scaledW, scaledH, padX, padY } =
    computeLetterboxParams(canvas.width, canvas.height, targetSize);

  const lb = document.createElement('canvas');
  lb.width = lb.height = targetSize;
  const ctx = lb.getContext('2d')!;

  // Fundo cinza letterbox (YOLOv8 padrão: 114, 114, 114)
  ctx.fillStyle = `rgb(114,114,114)`;
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(canvas, padX, padY, scaledW, scaledH);

  const { data } = ctx.getImageData(0, 0, targetSize, targetSize);
  const tensor = imageDataToTensor(data, targetSize);

  return { tensor, dims: [1, 3, targetSize, targetSize], scale, padX, padY };
}

/**
 * DermaPro — CLAHE (Contrast Limited Adaptive Histogram Equalization)
 *
 * Implementação baseada em Zuiderveld 1994.
 * Esta versão aplica a CDF do tile local a cada pixel (sem interpolação bilinear).
 * TODO: Adicionar interpolação bilinear entre CDFs dos 4 tiles vizinhos para
 *       eliminar artefatos de borda entre tiles (Zuiderveld §4).
 *
 * Referência: K. Zuiderveld, "Contrast Limited Adaptive Histogram Equalization",
 * in Graphics Gems IV, Academic Press, 1994, pp. 474–485.
 */

/**
 * Equalização de histograma adaptativa com limite de contraste.
 *
 * @param gray Imagem grayscale [0,255] (Uint8Array ou Uint8ClampedArray).
 * @param width Largura da imagem em pixels.
 * @param height Altura da imagem em pixels.
 * @param clipLimit Fator de clipping (típico: 2.0–4.0). Maior = mais contraste.
 * @param tileSize Tamanho de cada tile em pixels (típico: 8).
 * @returns Imagem equalizada [0,255] como Uint8ClampedArray.
 */
export function clahe(
  gray: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  clipLimit = 2.0,
  tileSize = 8,
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(gray.length);
  const tilesX = Math.ceil(width  / tileSize);
  const tilesY = Math.ceil(height / tileSize);

  // Pré-calcular CDF normalizada [0,255] para cada tile
  const cdfs: Uint8ClampedArray[][] = [];

  for (let ty = 0; ty < tilesY; ty++) {
    cdfs[ty] = [];
    for (let tx = 0; tx < tilesX; tx++) {
      cdfs[ty]![tx] = buildTileCDF(gray, width, height, tx, ty, tileSize, clipLimit);
    }
  }

  // Aplicar CDF do tile local a cada pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tx = Math.min(Math.floor(x / tileSize), tilesX - 1);
      const ty = Math.min(Math.floor(y / tileSize), tilesY - 1);
      const pixelVal = gray[y * width + x]!;
      output[y * width + x] = cdfs[ty]![tx]![pixelVal]!;
    }
  }

  return output;
}

/**
 * Calcula a CDF normalizada [0,255] para um único tile.
 * Inclui clipping e redistribuição do excesso.
 */
function buildTileCDF(
  gray: Uint8Array | Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  tx: number,
  ty: number,
  tileSize: number,
  clipLimit: number,
): Uint8ClampedArray {
  const x0 = tx * tileSize;
  const y0 = ty * tileSize;
  const x1 = Math.min(x0 + tileSize, imgWidth);
  const y1 = Math.min(y0 + tileSize, imgHeight);
  const tileArea = (x1 - x0) * (y1 - y0);

  // Histograma
  const hist = new Int32Array(256);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const pv = gray[y * imgWidth + x]!;
      hist[pv] = (hist[pv] ?? 0) + 1;
    }
  }

  // Clip: limitar picos e redistribuir excesso uniformemente
  const clipThreshold = Math.max(1, Math.round(clipLimit * tileArea / 256));
  let excess = 0;
  for (let i = 0; i < 256; i++) {
    if (hist[i]! > clipThreshold) {
      excess += hist[i]! - clipThreshold;
      hist[i] = clipThreshold;
    }
  }
  // Redistribui excesso de forma uniforme
  const redistPerBin = Math.floor(excess / 256);
  const residual     = excess - redistPerBin * 256;
  for (let i = 0; i < 256; i++) {
    hist[i]! += redistPerBin;
    if (i < residual) hist[i]!++;
  }

  // CDF acumulada
  const cdf = new Float64Array(256);
  let cumSum = 0;
  for (let i = 0; i < 256; i++) {
    cumSum += hist[i]!;
    cdf[i] = cumSum;
  }

  // Normaliza CDF para [0, 255] excluindo zeros iniciais
  let cdfMin = 0;
  for (let i = 0; i < 256; i++) {
    if (cdf[i]! > 0) { cdfMin = cdf[i]!; break; }
  }
  const cdfMax  = cdf[255]!;
  const cdfRange = cdfMax - cdfMin;

  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    if (cdfRange > 0) {
      lut[i] = Math.round(((cdf[i]! - cdfMin) / cdfRange) * 255);
    }
  }

  return lut;
}

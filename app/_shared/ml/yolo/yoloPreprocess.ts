// TODO (Bloco 5): implementar yoloPreprocess completo

export interface PreprocessResult {
  /** Float32Array no layout CHW [1, 3, H, W], valores em [0, 1] */
  tensor: Float32Array;
  dims: [1, 3, number, number];
  /** Fator de escala aplicado: min(targetSize/origW, targetSize/origH) */
  scale: number;
  /** Padding horizontal (px) adicionado para centralizar no letterbox */
  padX: number;
  /** Padding vertical (px) adicionado para centralizar no letterbox */
  padY: number;
}

/**
 * Redimensiona o canvas para targetSize×targetSize via letterbox (padding cinza 114,114,114),
 * extrai RGB normalizado em [0,1] e reorganiza em layout CHW para inferência YOLOv8.
 */
export function preprocessImageForYOLO(
  _canvas: HTMLCanvasElement,
  _targetSize: number
): PreprocessResult {
  // TODO (Bloco 5): letterbox + normalização + CHW reorder
  throw new Error('preprocessImageForYOLO: não implementado ainda (Bloco 5)');
}

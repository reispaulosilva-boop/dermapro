// TODO (Bloco 5): implementar yoloPostprocess completo

export interface Detection {
  /** Coordenadas [x1, y1, x2, y2] em pixels da imagem ORIGINAL (pós-rescale) */
  bbox: [number, number, number, number];
  score: number;
  classId: number;
  className: string;
}

/**
 * Decodifica a saída bruta do YOLOv8 (shape [1, 5, 8400] para single-class).
 * Layout: attribute_idx * 8400 + anchor_idx  (cx, cy, w, h, score).
 */
export function decodeYolov8Output(
  _output: Float32Array,
  _dims: number[],
  _confThreshold: number,
  _classNames: string[]
): Detection[] {
  // TODO (Bloco 5)
  throw new Error('decodeYolov8Output: não implementado ainda (Bloco 5)');
}

/** Intersection over Union entre dois bboxes. */
export function iou(_a: Detection, _b: Detection): number {
  // TODO (Bloco 5)
  throw new Error('iou: não implementado ainda (Bloco 5)');
}

/** Remove detecções sobrepostas mantendo a de maior score. */
export function nonMaxSuppression(_detections: Detection[], _iouThreshold: number): Detection[] {
  // TODO (Bloco 5)
  throw new Error('nonMaxSuppression: não implementado ainda (Bloco 5)');
}

/** Converte coordenadas do espaço letterbox para espaço da imagem original. */
export function rescaleDetections(
  _detections: Detection[],
  _scale: number,
  _padX: number,
  _padY: number
): Detection[] {
  // TODO (Bloco 5)
  throw new Error('rescaleDetections: não implementado ainda (Bloco 5)');
}

/** Orquestrador: decode → NMS → rescale. */
export function postprocessYoloOutput(
  output: Float32Array,
  dims: number[],
  scale: number,
  padX: number,
  padY: number,
  confThreshold: number,
  iouThreshold: number,
  classNames: string[]
): Detection[] {
  // TODO (Bloco 5)
  void output; void dims; void scale; void padX; void padY;
  void confThreshold; void iouThreshold; void classNames;
  throw new Error('postprocessYoloOutput: não implementado ainda (Bloco 5)');
}

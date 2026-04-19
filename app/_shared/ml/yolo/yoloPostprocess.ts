/**
 * DermaPro — YOLOv8 Pós-processamento
 *
 * Pipeline: decode → NMS → rescale para coordenadas da imagem original.
 *
 * Formato de saída YOLOv8 single-class (shape [1, 5, 8400]):
 *   output[attr * 8400 + anchor] onde attr = cx(0), cy(1), w(2), h(3), score(4).
 * Coordenadas estão no espaço do letterbox (targetSize × targetSize).
 */

export interface Detection {
  /** Coordenadas [x1, y1, x2, y2] em pixels da imagem ORIGINAL (pós-rescale) */
  bbox: [number, number, number, number];
  score: number;
  classId: number;
  className: string;
}

// ─── DECODE ───────────────────────────────────────────────────────────────────

/**
 * Decodifica a saída bruta do YOLOv8 (shape [1, 5, 8400] para single-class).
 * Filtra por confThreshold e converte cx,cy,w,h → x1,y1,x2,y2.
 */
export function decodeYolov8Output(
  output: Float32Array,
  dims: number[],
  confThreshold: number,
  classNames: string[],
): Detection[] {
  const numAnchors = dims[2] ?? 8400;
  const detections: Detection[] = [];

  for (let i = 0; i < numAnchors; i++) {
    const score = output[4 * numAnchors + i]!;
    if (score < confThreshold) continue;

    const cx = output[0 * numAnchors + i]!;
    const cy = output[1 * numAnchors + i]!;
    const w  = output[2 * numAnchors + i]!;
    const h  = output[3 * numAnchors + i]!;

    detections.push({
      bbox: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2],
      score,
      classId: 0,
      className: classNames[0] ?? 'lesao_acneiforme',
    });
  }

  return detections;
}

// ─── IOU / NMS ────────────────────────────────────────────────────────────────

/** Intersection over Union entre dois bboxes [x1,y1,x2,y2]. */
export function iou(a: Detection, b: Detection): number {
  const ix1 = Math.max(a.bbox[0], b.bbox[0]);
  const iy1 = Math.max(a.bbox[1], b.bbox[1]);
  const ix2 = Math.min(a.bbox[2], b.bbox[2]);
  const iy2 = Math.min(a.bbox[3], b.bbox[3]);

  if (ix2 <= ix1 || iy2 <= iy1) return 0;

  const inter = (ix2 - ix1) * (iy2 - iy1);
  const aArea = (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]);
  const bArea = (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]);
  return inter / (aArea + bArea - inter);
}

/** Remove detecções sobrepostas mantendo a de maior score (greedy NMS). */
export function nonMaxSuppression(
  detections: Detection[],
  iouThreshold: number,
): Detection[] {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const kept: Detection[] = [];
  const suppressed = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue;
    kept.push(sorted[i]!);
    for (let j = i + 1; j < sorted.length; j++) {
      if (!suppressed.has(j) && iou(sorted[i]!, sorted[j]!) > iouThreshold) {
        suppressed.add(j);
      }
    }
  }

  return kept;
}

// ─── RESCALE ──────────────────────────────────────────────────────────────────

/**
 * Converte coordenadas do espaço letterbox para espaço da imagem original.
 * Desfaz o padding e o scale aplicados em preprocessImageForYOLO.
 */
export function rescaleDetections(
  detections: Detection[],
  scale: number,
  padX: number,
  padY: number,
): Detection[] {
  return detections.map(det => ({
    ...det,
    bbox: [
      (det.bbox[0] - padX) / scale,
      (det.bbox[1] - padY) / scale,
      (det.bbox[2] - padX) / scale,
      (det.bbox[3] - padY) / scale,
    ] as [number, number, number, number],
  }));
}

// ─── ORQUESTRADOR ─────────────────────────────────────────────────────────────

/** decode → NMS → rescale em uma única chamada. */
export function postprocessYoloOutput(
  output: Float32Array,
  dims: number[],
  scale: number,
  padX: number,
  padY: number,
  confThreshold: number,
  iouThreshold: number,
  classNames: string[],
): Detection[] {
  const raw    = decodeYolov8Output(output, dims, confThreshold, classNames);
  const nmsed  = nonMaxSuppression(raw, iouThreshold);
  return rescaleDetections(nmsed, scale, padX, padY);
}

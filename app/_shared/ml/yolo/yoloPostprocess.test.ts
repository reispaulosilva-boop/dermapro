import { describe, it, expect } from 'vitest';
import {
  decodeYolov8Output, iou, nonMaxSuppression,
  rescaleDetections, postprocessYoloOutput,
  type Detection,
} from './yoloPostprocess';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CLASS_NAMES = ['lesao_acneiforme'];

/** Monta um Float32Array no layout YOLOv8 [1, 5, 8400]. */
function makeYoloOutput(
  anchors: Array<{ cx: number; cy: number; w: number; h: number; score: number }>,
  numAnchors = 8400,
): { output: Float32Array; dims: number[] } {
  const output = new Float32Array(5 * numAnchors).fill(0);
  anchors.forEach(({ cx, cy, w, h, score }, i) => {
    output[0 * numAnchors + i] = cx;
    output[1 * numAnchors + i] = cy;
    output[2 * numAnchors + i] = w;
    output[3 * numAnchors + i] = h;
    output[4 * numAnchors + i] = score;
  });
  return { output, dims: [1, 5, numAnchors] };
}

function makeDetection(x1: number, y1: number, x2: number, y2: number, score = 0.9): Detection {
  return { bbox: [x1, y1, x2, y2], score, classId: 0, className: 'lesao_acneiforme' };
}

// ─── decodeYolov8Output ───────────────────────────────────────────────────────

describe('decodeYolov8Output', () => {
  it('saída zerada → nenhuma detecção (score=0 < threshold)', () => {
    const { output, dims } = makeYoloOutput([]);
    const dets = decodeYolov8Output(output, dims, 0.25, CLASS_NAMES);
    expect(dets).toHaveLength(0);
  });

  it('1 anchor com score alto → 1 detecção', () => {
    const { output, dims } = makeYoloOutput([
      { cx: 100, cy: 100, w: 50, h: 50, score: 0.8 },
    ]);
    const dets = decodeYolov8Output(output, dims, 0.25, CLASS_NAMES);
    expect(dets).toHaveLength(1);
    expect(dets[0]!.score).toBeCloseTo(0.8);
  });

  it('cx,cy,w,h → bbox [x1,y1,x2,y2] correto', () => {
    // cx=100, cy=100, w=40, h=60 → x1=80, y1=70, x2=120, y2=130
    const { output, dims } = makeYoloOutput([
      { cx: 100, cy: 100, w: 40, h: 60, score: 0.9 },
    ]);
    const dets = decodeYolov8Output(output, dims, 0.25, CLASS_NAMES);
    expect(dets[0]!.bbox[0]).toBeCloseTo(80);
    expect(dets[0]!.bbox[1]).toBeCloseTo(70);
    expect(dets[0]!.bbox[2]).toBeCloseTo(120);
    expect(dets[0]!.bbox[3]).toBeCloseTo(130);
  });

  it('anchor abaixo do threshold é filtrado', () => {
    const { output, dims } = makeYoloOutput([
      { cx: 100, cy: 100, w: 40, h: 40, score: 0.1 }, // abaixo de 0.25
      { cx: 200, cy: 200, w: 40, h: 40, score: 0.9 }, // acima
    ]);
    const dets = decodeYolov8Output(output, dims, 0.25, CLASS_NAMES);
    expect(dets).toHaveLength(1);
    expect(dets[0]!.score).toBeCloseTo(0.9);
  });

  it('className é atribuído corretamente', () => {
    const { output, dims } = makeYoloOutput([
      { cx: 50, cy: 50, w: 20, h: 20, score: 0.7 },
    ]);
    const dets = decodeYolov8Output(output, dims, 0.25, CLASS_NAMES);
    expect(dets[0]!.className).toBe('lesao_acneiforme');
    expect(dets[0]!.classId).toBe(0);
  });
});

// ─── iou ─────────────────────────────────────────────────────────────────────

describe('iou', () => {
  it('bboxes sem sobreposição → 0', () => {
    const a = makeDetection(0, 0, 10, 10);
    const b = makeDetection(20, 20, 30, 30);
    expect(iou(a, b)).toBe(0);
  });

  it('bboxes idênticos → 1', () => {
    const a = makeDetection(0, 0, 10, 10);
    expect(iou(a, a)).toBeCloseTo(1);
  });

  it('sobreposição parcial → valor entre 0 e 1', () => {
    const a = makeDetection(0, 0, 10, 10);
    const b = makeDetection(5, 5, 15, 15);
    const result = iou(a, b);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
    // Interseção: 5×5=25; União: 100+100-25=175; IoU = 25/175 ≈ 0.143
    expect(result).toBeCloseTo(25 / 175, 3);
  });

  it('adjacentes (sem área de interseção) → 0', () => {
    const a = makeDetection(0, 0, 10, 10);
    const b = makeDetection(10, 0, 20, 10);
    expect(iou(a, b)).toBe(0);
  });
});

// ─── nonMaxSuppression ────────────────────────────────────────────────────────

describe('nonMaxSuppression', () => {
  it('lista vazia → lista vazia', () => {
    expect(nonMaxSuppression([], 0.45)).toEqual([]);
  });

  it('1 detecção → retorna ela', () => {
    const d = makeDetection(0, 0, 10, 10);
    expect(nonMaxSuppression([d], 0.45)).toHaveLength(1);
  });

  it('2 detecções sem sobreposição → ambas mantidas', () => {
    const a = makeDetection(0,  0,  10, 10, 0.9);
    const b = makeDetection(50, 50, 60, 60, 0.8);
    expect(nonMaxSuppression([a, b], 0.45)).toHaveLength(2);
  });

  it('2 detecções sobrepostas → apenas a de maior score é mantida', () => {
    const high = makeDetection(0, 0, 10, 10, 0.9);
    const low  = makeDetection(1, 1, 11, 11, 0.5); // IoU alto com high
    const kept = nonMaxSuppression([high, low], 0.45);
    expect(kept).toHaveLength(1);
    expect(kept[0]!.score).toBeCloseTo(0.9);
  });

  it('ordena por score antes de suprimir', () => {
    const low  = makeDetection(0, 0, 10, 10, 0.3);
    const high = makeDetection(1, 1, 11, 11, 0.9);
    const kept = nonMaxSuppression([low, high], 0.45);
    expect(kept).toHaveLength(1);
    expect(kept[0]!.score).toBeCloseTo(0.9);
  });
});

// ─── rescaleDetections ────────────────────────────────────────────────────────

describe('rescaleDetections', () => {
  it('scale=1, pad=0 → coordenadas inalteradas', () => {
    const d = makeDetection(10, 20, 50, 80);
    const result = rescaleDetections([d], 1, 0, 0);
    expect(result[0]!.bbox).toEqual([10, 20, 50, 80]);
  });

  it('desfaz padding horizontal', () => {
    // padX=80 significa que o objeto está deslocado 80px à direita no letterbox
    const d = makeDetection(90, 10, 130, 50); // x original = 90-80 = 10
    const result = rescaleDetections([d], 1, 80, 0);
    expect(result[0]!.bbox[0]).toBeCloseTo(10);
    expect(result[0]!.bbox[2]).toBeCloseTo(50);
  });

  it('desfaz scale', () => {
    // scale=0.5 → coordenadas letterbox são metade das originais
    const d = makeDetection(50, 100, 150, 200);
    const result = rescaleDetections([d], 0.5, 0, 0);
    expect(result[0]!.bbox[0]).toBeCloseTo(100);
    expect(result[0]!.bbox[1]).toBeCloseTo(200);
    expect(result[0]!.bbox[2]).toBeCloseTo(300);
    expect(result[0]!.bbox[3]).toBeCloseTo(400);
  });

  it('desfaz pad e scale combinados', () => {
    // padX=80, scale=0.5: bbox=(90,10,130,50) → ((90-80)/0.5, 10/0.5) = (20, 20)
    const d = makeDetection(90, 10, 130, 50);
    const result = rescaleDetections([d], 0.5, 80, 0);
    expect(result[0]!.bbox[0]).toBeCloseTo(20);
    expect(result[0]!.bbox[1]).toBeCloseTo(20);
  });
});

// ─── postprocessYoloOutput ────────────────────────────────────────────────────

describe('postprocessYoloOutput', () => {
  it('saída zerada → nenhuma detecção', () => {
    const { output, dims } = makeYoloOutput([]);
    const dets = postprocessYoloOutput(output, dims, 1, 0, 0, 0.25, 0.45, CLASS_NAMES);
    expect(dets).toHaveLength(0);
  });

  it('1 detecção válida → coordenadas rescaladas corretamente', () => {
    // scale=1, padX=80, padY=0; bbox letterbox = [100, 50, 140, 90]
    // cx=120, cy=70, w=40, h=40
    const { output, dims } = makeYoloOutput([
      { cx: 120, cy: 70, w: 40, h: 40, score: 0.9 },
    ]);
    const dets = postprocessYoloOutput(output, dims, 1, 80, 0, 0.25, 0.45, CLASS_NAMES);
    expect(dets).toHaveLength(1);
    expect(dets[0]!.bbox[0]).toBeCloseTo(20); // (100 - 80) / 1
    expect(dets[0]!.bbox[2]).toBeCloseTo(60); // (140 - 80) / 1
  });

  it('2 detecções muito sobrepostas → NMS remove a de menor score', () => {
    const { output, dims } = makeYoloOutput([
      { cx: 100, cy: 100, w: 40, h: 40, score: 0.9 },
      { cx: 102, cy: 102, w: 40, h: 40, score: 0.5 }, // praticamente idêntico
    ]);
    const dets = postprocessYoloOutput(output, dims, 1, 0, 0, 0.25, 0.45, CLASS_NAMES);
    expect(dets).toHaveLength(1);
    expect(dets[0]!.score).toBeCloseTo(0.9);
  });
});

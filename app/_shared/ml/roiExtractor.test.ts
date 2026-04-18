import { describe, it, expect } from 'vitest';
import {
  isPointInPolygon, isPointInROI, polygonToBbox, polygonArea,
  extractForeheadROI, extractLeftCheekROI, extractRightCheekROI,
  extractChinROI, extractNoseROI, extractSupralabialROI,
  interpupillaryDistancePx, estimateFaceAreaCm2,
  type FacialPoint, type SkinROI,
} from './roiExtractor';

// ─── LANDMARKS SINTÉTICOS ─────────────────────────────────────────────────────
// 478 pontos distribuídos em uma grade face-like normalizada [0,1]
function makeLandmarks(count = 478): FacialPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 0.2 + (i % 30) * 0.02,
    y: 0.1 + Math.floor(i / 30) * 0.03,
    z: 0,
  }));
}

const LM = makeLandmarks();

// ─── isPointInPolygon ────────────────────────────────────────────────────────

describe('isPointInPolygon', () => {
  const square: FacialPoint[] = [
    { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
  ];

  it('ponto interior ao quadrado → true', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('ponto exterior ao quadrado → false', () => {
    expect(isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
  });

  it('triângulo: ponto interior → true', () => {
    const tri: FacialPoint[] = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 6 }];
    expect(isPointInPolygon({ x: 3, y: 2 }, tri)).toBe(true);
  });

  it('triângulo: ponto exterior → false', () => {
    const tri: FacialPoint[] = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 6 }];
    expect(isPointInPolygon({ x: 5, y: 5 }, tri)).toBe(false);
  });
});

// ─── isPointInROI ────────────────────────────────────────────────────────────

describe('isPointInROI', () => {
  const outerSquare: FacialPoint[] = [
    { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 },
  ];
  const innerHole: FacialPoint[] = [
    { x: 5, y: 5 }, { x: 15, y: 5 }, { x: 15, y: 15 }, { x: 5, y: 15 },
  ];
  const roi: SkinROI = {
    name: 'test', polygon: outerSquare, holes: [innerHole],
    bbox: polygonToBbox(outerSquare),
  };

  it('ponto dentro do outer mas fora do hole → true', () => {
    expect(isPointInROI({ x: 1, y: 1 }, roi)).toBe(true);
  });

  it('ponto dentro do hole → false', () => {
    expect(isPointInROI({ x: 10, y: 10 }, roi)).toBe(false);
  });

  it('ponto fora do outer → false', () => {
    expect(isPointInROI({ x: 25, y: 25 }, roi)).toBe(false);
  });
});

// ─── polygonToBbox / polygonArea ─────────────────────────────────────────────

describe('polygonToBbox', () => {
  it('retorna bounding box correto', () => {
    const poly: FacialPoint[] = [{ x: 2, y: 3 }, { x: 8, y: 1 }, { x: 5, y: 9 }];
    expect(polygonToBbox(poly)).toEqual({ x1: 2, y1: 1, x2: 8, y2: 9 });
  });
});

describe('polygonArea', () => {
  it('área de quadrado 10×10 = 100', () => {
    const sq: FacialPoint[] = [
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
    ];
    expect(polygonArea(sq)).toBeCloseTo(100, 1);
  });

  it('área de triângulo base=6, altura=4 = 12', () => {
    const tri: FacialPoint[] = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 4 }];
    expect(polygonArea(tri)).toBeCloseTo(12, 1);
  });
});

// ─── Extração de ROIs ────────────────────────────────────────────────────────

describe('extractForeheadROI', () => {
  it('retorna ROI com nome forehead', () => {
    const roi = extractForeheadROI(LM, 640, 480);
    expect(roi.name).toBe('forehead');
  });

  it('polígono tem pontos positivos', () => {
    const roi = extractForeheadROI(LM, 640, 480);
    expect(roi.polygon.length).toBeGreaterThan(0);
    for (const p of roi.polygon) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('bbox é consistente com o polígono', () => {
    const roi = extractForeheadROI(LM, 640, 480);
    const { x1, y1, x2, y2 } = roi.bbox;
    for (const p of roi.polygon) {
      expect(p.x).toBeGreaterThanOrEqual(x1 - 0.01);
      expect(p.x).toBeLessThanOrEqual(x2 + 0.01);
      expect(p.y).toBeGreaterThanOrEqual(y1 - 0.01);
      expect(p.y).toBeLessThanOrEqual(y2 + 0.01);
    }
  });
});

describe('extractNoseROI', () => {
  it('tem holes (narinas)', () => {
    const roi = extractNoseROI(LM, 640, 480);
    expect(roi.holes).toBeDefined();
    expect(roi.holes!.length).toBe(2);
  });
});

describe('outros extractores', () => {
  it('extractLeftCheekROI retorna ROI nomeada leftCheek', () => {
    expect(extractLeftCheekROI(LM, 640, 480).name).toBe('leftCheek');
  });

  it('extractRightCheekROI retorna ROI nomeada rightCheek', () => {
    expect(extractRightCheekROI(LM, 640, 480).name).toBe('rightCheek');
  });

  it('extractChinROI retorna ROI nomeada chin', () => {
    expect(extractChinROI(LM, 640, 480).name).toBe('chin');
  });

  it('extractSupralabialROI retorna ROI nomeada supralabial', () => {
    expect(extractSupralabialROI(LM, 640, 480).name).toBe('supralabial');
  });
});

// ─── interpupillaryDistancePx ────────────────────────────────────────────────

describe('interpupillaryDistancePx', () => {
  it('retorna valor positivo com landmarks sintéticos', () => {
    const ipd = interpupillaryDistancePx(LM);
    expect(ipd).toBeGreaterThan(0);
  });

  it('usa cantos de olho (índices 33/263) quando iris não disponível', () => {
    const shortLm = makeLandmarks(468);  // sem iris
    const ipd = interpupillaryDistancePx(shortLm);
    expect(ipd).toBeGreaterThanOrEqual(0);
  });
});

// ─── estimateFaceAreaCm2 ─────────────────────────────────────────────────────

describe('estimateFaceAreaCm2', () => {
  it('retorna valor plausível (> 0) com IPD positivo', () => {
    const ipd = interpupillaryDistancePx(LM);
    const area = estimateFaceAreaCm2(LM, ipd);
    expect(area).toBeGreaterThan(0);
  });

  it('retorna 0 quando IPD é 0', () => {
    expect(estimateFaceAreaCm2(LM, 0)).toBe(0);
  });
});

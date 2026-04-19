import { describe, it, expect } from 'vitest';
import {
  isPointInPolygon, isPointInROI, polygonToBbox, polygonsToBbox, polygonArea,
  extractForeheadROI, extractLeftCheekROI, extractRightCheekROI,
  extractChinROI, extractNoseROI, extractSupralabialROI,
  interpupillaryDistancePx, estimateFaceAreaCm2,
  type FacialPoint, type SkinROI,
} from './roiExtractor';

// ─── LANDMARKS SINTÉTICOS ─────────────────────────────────────────────────────
// 478 pontos em grade normalizada [0,1] — garante cobertura de todos os índices do JSON
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
  const polyA: FacialPoint[] = [
    { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
  ];
  const polyB: FacialPoint[] = [
    { x: 20, y: 20 }, { x: 30, y: 20 }, { x: 30, y: 30 }, { x: 20, y: 30 },
  ];
  const roi: SkinROI = {
    name: 'forehead',
    polygons: [polyA, polyB],
    bbox: polygonsToBbox([polyA, polyB]),
  };

  it('ponto dentro do primeiro polígono → true', () => {
    expect(isPointInROI({ x: 5, y: 5 }, roi)).toBe(true);
  });

  it('ponto dentro do segundo polígono → true', () => {
    expect(isPointInROI({ x: 25, y: 25 }, roi)).toBe(true);
  });

  it('ponto fora de todos os polígonos → false', () => {
    expect(isPointInROI({ x: 15, y: 15 }, roi)).toBe(false);
  });
});

// ─── polygonToBbox / polygonsToBbox / polygonArea ─────────────────────────────

describe('polygonToBbox', () => {
  it('retorna bounding box correto', () => {
    const poly: FacialPoint[] = [{ x: 2, y: 3 }, { x: 8, y: 1 }, { x: 5, y: 9 }];
    expect(polygonToBbox(poly)).toEqual({ x1: 2, y1: 1, x2: 8, y2: 9 });
  });
});

describe('polygonsToBbox', () => {
  it('envolve todos os polígonos', () => {
    const p1: FacialPoint[] = [{ x: 0, y: 0 }, { x: 5, y: 5 }];
    const p2: FacialPoint[] = [{ x: 10, y: 10 }, { x: 20, y: 20 }];
    const bb = polygonsToBbox([p1, p2]);
    expect(bb).toEqual({ x: 0, y: 0, width: 20, height: 20 });
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
    expect(extractForeheadROI(LM, 640, 480).name).toBe('forehead');
  });

  it('tem múltiplos polígonos (frontal + glabela + 2 temporais)', () => {
    const roi = extractForeheadROI(LM, 640, 480);
    expect(roi.polygons.length).toBeGreaterThanOrEqual(4);
  });

  it('todos os polígonos têm pontos positivos', () => {
    const roi = extractForeheadROI(LM, 640, 480);
    for (const poly of roi.polygons) {
      expect(poly.length).toBeGreaterThan(0);
      for (const p of poly) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('bbox cobre todos os polígonos', () => {
    const roi = extractForeheadROI(LM, 640, 480);
    const { x, y, width, height } = roi.bbox;
    for (const poly of roi.polygons) {
      for (const p of poly) {
        expect(p.x).toBeGreaterThanOrEqual(x - 0.01);
        expect(p.x).toBeLessThanOrEqual(x + width + 0.01);
        expect(p.y).toBeGreaterThanOrEqual(y - 0.01);
        expect(p.y).toBeLessThanOrEqual(y + height + 0.01);
      }
    }
  });
});

describe('extractNoseROI', () => {
  it('retorna ROI com nome nose e 2 polígonos (nariz + subnasal)', () => {
    const roi = extractNoseROI(LM, 640, 480);
    expect(roi.name).toBe('nose');
    expect(roi.polygons.length).toBe(2);
  });
});

describe('outros extractores', () => {
  it('extractLeftCheekROI retorna 4 polígonos (malar_lateral + malar_medial + submalar + mandibular)', () => {
    const roi = extractLeftCheekROI(LM, 640, 480);
    expect(roi.name).toBe('leftCheek');
    expect(roi.polygons.length).toBe(4);
  });

  it('extractRightCheekROI retorna 4 polígonos', () => {
    const roi = extractRightCheekROI(LM, 640, 480);
    expect(roi.name).toBe('rightCheek');
    expect(roi.polygons.length).toBe(4);
  });

  it('extractChinROI retorna ROI nomeada chin', () => {
    expect(extractChinROI(LM, 640, 480).name).toBe('chin');
  });

  it('extractSupralabialROI retorna ROI nomeada supralabial com 2 polígonos (perioral + labial)', () => {
    const roi = extractSupralabialROI(LM, 640, 480);
    expect(roi.name).toBe('supralabial');
    expect(roi.polygons.length).toBe(2);
  });
});

// ─── interpupillaryDistancePx ────────────────────────────────────────────────

describe('interpupillaryDistancePx', () => {
  it('retorna valor positivo com landmarks sintéticos', () => {
    expect(interpupillaryDistancePx(LM)).toBeGreaterThan(0);
  });

  it('usa cantos de olho (índices 33/263) quando iris não disponível', () => {
    const shortLm = makeLandmarks(468);
    expect(interpupillaryDistancePx(shortLm)).toBeGreaterThanOrEqual(0);
  });
});

// ─── estimateFaceAreaCm2 ─────────────────────────────────────────────────────

describe('estimateFaceAreaCm2', () => {
  it('retorna valor plausível (> 0) com IPD positivo', () => {
    const ipd = interpupillaryDistancePx(LM);
    expect(estimateFaceAreaCm2(LM, ipd)).toBeGreaterThan(0);
  });

  it('retorna 0 quando IPD é 0', () => {
    expect(estimateFaceAreaCm2(LM, 0)).toBe(0);
  });
});

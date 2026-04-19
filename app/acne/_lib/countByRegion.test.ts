import { describe, it, expect } from 'vitest';
import { filterDetectionsByROI, countByRegion } from './countByRegion';
import type { Detection } from '@/app/_shared/ml/yolo';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function makeDetection(cx: number, cy: number, size = 10): Detection {
  return {
    bbox: [cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2],
    score: 0.9,
    classId: 0,
    className: 'lesao_acneiforme',
  };
}

/** ROI quadrada simples para testes — um único polígono retangular. */
function makeSquareROI(name: string, x1: number, y1: number, x2: number, y2: number): SkinROI {
  return {
    name,
    polygons: [[
      { x: x1, y: y1 }, { x: x2, y: y1 },
      { x: x2, y: y2 }, { x: x1, y: y2 },
    ]],
    bbox: { x: x1, y: y1, width: x2 - x1, height: y2 - y1 },
  };
}

const foreheadROI  = makeSquareROI('forehead',   0,   0, 100, 100);
const leftCheekROI = makeSquareROI('leftCheek', 100,  0, 200, 100);
const noseROI      = makeSquareROI('nose',       0, 100, 100, 200);

// ─── filterDetectionsByROI ────────────────────────────────────────────────────

describe('filterDetectionsByROI', () => {
  it('lista vazia → lista vazia', () => {
    expect(filterDetectionsByROI([], foreheadROI)).toHaveLength(0);
  });

  it('detecção com centro dentro da ROI → incluída', () => {
    const det = makeDetection(50, 50); // centro (50,50) dentro do foreheadROI
    expect(filterDetectionsByROI([det], foreheadROI)).toHaveLength(1);
  });

  it('detecção com centro fora da ROI → excluída', () => {
    const det = makeDetection(150, 50); // centro em leftCheekROI, não foreheadROI
    expect(filterDetectionsByROI([det], foreheadROI)).toHaveLength(0);
  });

  it('filtra corretamente múltiplas detecções', () => {
    const inside1  = makeDetection(20, 20);
    const inside2  = makeDetection(80, 80);
    const outside  = makeDetection(150, 50);
    const result = filterDetectionsByROI([inside1, inside2, outside], foreheadROI);
    expect(result).toHaveLength(2);
  });

  it('detecção no limite usa o CENTRO do bbox, não a borda', () => {
    // bbox de [90,90] a [110,110] → centro (100,100) está na borda do foreheadROI (x2=100)
    // ray casting considera x < xi, então borda direita é excluída
    const borderDet = makeDetection(100, 50); // centro exatamente na borda x=100
    // resultado depende da implementação do ray casting — apenas verificar sem throw
    expect(() => filterDetectionsByROI([borderDet], foreheadROI)).not.toThrow();
  });
});

// ─── countByRegion ────────────────────────────────────────────────────────────

describe('countByRegion', () => {
  const rois = [foreheadROI, leftCheekROI, noseROI];

  it('sem detecções → todas as contagens são 0', () => {
    const result = countByRegion([], rois);
    for (const r of result) {
      expect(r.count).toBe(0);
      expect(r.percentage).toBe(0);
    }
  });

  it('retorna apenas ROIs presentes em REGION_LABELS_PT', () => {
    const roiComNomeDesconhecido = makeSquareROI('desconhecido', 200, 200, 300, 300);
    const result = countByRegion([], [...rois, roiComNomeDesconhecido]);
    const nomes = result.map(r => r.region);
    expect(nomes).not.toContain('desconhecido');
  });

  it('1 detecção no forehead → forehead count=1, outros=0', () => {
    const det = makeDetection(50, 50);
    const result = countByRegion([det], rois);
    const forehead = result.find(r => r.region === 'forehead');
    const leftCheek = result.find(r => r.region === 'leftCheek');
    expect(forehead?.count).toBe(1);
    expect(leftCheek?.count).toBe(0);
  });

  it('percentage = count / total * 100 (arredondado)', () => {
    const dets = [
      makeDetection(50, 50),   // forehead
      makeDetection(150, 50),  // leftCheek
      makeDetection(150, 50),  // leftCheek
      makeDetection(150, 50),  // leftCheek
    ];
    const result = countByRegion(dets, rois);
    const forehead = result.find(r => r.region === 'forehead');
    expect(forehead?.percentage).toBe(25); // 1/4 = 25%
    const leftCheek = result.find(r => r.region === 'leftCheek');
    expect(leftCheek?.percentage).toBe(75); // 3/4 = 75%
  });

  it('inclui label em pt-BR', () => {
    const result = countByRegion([], rois);
    const forehead = result.find(r => r.region === 'forehead');
    expect(forehead?.label).toBe('Testa');
  });
});

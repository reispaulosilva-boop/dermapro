import { describe, it, expect } from 'vitest';
import {
  computeLaplacianVariance, computeAvgBrightness, computeSideBias, runQualityChecks,
  QA_BLUR_ERROR, QA_BLUR_WARN,
} from './imageQuality';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function makeImageData(
  pixels: Array<[number, number, number]>,  // [r, g, b] por pixel
  width: number,
  height: number,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  pixels.forEach(([r, g, b], i) => {
    data[i * 4]     = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  });
  return { data, width, height } as ImageData;
}

function makeUniformImageData(r: number, g: number, b: number, w: number, h: number): ImageData {
  return makeImageData(Array(w * h).fill([r, g, b]), w, h);
}

function makeGray(values: number[], width: number, height: number): Uint8ClampedArray {
  return new Uint8ClampedArray(values);
}

function makeCanvas(r: number, g: number, b: number, w: number, h: number): HTMLCanvasElement {
  const imageData = makeUniformImageData(r, g, b, w, h);
  return {
    width: w, height: h,
    getContext: () => ({ getImageData: () => imageData }),
  } as unknown as HTMLCanvasElement;
}

// ─── computeLaplacianVariance ─────────────────────────────────────────────────

describe('computeLaplacianVariance', () => {
  it('imagem uniforme → variância ≈ 0 (sem bordas, sem ruído)', () => {
    const gray = new Uint8ClampedArray(100).fill(128);
    expect(computeLaplacianVariance(gray, 10, 10)).toBeCloseTo(0, 1);
  });

  it('imagem com xadrez (alto contraste) → variância alta', () => {
    const w = 10, h = 10;
    const gray = Uint8ClampedArray.from({ length: w * h }, (_, i) => {
      const x = i % w, y = Math.floor(i / w);
      return (x + y) % 2 === 0 ? 0 : 255;
    });
    expect(computeLaplacianVariance(gray, w, h)).toBeGreaterThan(1000);
  });

  it('imagem muito pequena (<3x3) → retorna 0 sem erro', () => {
    const gray = new Uint8ClampedArray([100, 100, 100, 100]);
    expect(computeLaplacianVariance(gray, 2, 2)).toBe(0);
  });
});

// ─── computeAvgBrightness ─────────────────────────────────────────────────────

describe('computeAvgBrightness', () => {
  it('imagem branca (255,255,255) → brilho = 255', () => {
    const id = makeUniformImageData(255, 255, 255, 4, 4);
    expect(computeAvgBrightness(id)).toBeCloseTo(255, 0);
  });

  it('imagem preta (0,0,0) → brilho = 0', () => {
    const id = makeUniformImageData(0, 0, 0, 4, 4);
    expect(computeAvgBrightness(id)).toBeCloseTo(0, 0);
  });

  it('imagem cinza médio → brilho ≈ 128', () => {
    const id = makeUniformImageData(128, 128, 128, 4, 4);
    expect(computeAvgBrightness(id)).toBeCloseTo(128, 0);
  });
});

// ─── computeSideBias ─────────────────────────────────────────────────────────

describe('computeSideBias', () => {
  it('iluminação simétrica → bias ≈ 0', () => {
    const id = makeUniformImageData(200, 200, 200, 10, 10);
    expect(computeSideBias(id)).toBeCloseTo(0, 0);
  });

  it('iluminação assimétrica (esq claro, dir escuro) → bias alto', () => {
    const w = 10, h = 4;
    const pixels: Array<[number, number, number]> = Array.from({ length: w * h }, (_, i) => {
      const x = i % w;
      return x < 5 ? [240, 240, 240] : [20, 20, 20];
    });
    const id = makeImageData(pixels, w, h);
    expect(computeSideBias(id)).toBeGreaterThan(100);
  });
});

// ─── runQualityChecks ─────────────────────────────────────────────────────────

describe('runQualityChecks', () => {
  it('imagem muito pequena → error', () => {
    const canvas = makeCanvas(200, 200, 200, 50, 50);
    const result = runQualityChecks(canvas, { minWidth: 200, minHeight: 200 });
    expect(result.passed).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('imagem muito escura → warning', () => {
    const canvas = makeCanvas(10, 10, 10, 100, 100);
    const result = runQualityChecks(canvas, { minWidth: 10, minHeight: 10, minBrightness: 50 });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('imagem sobreexposta → warning', () => {
    const canvas = makeCanvas(255, 255, 255, 100, 100);
    const result = runQualityChecks(canvas, { minWidth: 10, minHeight: 10, maxBrightness: 200 });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('imagem uniforme com blurError=100 → error bloqueante', () => {
    const canvas = makeCanvas(128, 128, 128, 50, 50);
    const result = runQualityChecks(canvas, { minWidth: 10, minHeight: 10, blurErrorThreshold: 100 });
    expect(result.passed).toBe(false);
    expect(result.errors.some(e => e.includes('inutilizável'))).toBe(true);
  });

  // ─── DOIS TIERS DE BLUR ─────────────────────────────────────────────────────

  it('blur 50 (entre QA_BLUR_ERROR=40 e QA_BLUR_WARN=80) → warning, não error', () => {
    // Imagem uniforme tem blurScore ≈ 0 — usamos thresholds fictícios para simular
    // a lógica dos dois tiers sem depender da escala absoluta do Laplaciano.
    const canvas = makeCanvas(128, 128, 128, 50, 50);
    // blurScore da imagem uniforme ≈ 0; definimos errorThreshold=0 e warnThreshold=1
    // para verificar que score < warnThreshold gera warning, não error
    const result = runQualityChecks(canvas, {
      minWidth: 10, minHeight: 10,
      blurErrorThreshold: 0,   // ≤ blurScore: sem error
      blurWarnThreshold: 1,    // > blurScore: gera warning
    });
    expect(result.passed).toBe(true);
    expect(result.errors.filter(e => e.includes('inutilizável'))).toHaveLength(0);
    expect(result.warnings.some(w => w.includes('foco reduzido'))).toBe(true);
  });

  it('blur abaixo de blurErrorThreshold → error bloqueante (foto inutilizável)', () => {
    const canvas = makeCanvas(128, 128, 128, 50, 50);
    // blurScore ≈ 0; errorThreshold=1 → blurScore < errorThreshold → error
    const result = runQualityChecks(canvas, {
      minWidth: 10, minHeight: 10,
      blurErrorThreshold: 1,
      blurWarnThreshold: 100,
    });
    expect(result.passed).toBe(false);
    expect(result.errors.some(e => e.includes('inutilizável'))).toBe(true);
    expect(result.warnings.filter(w => w.includes('foco'))).toHaveLength(0);
  });

  it('blur acima de blurWarnThreshold → sem avisos de foco', () => {
    // Imagem xadrez tem blurScore alto; errorThreshold e warnThreshold baixos
    const w = 20, h = 20;
    const canvas = {
      width: w, height: h,
      getContext: () => ({
        getImageData: () => {
          const data = new Uint8ClampedArray(w * h * 4);
          for (let i = 0; i < w * h; i++) {
            const x = i % w, y = Math.floor(i / w);
            const v = (x + y) % 2 === 0 ? 0 : 255;
            data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
            data[i * 4 + 3] = 255;
          }
          return { data, width: w, height: h } as ImageData;
        },
      }),
    } as unknown as HTMLCanvasElement;
    const result = runQualityChecks(canvas, {
      minWidth: 10, minHeight: 10,
      blurErrorThreshold: QA_BLUR_ERROR,
      blurWarnThreshold:  QA_BLUR_WARN,
    });
    expect(result.warnings.filter(w => w.includes('foco'))).toHaveLength(0);
    expect(result.errors.filter(e => e.includes('inutilizável'))).toHaveLength(0);
  });

  it('constantes exportadas: QA_BLUR_ERROR < QA_BLUR_WARN', () => {
    expect(QA_BLUR_ERROR).toBeLessThan(QA_BLUR_WARN);
  });

  it('imagem boa (grande, bem iluminada) → passed=true, warnings vazios', () => {
    const canvas = makeCanvas(180, 160, 140, 300, 300);
    const result = runQualityChecks(canvas, {
      minWidth: 200, minHeight: 200,
      minBrightness: 50, maxBrightness: 240,
      maxSideBias: 50,
    });
    expect(result.passed).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('métricas são incluídas no resultado', () => {
    const canvas = makeCanvas(100, 100, 100, 60, 60);
    const result = runQualityChecks(canvas, { minWidth: 10, minHeight: 10 });
    expect(result.metrics).toMatchObject({
      width: 60, height: 60,
      aspectRatio: 1,
      blurScore: expect.any(Number),
      avgBrightness: expect.any(Number),
      sideBias: expect.any(Number),
    });
  });
});

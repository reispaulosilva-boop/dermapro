import { describe, it, expect } from 'vitest';
import { clahe } from './clahe';

describe('clahe — propriedades básicas', () => {
  it('dimensões preservadas (mesmo length de saída)', () => {
    const w = 32, h = 32;
    const img = new Uint8Array(w * h).fill(128);
    const result = clahe(img, w, h);
    expect(result).toHaveLength(w * h);
  });

  it('imagem uniforme (todos pixels = 128) permanece uniforme', () => {
    const w = 16, h = 16;
    const img = new Uint8Array(w * h).fill(128);
    const result = clahe(img, w, h);
    // Todos pixels devem ter o mesmo valor (pode ser 0 ou 255, mas uniforme)
    const uniqueValues = new Set(result);
    expect(uniqueValues.size).toBe(1);
  });

  it('todos os pixels permanecem no intervalo [0, 255]', () => {
    const w = 32, h = 32;
    const img = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) img[i] = Math.floor(Math.random() * 256);
    const result = clahe(img, w, h);
    for (const v of result) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
  });

  it('imagem com baixo contraste (100-140) ganha contraste após CLAHE', () => {
    const w = 32, h = 32;
    const img = new Uint8Array(w * h);
    // Preenche com gradiente suave de 100 a 140
    for (let i = 0; i < w * h; i++) {
      img[i] = 100 + Math.round((i / (w * h - 1)) * 40);
    }
    const inputVariance  = variance(Array.from(img));
    const result         = clahe(img, w, h, 2.0, 8);
    const outputVariance = variance(Array.from(result));
    // CLAHE deve aumentar a variância (espalha histograma)
    expect(outputVariance).toBeGreaterThan(inputVariance);
  });

  it('aceita Uint8ClampedArray como entrada', () => {
    const img = new Uint8ClampedArray(64).fill(100);
    expect(() => clahe(img, 8, 8)).not.toThrow();
  });

  it('funciona com diferentes tamanhos de tile', () => {
    const w = 40, h = 40;
    const img = new Uint8Array(w * h).fill(100);
    expect(() => clahe(img, w, h, 2.0, 10)).not.toThrow();
    expect(() => clahe(img, w, h, 2.0, 4)).not.toThrow();
  });
});

// ─── helpers ─────────────────────────────────────────────────────────────────

function variance(arr: number[]): number {
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
}

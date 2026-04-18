import { describe, it, expect } from 'vitest';
import {
  createGaussianKernel1D, convolve1DHorizontal, convolve1DVertical, gaussianBlur,
} from './gaussianBlur';

describe('createGaussianKernel1D', () => {
  it('sigma=1 → soma ≈ 1', () => {
    const k = createGaussianKernel1D(1);
    const sum = Array.from(k).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('sigma=2 → soma ≈ 1', () => {
    const k = createGaussianKernel1D(2);
    const sum = Array.from(k).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('kernel é simétrico', () => {
    const k = createGaussianKernel1D(1.5);
    for (let i = 0; i < Math.floor(k.length / 2); i++) {
      expect(k[i]).toBeCloseTo(k[k.length - 1 - i]!, 8);
    }
  });

  it('valor central é o máximo', () => {
    const k = createGaussianKernel1D(1);
    const center = k[Math.floor(k.length / 2)]!;
    expect(Math.max(...k)).toBeCloseTo(center, 8);
  });
});

describe('gaussianBlur — propriedades', () => {
  it('imagem uniforme permanece uniforme após blur', () => {
    const w = 16, h = 16;
    const img = new Uint8Array(w * h).fill(128);
    const result = gaussianBlur(img, w, h, 1);
    for (const v of result) {
      expect(v).toBeCloseTo(128, 1);
    }
  });

  it('dimensões preservadas', () => {
    const w = 20, h = 15;
    const img = new Uint8Array(w * h).fill(100);
    expect(gaussianBlur(img, w, h, 1)).toHaveLength(w * h);
  });

  it('imagem com impulso unitário produz resposta aprox. gaussiana', () => {
    const w = 21, h = 21;
    const img = new Float32Array(w * h);
    img[10 * w + 10] = 1000; // impulso no centro
    const result = gaussianBlur(img, w, h, 1.5);
    // Vizinhos próximos ao centro devem ter valor positivo (resposta gaussiana)
    expect(result[10 * w + 10]!).toBeGreaterThan(0);
    expect(result[9  * w + 10]!).toBeGreaterThan(0);
    expect(result[10 * w + 11]!).toBeGreaterThan(0);
    // Cantos devem ser muito menores que o centro
    expect(result[0]!).toBeLessThan(result[10 * w + 10]!);
  });

  it('sigma=0.5 preserva mais detalhe que sigma=3', () => {
    const w = 20, h = 20;
    const img = new Float32Array(w * h);
    img[10 * w + 10] = 1000;
    const sharp = gaussianBlur(img, w, h, 0.5);
    const blurry = gaussianBlur(img, w, h, 3);
    // Centro mais alto com sigma menor
    expect(sharp[10 * w + 10]!).toBeGreaterThan(blurry[10 * w + 10]!);
  });

  it('aceita Uint8ClampedArray como entrada', () => {
    const img = new Uint8ClampedArray(100).fill(50);
    expect(() => gaussianBlur(img, 10, 10, 1)).not.toThrow();
  });
});

describe('convolve1DHorizontal / convolve1DVertical', () => {
  it('kernel delta [0,1,0] preserva imagem (horizontal)', () => {
    const w = 5, h = 5;
    const img = Float32Array.from({ length: 25 }, (_, i) => i);
    const kernel = new Float32Array([0, 1, 0]);
    const result = convolve1DHorizontal(img, w, h, kernel);
    for (let i = 0; i < 25; i++) expect(result[i]).toBeCloseTo(img[i]!, 4);
  });

  it('kernel delta [0,1,0] preserva imagem (vertical)', () => {
    const w = 5, h = 5;
    const img = Float32Array.from({ length: 25 }, (_, i) => i);
    const kernel = new Float32Array([0, 1, 0]);
    const result = convolve1DVertical(img, w, h, kernel);
    for (let i = 0; i < 25; i++) expect(result[i]).toBeCloseTo(img[i]!, 4);
  });
});

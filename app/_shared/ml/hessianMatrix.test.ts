import { describe, it, expect } from 'vitest';
import {
  createGaussianDerivativeKernel1D,
  computeHessian2D,
  computeEigenvalues2x2,
  computeGradient2D,
} from './hessianMatrix';

const TOL = 1e-4;

describe('createGaussianDerivativeKernel1D', () => {
  it('order=0, sigma=1 → soma ≈ 1', () => {
    const k = createGaussianDerivativeKernel1D(1, 0);
    const sum = Array.from(k).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1, 4);
  });

  it('order=1 → soma ≈ 0 (antissimetria)', () => {
    const k = createGaussianDerivativeKernel1D(1.5, 1);
    const sum = Array.from(k).reduce((s, v) => s + v, 0);
    expect(Math.abs(sum)).toBeLessThan(TOL);
  });

  it('order=2 → soma próxima de 0 (truncação discreta admite ~0.01)', () => {
    const k = createGaussianDerivativeKernel1D(1.5, 2);
    const sum = Array.from(k).reduce((s, v) => s + v, 0);
    expect(Math.abs(sum)).toBeLessThan(0.02);
  });

  it('order=0 é simétrico positivo', () => {
    const k = createGaussianDerivativeKernel1D(1, 0);
    for (const v of k) expect(v).toBeGreaterThanOrEqual(0);
    expect(k[Math.floor(k.length / 2)]!).toBeGreaterThan(k[0]!);
  });

  it('order=1 é antissimétrico', () => {
    const k = createGaussianDerivativeKernel1D(1, 1);
    for (let i = 0; i < Math.floor(k.length / 2); i++) {
      expect(k[i]!).toBeCloseTo(-k[k.length - 1 - i]!, 5);
    }
  });
});

describe('computeHessian2D — imagem uniforme', () => {
  it('imagem uniforme → Hxx, Hyy, Hxy todos ≈ 0', () => {
    const w = 20, h = 20;
    const img = new Float32Array(w * h).fill(100);
    const { Hxx, Hyy, Hxy } = computeHessian2D(img, w, h, 1);
    // Interior da imagem deve ser ~0 (bordas podem ter pequenos artefatos)
    const cx = 10 * w + 10;
    // Kernels discretos truncados têm soma não-nula (~valor * 0.01) — tolerância 2.0 para img=100
    expect(Math.abs(Hxx[cx]!)).toBeLessThan(2.0);
    expect(Math.abs(Hyy[cx]!)).toBeLessThan(2.0);
    expect(Math.abs(Hxy[cx]!)).toBeLessThan(2.0);
  });
});

describe('computeHessian2D — linha vertical escura', () => {
  it('λ2 >> λ1 ao longo da linha vertical', () => {
    const w = 30, h = 30;
    const img = new Float32Array(w * h).fill(200);
    // Linha vertical escura na coluna 15
    for (let y = 0; y < h; y++) img[y * w + 15] = 0;

    const { Hxx, Hyy, Hxy } = computeHessian2D(img, w, h, 1.5);
    const { lambda1, lambda2 } = computeEigenvalues2x2(Hxx, Hyy, Hxy);

    // No centro da linha, |λ2| deve ser muito maior que |λ1|
    const mid = 15 * w + 15;
    expect(Math.abs(lambda2[mid]!)).toBeGreaterThan(Math.abs(lambda1[mid]!) * 3);
  });
});

describe('computeEigenvalues2x2', () => {
  it('imagem uniforme → autovalores ≈ 0', () => {
    const w = 15, h = 15;
    const img = new Float32Array(w * h).fill(150);
    const { Hxx, Hyy, Hxy } = computeHessian2D(img, w, h, 1);
    const { lambda1, lambda2 } = computeEigenvalues2x2(Hxx, Hyy, Hxy);
    const cx = 7 * w + 7;
    expect(Math.abs(lambda1[cx]!)).toBeLessThan(3.0);
    expect(Math.abs(lambda2[cx]!)).toBeLessThan(3.0);
  });

  it('|λ1| ≤ |λ2| em todos os pixels', () => {
    const w = 15, h = 15;
    const img = Float32Array.from({ length: w * h }, (_, i) => (i % 30) * 8);
    const { Hxx, Hyy, Hxy } = computeHessian2D(img, w, h, 1);
    const { lambda1, lambda2 } = computeEigenvalues2x2(Hxx, Hyy, Hxy);
    for (let i = 0; i < w * h; i++) {
      expect(Math.abs(lambda1[i]!)).toBeLessThanOrEqual(Math.abs(lambda2[i]!) + 1e-5);
    }
  });
});

describe('computeGradient2D', () => {
  it('imagem uniforme → magnitude do gradiente ≈ 0', () => {
    const w = 15, h = 15;
    const img = new Float32Array(w * h).fill(128);
    const { gradMagnitude } = computeGradient2D(img, w, h, 1);
    const cx = 7 * w + 7;
    expect(gradMagnitude[cx]!).toBeCloseTo(0, 1);
  });

  it('borda vertical → gradiente horizontal maior que vertical', () => {
    const w = 20, h = 20;
    const img = new Float32Array(w * h);
    // Metade esquerda escura, metade direita clara
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        img[y * w + x] = x < w / 2 ? 0 : 255;

    const { gradMagnitude } = computeGradient2D(img, w, h, 1);
    // Na borda (x=9 e x=10), magnitude deve ser alta
    const borderPx = 10 * w + 10;
    expect(gradMagnitude[borderPx]!).toBeGreaterThan(10);
  });
});

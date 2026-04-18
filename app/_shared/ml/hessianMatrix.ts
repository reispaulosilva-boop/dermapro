/**
 * DermaPro — Matriz Hessiana 2D + Autovalores + Gradiente
 *
 * Kernels derivadas gaussianas de ordem 0, 1 e 2.
 * Hessiana separável: Hxx = G''σ(x) ⊗ Gσ(y), Hyy = Gσ(x) ⊗ G''σ(y), Hxy = G'σ(x) ⊗ G'σ(y).
 * Gradiente: Gx = G'σ(x) ⊗ Gσ(y), Gy = Gσ(x) ⊗ G'σ(y).
 */

import { convolve1DHorizontal, convolve1DVertical } from './gaussianBlur';

// ─── KERNELS DE DERIVADAS GAUSSIANAS ─────────────────────────────────────────

/**
 * Gera kernel de derivada gaussiana 1D.
 *
 * - order=0: G(x) = exp(-x²/2σ²) normalizado (soma=1)
 * - order=1: G'(x) = -(x/σ²)·G(x) (antissimétrico, soma≈0)
 * - order=2: G''(x) = (x²/σ⁴ - 1/σ²)·G(x) (soma≈0)
 */
export function createGaussianDerivativeKernel1D(
  sigma: number,
  order: 0 | 1 | 2,
): Float32Array {
  const halfSize = Math.ceil(3 * sigma);
  const size = 2 * halfSize + 1;
  const kernel = new Float32Array(size);
  const sigma2 = sigma * sigma;
  const sigma4 = sigma2 * sigma2;
  const twoSigma2 = 2 * sigma2;

  for (let i = 0; i < size; i++) {
    const x = i - halfSize;
    const g = Math.exp(-(x * x) / twoSigma2);
    if      (order === 0) kernel[i] = g;
    else if (order === 1) kernel[i] = -(x / sigma2) * g;
    else                  kernel[i] = (x * x / sigma4 - 1 / sigma2) * g;
  }

  // Ordem 0: normaliza para soma = 1
  if (order === 0) {
    const sum = Array.from(kernel).reduce((s, v) => s + v, 0);
    for (let i = 0; i < size; i++) kernel[i] = kernel[i]! / sum;
  }

  return kernel;
}

// ─── MATRIZ HESSIANA 2D ───────────────────────────────────────────────────────

export type Hessian2D = {
  Hxx: Float32Array;
  Hyy: Float32Array;
  Hxy: Float32Array;
};

/**
 * Computa a Hessiana separável.
 * Hxx = G''σ(x) ⊗ Gσ(y) — 2ª derivada em x suavizada em y
 * Hyy = Gσ(x) ⊗ G''σ(y) — suavizada em x, 2ª derivada em y
 * Hxy = G'σ(x) ⊗ G'σ(y) — 1ª derivada em ambas as direções
 */
export function computeHessian2D(
  img: Float32Array,
  width: number,
  height: number,
  sigma: number,
): Hessian2D {
  const g0  = createGaussianDerivativeKernel1D(sigma, 0);
  const g1  = createGaussianDerivativeKernel1D(sigma, 1);
  const g2  = createGaussianDerivativeKernel1D(sigma, 2);

  // Hxx: aplicar g2 horizontalmente, depois g0 verticalmente
  const Hxx = convolve1DVertical(convolve1DHorizontal(img, width, height, g2), width, height, g0);
  // Hyy: g0 horizontal, g2 vertical
  const Hyy = convolve1DVertical(convolve1DHorizontal(img, width, height, g0), width, height, g2);
  // Hxy: g1 horizontal, g1 vertical
  const Hxy = convolve1DVertical(convolve1DHorizontal(img, width, height, g1), width, height, g1);

  return { Hxx, Hyy, Hxy };
}

// ─── AUTOVALORES ─────────────────────────────────────────────────────────────

export type Eigenvalues2D = {
  lambda1: Float32Array;  // |λ1| ≤ |λ2|
  lambda2: Float32Array;  // |λ2| ≥ |λ1|
};

/**
 * Autovalores da Hessiana 2×2 simétrica para cada pixel.
 * λ = (Hxx+Hyy)/2 ± √(((Hxx-Hyy)/2)² + Hxy²)
 * Ordenados por valor absoluto: |λ1| ≤ |λ2|.
 */
export function computeEigenvalues2x2(
  Hxx: Float32Array,
  Hyy: Float32Array,
  Hxy: Float32Array,
): Eigenvalues2D {
  const n = Hxx.length;
  const lambda1 = new Float32Array(n);
  const lambda2 = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const trace = (Hxx[i]! + Hyy[i]!) / 2;
    const disc  = Math.sqrt(((Hxx[i]! - Hyy[i]!) / 2) ** 2 + Hxy[i]! ** 2);
    const la = trace + disc;
    const lb = trace - disc;
    // Ordenar por |λ|
    if (Math.abs(la) <= Math.abs(lb)) {
      lambda1[i] = la; lambda2[i] = lb;
    } else {
      lambda1[i] = lb; lambda2[i] = la;
    }
  }
  return { lambda1, lambda2 };
}

// ─── GRADIENTE ────────────────────────────────────────────────────────────────

export type Gradient2D = {
  gradMagnitude:   Float32Array;
  gradOrientation: Float32Array;  // radianos, atan2(Gy, Gx)
};

/**
 * Gradiente 2D via derivadas gaussianas de 1ª ordem.
 * Gx = G'σ(x) ⊗ Gσ(y),  Gy = Gσ(x) ⊗ G'σ(y)
 */
export function computeGradient2D(
  img: Float32Array,
  width: number,
  height: number,
  sigma = 1.0,
): Gradient2D {
  const g0 = createGaussianDerivativeKernel1D(sigma, 0);
  const g1 = createGaussianDerivativeKernel1D(sigma, 1);

  const Gx = convolve1DVertical(convolve1DHorizontal(img, width, height, g1), width, height, g0);
  const Gy = convolve1DVertical(convolve1DHorizontal(img, width, height, g0), width, height, g1);

  const n = img.length;
  const gradMagnitude   = new Float32Array(n);
  const gradOrientation = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    gradMagnitude[i]   = Math.hypot(Gx[i]!, Gy[i]!);
    gradOrientation[i] = Math.atan2(Gy[i]!, Gx[i]!);
  }
  return { gradMagnitude, gradOrientation };
}

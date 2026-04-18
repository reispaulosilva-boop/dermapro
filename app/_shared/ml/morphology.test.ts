import { describe, it, expect } from 'vitest';
import {
  erode, dilate, morphOpen, morphClose,
  grayErode, grayDilate, grayOpen, grayClose,
  createBoxKernel, createDiskKernel,
  otsuThreshold,
} from './morphology';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Cria imagem 5×5 com blob 3×3 no centro. */
function makeBlob5x5(): Uint8Array {
  return new Uint8Array([
    0,0,0,0,0,
    0,1,1,1,0,
    0,1,1,1,0,
    0,1,1,1,0,
    0,0,0,0,0,
  ]);
}

/** Cria imagem 5×5 com ponto único no centro. */
function makePoint5x5(): Uint8Array {
  const img = new Uint8Array(25);
  img[2 * 5 + 2] = 1;
  return img;
}

// ─── EROSÃO BINÁRIA ───────────────────────────────────────────────────────────

describe('erode (binário)', () => {
  it('blob 3×3 em imagem 5×5 erode para ponto único no centro', () => {
    const result = erode(makeBlob5x5(), 5, 5, 3);
    // Apenas o pixel central deve sobrar
    let ones = 0;
    for (const v of result) if (v === 1) ones++;
    expect(ones).toBe(1);
    expect(result[2 * 5 + 2]).toBe(1); // posição (2,2)
  });

  it('imagem toda 1 com kernel 3×3 mantém interior', () => {
    const img = new Uint8Array(25).fill(1);
    const result = erode(img, 5, 5, 3);
    expect(result[2 * 5 + 2]).toBe(1); // centro permanece 1
  });

  it('imagem toda 0 permanece 0', () => {
    const result = erode(new Uint8Array(25), 5, 5, 3);
    expect(result.every(v => v === 0)).toBe(true);
  });
});

// ─── DILATAÇÃO BINÁRIA ────────────────────────────────────────────────────────

describe('dilate (binário)', () => {
  it('ponto único 1×1 dilata para blob 3×3', () => {
    const result = dilate(makePoint5x5(), 5, 5, 3);
    let ones = 0;
    for (const v of result) if (v === 1) ones++;
    expect(ones).toBe(9); // 3×3 = 9
  });

  it('imagem toda 0 permanece 0', () => {
    const result = dilate(new Uint8Array(25), 5, 5, 3);
    expect(result.every(v => v === 0)).toBe(true);
  });
});

// ─── OPEN / CLOSE ─────────────────────────────────────────────────────────────

describe('morphOpen / morphClose', () => {
  it('open → close em blob 3×3 é aproximadamente identidade', () => {
    const original = makeBlob5x5();
    const processed = morphClose(morphOpen(original, 5, 5, 3), 5, 5, 3);
    // Pelo menos o centro deve ser preservado
    expect(processed[2 * 5 + 2]).toBe(1);
  });

  it('open remove ponto isolado', () => {
    const img = new Uint8Array(25);
    img[1 * 5 + 1] = 1; // ponto isolado 1×1
    const result = morphOpen(img, 5, 5, 3);
    // Ponto menor que o kernel deve desaparecer
    expect(result.every(v => v === 0)).toBe(true);
  });
});

// ─── GRAYSCALE ────────────────────────────────────────────────────────────────

describe('grayDilate', () => {
  it('pico localizado produz pico maior (área expandida)', () => {
    const img = new Uint8Array(25); // 5×5 zeros
    img[2 * 5 + 2] = 200; // pico no centro
    const kernel = createBoxKernel(3);
    const result = grayDilate(img, 5, 5, kernel);
    // Pixels ao redor do pico devem ter valor 200
    expect(result[1 * 5 + 1]).toBe(200);
    expect(result[1 * 5 + 2]).toBe(200);
    expect(result[2 * 5 + 1]).toBe(200);
  });
});

describe('grayErode', () => {
  it('imagem uniforme permanece uniforme', () => {
    const img = new Uint8Array(25).fill(128);
    const kernel = createBoxKernel(3);
    const result = grayErode(img, 5, 5, kernel);
    expect(result[2 * 5 + 2]).toBe(128);
  });
});

describe('grayOpen / grayClose', () => {
  it('dimensões preservadas', () => {
    const img = new Uint8Array(25).fill(100);
    const kernel = createBoxKernel(3);
    expect(grayOpen(img, 5, 5, kernel)).toHaveLength(25);
    expect(grayClose(img, 5, 5, kernel)).toHaveLength(25);
  });
});

// ─── KERNELS ─────────────────────────────────────────────────────────────────

describe('createBoxKernel', () => {
  it('kernel 3×3 tem todos elementos = 1', () => {
    const k = createBoxKernel(3);
    expect(k.size).toBe(3);
    expect(k.mask.every(v => v === 1)).toBe(true);
  });

  it('tamanho par lança erro', () => {
    expect(() => createBoxKernel(4)).toThrow();
  });
});

describe('createDiskKernel', () => {
  it('radius=1 gera kernel 3×3 com padrão de cruz', () => {
    const k = createDiskKernel(1);
    expect(k.size).toBe(3);
    // Cantos do 3×3 ficam fora do círculo raio=1 (distância √2 > 1)
    expect(k.mask[0]).toBe(0); // canto superior esquerdo
    expect(k.mask[1]).toBe(1); // topo centro
    expect(k.mask[4]).toBe(1); // centro
  });

  it('radius=3 gera kernel 7×7 com pontos dentro do círculo', () => {
    const k = createDiskKernel(3);
    expect(k.size).toBe(7);
    // Centro deve ser ativo
    expect(k.mask[3 * 7 + 3]).toBe(1);
    // Canto (0,0) está a distância 3√2 ≈ 4.24 > 3 → fora
    expect(k.mask[0]).toBe(0);
    // Ponto (3,0) está a distância 3 exatamente → dentro (≤)
    expect(k.mask[0 * 7 + 3]).toBe(1);
  });
});

// ─── OTSU ─────────────────────────────────────────────────────────────────────

describe('otsuThreshold', () => {
  it('imagem bimodal (50 e 200) separa as duas classes', () => {
    // 50 pixels = valor 50, 50 pixels = valor 200
    const img = new Uint8Array(100);
    for (let i = 0; i < 50; i++) img[i] = 50;
    for (let i = 50; i < 100; i++) img[i] = 200;
    const { threshold } = otsuThreshold(img);
    // Threshold deve separar as duas modas (>= valor da classe inferior, < valor da superior)
    expect(threshold).toBeGreaterThanOrEqual(50);
    expect(threshold).toBeLessThan(200);
  });

  it('imagem bimodal binariza corretamente', () => {
    const img = new Uint8Array([50, 50, 50, 200, 200, 200]);
    const { binary } = otsuThreshold(img);
    expect(binary[0]).toBe(0);
    expect(binary[5]).toBe(1);
  });

  it('imagem uniforme não lança erro', () => {
    const img = new Uint8Array(100).fill(128);
    expect(() => otsuThreshold(img)).not.toThrow();
  });
});

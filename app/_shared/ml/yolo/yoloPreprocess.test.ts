import { describe, it, expect } from 'vitest';
import { computeLetterboxParams, imageDataToTensor } from './yoloPreprocess';

// ─── computeLetterboxParams ───────────────────────────────────────────────────

describe('computeLetterboxParams', () => {
  it('imagem quadrada igual ao target → scale=1, pad=0', () => {
    const p = computeLetterboxParams(640, 640, 640);
    expect(p.scale).toBeCloseTo(1);
    expect(p.padX).toBe(0);
    expect(p.padY).toBe(0);
    expect(p.scaledW).toBe(640);
    expect(p.scaledH).toBe(640);
  });

  it('portrait (largura < altura) → limitado pela altura, padX positivo', () => {
    // 480×640 → scale = min(640/480, 640/640) = 1 (limitado pela altura)
    const p = computeLetterboxParams(480, 640, 640);
    expect(p.scale).toBeCloseTo(1);
    expect(p.scaledH).toBe(640);
    expect(p.scaledW).toBe(480);
    expect(p.padX).toBeGreaterThan(0); // padding horizontal para centralizar
    expect(p.padY).toBe(0);
  });

  it('landscape (largura > altura) → limitado pela largura, padY positivo', () => {
    // 640×480 → scale = min(640/640, 640/480) = 1 (limitado pela largura)
    const p = computeLetterboxParams(640, 480, 640);
    expect(p.scale).toBeCloseTo(1);
    expect(p.scaledW).toBe(640);
    expect(p.scaledH).toBe(480);
    expect(p.padY).toBeGreaterThan(0);
    expect(p.padX).toBe(0);
  });

  it('imagem pequena (200×200) → scale = 640/200 = 3.2', () => {
    const p = computeLetterboxParams(200, 200, 640);
    expect(p.scale).toBeCloseTo(3.2, 4);
    expect(p.padX).toBe(0);
    expect(p.padY).toBe(0);
  });

  it('padX + scaledW ≤ targetSize (nunca ultrapassa a borda)', () => {
    const p = computeLetterboxParams(480, 640, 640);
    expect(p.padX + p.scaledW).toBeLessThanOrEqual(640);
    expect(p.padY + p.scaledH).toBeLessThanOrEqual(640);
  });

  it('imagem 1920×1080 → scale < 1 (downsample)', () => {
    const p = computeLetterboxParams(1920, 1080, 640);
    expect(p.scale).toBeLessThan(1);
    expect(p.scaledW).toBeLessThanOrEqual(640);
    expect(p.scaledH).toBeLessThanOrEqual(640);
  });
});

// ─── imageDataToTensor ────────────────────────────────────────────────────────

describe('imageDataToTensor', () => {
  it('pixel vermelho puro → R=1, G=0, B=0 em CHW', () => {
    // 1×1 pixel: RGBA = [255, 0, 0, 255]
    const data = new Uint8ClampedArray([255, 0, 0, 255]);
    const tensor = imageDataToTensor(data, 1);
    expect(tensor).toHaveLength(3); // 3 canais × 1 pixel
    expect(tensor[0]).toBeCloseTo(1, 5); // R
    expect(tensor[1]).toBeCloseTo(0, 5); // G
    expect(tensor[2]).toBeCloseTo(0, 5); // B
  });

  it('pixel branco puro → R=1, G=1, B=1', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255]);
    const tensor = imageDataToTensor(data, 1);
    expect(tensor[0]).toBeCloseTo(1);
    expect(tensor[1]).toBeCloseTo(1);
    expect(tensor[2]).toBeCloseTo(1);
  });

  it('pixel cinza 114 (letterbox) → valor ≈ 0.447', () => {
    const data = new Uint8ClampedArray([114, 114, 114, 255]);
    const tensor = imageDataToTensor(data, 1);
    expect(tensor[0]).toBeCloseTo(114 / 255, 4);
    expect(tensor[1]).toBeCloseTo(114 / 255, 4);
    expect(tensor[2]).toBeCloseTo(114 / 255, 4);
  });

  it('layout CHW correto para 2×2 imagem', () => {
    // 4 pixels: vermelho, verde, azul, branco
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,   // pixel 0: R
      0, 255, 0, 255,   // pixel 1: G
      0, 0, 255, 255,   // pixel 2: B
      255, 255, 255, 255, // pixel 3: branco
    ]);
    const size = 2;
    const n = size * size; // 4
    const tensor = imageDataToTensor(data, size);
    expect(tensor).toHaveLength(3 * n); // 12 valores
    // Canal R (índices 0..3)
    expect(tensor[0]).toBeCloseTo(1);   // pixel 0 R = 255
    expect(tensor[1]).toBeCloseTo(0);   // pixel 1 R = 0
    expect(tensor[2]).toBeCloseTo(0);   // pixel 2 R = 0
    expect(tensor[3]).toBeCloseTo(1);   // pixel 3 R = 255
    // Canal G (índices 4..7)
    expect(tensor[4]).toBeCloseTo(0);   // pixel 0 G = 0
    expect(tensor[5]).toBeCloseTo(1);   // pixel 1 G = 255
    // Canal B (índices 8..11)
    expect(tensor[8]).toBeCloseTo(0);   // pixel 0 B = 0
    expect(tensor[10]).toBeCloseTo(1);  // pixel 2 B = 255
  });

  it('alpha é ignorado (não afeta o tensor)', () => {
    const withAlpha    = new Uint8ClampedArray([128, 0, 0, 0]);   // alpha = 0
    const withoutAlpha = new Uint8ClampedArray([128, 0, 0, 255]); // alpha = 255
    const t1 = imageDataToTensor(withAlpha, 1);
    const t2 = imageDataToTensor(withoutAlpha, 1);
    expect(t1[0]).toBeCloseTo(t2[0]!); // R idêntico independente do alpha
  });

  it('todos os valores ficam em [0, 1]', () => {
    const data = new Uint8ClampedArray(Array.from({ length: 16 }, (_, i) => i * 16));
    const tensor = imageDataToTensor(data, 2);
    for (const v of tensor) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

import { describe, it, expect } from 'vitest';
import {
  connectedComponents, calculateEccentricity, calculateOrientation, filterComponents,
} from './connectedComponents';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function makeImage(rows: number[][]): { img: Uint8Array; w: number; h: number } {
  const h = rows.length, w = rows[0]!.length;
  const img = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      img[y * w + x] = rows[y]![x]!;
  return { img, w, h };
}

function diskPixels(cx: number, cy: number, r: number, w: number): number[] {
  const pixels: number[] = [];
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r)
        pixels.push(y * w + x);
  return pixels;
}

function linePixels(y: number, x0: number, x1: number, w: number): number[] {
  const pixels: number[] = [];
  for (let x = x0; x <= x1; x++) pixels.push(y * w + x);
  return pixels;
}

// ─── connectedComponents ─────────────────────────────────────────────────────

describe('connectedComponents — contagem', () => {
  it('3 blobs separados → 3 componentes', () => {
    const { img, w, h } = makeImage([
      [1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,1,1,0,0,0,0,0],
      [0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0],
    ]);
    expect(connectedComponents(img, w, h, 8)).toHaveLength(3);
  });

  it('imagem toda zero → 0 componentes', () => {
    const img = new Uint8Array(25);
    expect(connectedComponents(img, 5, 5)).toHaveLength(0);
  });
});

describe('connectedComponents — área e centróide', () => {
  it('área calculada corretamente (4 pixels)', () => {
    const { img, w, h } = makeImage([
      [0,0,0,0,0],
      [0,1,1,0,0],
      [0,1,1,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
    ]);
    const comps = connectedComponents(img, w, h);
    expect(comps).toHaveLength(1);
    expect(comps[0]!.area).toBe(4);
  });

  it('centróide de quadrado 4×4 fica no centro', () => {
    const { img, w, h } = makeImage([
      [0,0,0,0,0,0],
      [0,1,1,1,1,0],
      [0,1,1,1,1,0],
      [0,1,1,1,1,0],
      [0,1,1,1,1,0],
      [0,0,0,0,0,0],
    ]);
    const comps = connectedComponents(img, w, h);
    expect(comps[0]!.centroid.x).toBeCloseTo(2.5, 1);
    expect(comps[0]!.centroid.y).toBeCloseTo(2.5, 1);
  });
});

describe('connectedComponents — conectividade 4 vs 8', () => {
  // Dois pixels na diagonal
  const { img, w, h } = makeImage([
    [0,0,0,0,0],
    [0,1,0,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
  ]);

  it('conectividade 4 → 2 componentes (diagonal não conecta)', () => {
    expect(connectedComponents(img, w, h, 4)).toHaveLength(2);
  });

  it('conectividade 8 → 1 componente (diagonal conecta)', () => {
    expect(connectedComponents(img, w, h, 8)).toHaveLength(1);
  });
});

// ─── calculateEccentricity ───────────────────────────────────────────────────

describe('calculateEccentricity', () => {
  const W = 30;

  it('disco circular → excentricidade ≈ 0 (< 0.3)', () => {
    const pixels = diskPixels(15, 15, 8, W);
    expect(calculateEccentricity(pixels, W)).toBeLessThan(0.3);
  });

  it('linha horizontal → excentricidade ≈ 1 (> 0.95)', () => {
    const pixels = linePixels(5, 0, 19, W);
    expect(calculateEccentricity(pixels, W)).toBeGreaterThan(0.95);
  });
});

// ─── calculateOrientation ────────────────────────────────────────────────────

describe('calculateOrientation', () => {
  const W = 30;

  it('linha horizontal → orientação ≈ 0°', () => {
    const pixels = linePixels(10, 0, 19, W);
    expect(Math.abs(calculateOrientation(pixels, W))).toBeLessThan(5);
  });
});

// ─── filterComponents ────────────────────────────────────────────────────────

describe('filterComponents', () => {
  const { img, w, h } = makeImage([
    [1,0,0,0,0,0,0,0,0,0],  // componente de 1 pixel
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,0,0,0,0,0],  // componente de 3 pixels
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1],  // componente de 5 pixels
    [0,0,0,0,0,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
  ]);
  const comps = connectedComponents(img, w, h);

  it('minArea filtra componentes pequenos', () => {
    const result = filterComponents(comps, w, { minArea: 3 });
    expect(result.every(c => c.area >= 3)).toBe(true);
  });

  it('maxArea filtra componentes grandes', () => {
    const result = filterComponents(comps, w, { maxArea: 3 });
    expect(result.every(c => c.area <= 3)).toBe(true);
  });

  it('minArea + maxArea combinados', () => {
    const result = filterComponents(comps, w, { minArea: 2, maxArea: 4 });
    expect(result.every(c => c.area >= 2 && c.area <= 4)).toBe(true);
  });

  it('sem filtros retorna todos', () => {
    expect(filterComponents(comps, w, {})).toHaveLength(comps.length);
  });
});

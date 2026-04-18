import { describe, it, expect } from 'vitest';
import { rgbToLab, labToRgb, rgbToXyz, xyzToLab, labToXyz, xyzToRgb, imageDataToLab } from './colorSpace';

const TOL = 1.5; // tolerância para valores Lab (diferenças de arredondamento sRGB)

describe('rgbToLab — valores conhecidos', () => {
  it('vermelho puro (255,0,0) ≈ {L:53.24, a:80.09, b:67.20}', () => {
    const lab = rgbToLab({ r: 255, g: 0, b: 0 });
    expect(lab.L).toBeCloseTo(53.24, 0);
    expect(lab.a).toBeCloseTo(80.09, 0);
    expect(lab.b).toBeCloseTo(67.20, 0);
  });

  it('branco puro (255,255,255) ≈ {L:100, a:0, b:0}', () => {
    const lab = rgbToLab({ r: 255, g: 255, b: 255 });
    expect(lab.L).toBeCloseTo(100, 0);
    expect(lab.a).toBeCloseTo(0, 0);
    expect(lab.b).toBeCloseTo(0, 0);
  });

  it('preto puro (0,0,0) ≈ {L:0, a:0, b:0}', () => {
    const lab = rgbToLab({ r: 0, g: 0, b: 0 });
    expect(lab.L).toBeCloseTo(0, 1);
    expect(lab.a).toBeCloseTo(0, 1);
    expect(lab.b).toBeCloseTo(0, 1);
  });

  it('verde puro (0,255,0) — L positivo, a negativo', () => {
    const lab = rgbToLab({ r: 0, g: 255, b: 0 });
    expect(lab.L).toBeGreaterThan(0);
    expect(lab.a).toBeLessThan(0);  // verde = a negativo
  });

  it('azul puro (0,0,255) — b muito negativo', () => {
    const lab = rgbToLab({ r: 0, g: 0, b: 255 });
    expect(lab.b).toBeLessThan(-50);  // azul = b negativo
  });
});

describe('round trip RGB → Lab → RGB', () => {
  const cases: Array<{ r: number; g: number; b: number }> = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 128, g: 64, b: 32 },
    { r: 200, g: 180, b: 160 },
    { r: 50, g: 100, b: 150 },
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  ];

  for (const rgb of cases) {
    it(`round trip (${rgb.r},${rgb.g},${rgb.b}) com tolerância ±${TOL}`, () => {
      const back = labToRgb(rgbToLab(rgb));
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(TOL);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(TOL);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(TOL);
    });
  }
});

describe('rgbToXyz / xyzToRgb', () => {
  it('branco normalizado dá XYZ ≈ {X:0.950, Y:1.000, Z:1.089}', () => {
    const xyz = rgbToXyz({ r: 255, g: 255, b: 255 });
    expect(xyz.X).toBeCloseTo(0.9505, 2);
    expect(xyz.Y).toBeCloseTo(1.0000, 2);
    expect(xyz.Z).toBeCloseTo(1.0888, 2);
  });
});

describe('imageDataToLab', () => {
  it('retorna array com o mesmo número de pixels', () => {
    const data = new Uint8ClampedArray([
      255, 0,   0,   255,  // pixel 0: vermelho
      0,   255, 0,   255,  // pixel 1: verde
      0,   0,   255, 255,  // pixel 2: azul
    ]);
    const imageData = { data, width: 3, height: 1 } as ImageData;
    const labs = imageDataToLab(imageData);
    expect(labs).toHaveLength(3);
    expect(labs[0]!.L).toBeCloseTo(53.24, 0);
  });
});

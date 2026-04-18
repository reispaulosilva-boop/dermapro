import { describe, it, expect } from 'vitest';
import { rgbToHsv, hsvToRgb, imageDataToHsv } from './hsvColorSpace';

const TOL = 2; // tolerância em unidades [0-255] para round-trip

describe('rgbToHsv — cores primárias', () => {
  it('vermelho (255,0,0) → {h:0, s:255, v:255}', () => {
    const hsv = rgbToHsv({ r: 255, g: 0, b: 0 });
    expect(hsv.h).toBeCloseTo(0, 0);
    expect(hsv.s).toBeCloseTo(255, 0);
    expect(hsv.v).toBeCloseTo(255, 0);
  });

  it('verde (0,255,0) → {h:120, s:255, v:255}', () => {
    const hsv = rgbToHsv({ r: 0, g: 255, b: 0 });
    expect(hsv.h).toBeCloseTo(120, 0);
    expect(hsv.s).toBeCloseTo(255, 0);
    expect(hsv.v).toBeCloseTo(255, 0);
  });

  it('azul (0,0,255) → {h:240, s:255, v:255}', () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 255 });
    expect(hsv.h).toBeCloseTo(240, 0);
    expect(hsv.s).toBeCloseTo(255, 0);
    expect(hsv.v).toBeCloseTo(255, 0);
  });

  it('cinza médio (128,128,128) → {s:0, v:128}', () => {
    const hsv = rgbToHsv({ r: 128, g: 128, b: 128 });
    expect(hsv.s).toBeCloseTo(0, 0);
    expect(hsv.v).toBeCloseTo(128, 0);
  });

  it('preto (0,0,0) → {s:0, v:0}', () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 0 });
    expect(hsv.s).toBe(0);
    expect(hsv.v).toBe(0);
  });

  it('branco (255,255,255) → {s:0, v:255}', () => {
    const hsv = rgbToHsv({ r: 255, g: 255, b: 255 });
    expect(hsv.s).toBeCloseTo(0, 0);
    expect(hsv.v).toBeCloseTo(255, 0);
  });
});

describe('round trip RGB → HSV → RGB', () => {
  const cases = [
    { r: 255, g: 0,   b: 0   },
    { r: 0,   g: 255, b: 0   },
    { r: 0,   g: 0,   b: 255 },
    { r: 128, g: 128, b: 128 },
    { r: 200, g: 100, b: 50  },
    { r: 30,  g: 80,  b: 200 },
    { r: 0,   g: 0,   b: 0   },
    { r: 255, g: 255, b: 255 },
  ];

  for (const rgb of cases) {
    it(`round trip (${rgb.r},${rgb.g},${rgb.b}) tolerância ±${TOL}`, () => {
      const back = hsvToRgb(rgbToHsv(rgb));
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(TOL);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(TOL);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(TOL);
    });
  }
});

describe('imageDataToHsv', () => {
  it('retorna array com mesmo número de pixels', () => {
    const data = new Uint8ClampedArray([
      255, 0,   0,   255,
      0,   255, 0,   255,
      0,   0,   255, 255,
    ]);
    const labs = imageDataToHsv({ data, width: 3, height: 1 } as ImageData);
    expect(labs).toHaveLength(3);
    expect(labs[0]!.h).toBeCloseTo(0, 0);   // vermelho
    expect(labs[1]!.h).toBeCloseTo(120, 0); // verde
    expect(labs[2]!.h).toBeCloseTo(240, 0); // azul
  });
});

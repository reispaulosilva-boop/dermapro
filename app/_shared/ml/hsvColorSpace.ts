/**
 * DermaPro — Conversões de Espaço de Cor RGB ↔ HSV
 *
 * Convenção: h∈[0,360°], s/v∈[0,255] (compatível com OpenCV HSV).
 * Referência: Smith 1978 (HSV color model).
 */

import type { RGBColor } from './colorSpace';

export type HSVColor = {
  h: number;  // matiz [0, 360)
  s: number;  // saturação [0, 255]
  v: number;  // valor/brilho [0, 255]
};

// ─── RGB → HSV ───────────────────────────────────────────────────────────────

export function rgbToHsv({ r, g, b }: RGBColor): HSVColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  const v = max * 255;
  const s = max === 0 ? 0 : (delta / max) * 255;

  let h = 0;
  if (delta > 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2);
    } else {
      h = 60 * ((rn - gn) / delta + 4);
    }
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

// ─── HSV → RGB ───────────────────────────────────────────────────────────────

export function hsvToRgb({ h, s, v }: HSVColor): RGBColor {
  const sn = s / 255;
  const vn = v / 255;

  if (sn === 0) {
    const c = Math.round(vn * 255);
    return { r: c, g: c, b: c };
  }

  const hi = Math.floor(h / 60) % 6;
  const f  = h / 60 - Math.floor(h / 60);
  const p  = vn * (1 - sn);
  const q  = vn * (1 - f * sn);
  const t  = vn * (1 - (1 - f) * sn);

  let rn: number, gn: number, bn: number;
  switch (hi) {
    case 0: [rn, gn, bn] = [vn, t,  p ]; break;
    case 1: [rn, gn, bn] = [q,  vn, p ]; break;
    case 2: [rn, gn, bn] = [p,  vn, t ]; break;
    case 3: [rn, gn, bn] = [p,  q,  vn]; break;
    case 4: [rn, gn, bn] = [t,  p,  vn]; break;
    default:[rn, gn, bn] = [vn, p,  q ]; break;
  }

  return {
    r: Math.round(rn * 255),
    g: Math.round(gn * 255),
    b: Math.round(bn * 255),
  };
}

// ─── PROCESSAMENTO DE ImageData ──────────────────────────────────────────────

/**
 * Converte todos os pixels de um ImageData para HSV.
 * Alpha é ignorado; retorna array paralelo (índice i = pixel i).
 */
export function imageDataToHsv(imageData: ImageData): HSVColor[] {
  const { data, width, height } = imageData;
  const result: HSVColor[] = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    result[i] = rgbToHsv({
      r: data[offset]!,
      g: data[offset + 1]!,
      b: data[offset + 2]!,
    });
  }
  return result;
}

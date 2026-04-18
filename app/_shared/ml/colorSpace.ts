/**
 * DermaPro — Conversões de Espaço de Cor RGB ↔ CIE L*a*b*
 *
 * Implementa a cadeia:  RGB(sRGB) ↔ XYZ(D65) ↔ L*a*b*
 *
 * Referências:
 *   - sRGB standard: IEC 61966-2-1
 *   - XYZ → Lab: http://www.brucelindbloom.com/index.html?Equations.html
 *   - Iluminante D65: Xn=0.95047, Yn=1.00000, Zn=1.08883
 */

// ─── TIPOS ────────────────────────────────────────────────────────────────────

/** Cor RGB com componentes [0, 255]. */
export type RGBColor = { r: number; g: number; b: number };

/** Cor CIE L*a*b*: L∈[0,100], a/b∈[-128,+127]. */
export type LabColor = { L: number; a: number; b: number };

/** Tripla XYZ normalizada (D65, Y=1 para branco). */
type XYZColor = { X: number; Y: number; Z: number };

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

// Ponto branco D65 normalizado
const Xn = 0.95047;
const Yn = 1.00000;
const Zn = 1.08883;

// Limiar de linearização sRGB
const SRGB_THRESHOLD = 0.04045;

// Limiar da função f() do Lab (CIE: δ³ onde δ = 6/29)
const LAB_DELTA  = 6 / 29;           // ≈ 0.20690
const LAB_DELTA3 = LAB_DELTA ** 3;   // ≈ 0.00886

// ─── RGB ↔ XYZ ───────────────────────────────────────────────────────────────

/** Remove gamma sRGB: converte canal [0,255] para linear [0,1]. */
function toLinear(c: number): number {
  const s = c / 255;
  return s <= SRGB_THRESHOLD / 12.92
    ? s / 12.92
    : ((s + 0.055) / 1.055) ** 2.4;
}

/** Aplica gamma sRGB: converte linear [0,1] para canal [0,255]. */
function fromLinear(c: number): number {
  const s = c <= 0.0031308
    ? 12.92 * c
    : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, s * 255)));
}

export function rgbToXyz({ r, g, b }: RGBColor): XYZColor {
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);
  // Matriz sRGB D65 (IEC 61966-2-1)
  return {
    X: rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375,
    Y: rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750,
    Z: rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041,
  };
}

export function xyzToRgb({ X, Y, Z }: XYZColor): RGBColor {
  // Matriz inversa sRGB D65
  const rl =  X * 3.2404542 - Y * 1.5371385 - Z * 0.4985314;
  const gl = -X * 0.9692660 + Y * 1.8760108 + Z * 0.0415560;
  const bl =  X * 0.0556434 - Y * 0.2040259 + Z * 1.0572252;
  return { r: fromLinear(rl), g: fromLinear(gl), b: fromLinear(bl) };
}

// ─── XYZ ↔ Lab ───────────────────────────────────────────────────────────────

/** Função f() CIE: aplica compressão cúbica/linear. */
function f(t: number): number {
  return t > LAB_DELTA3
    ? t ** (1 / 3)
    : t / (3 * LAB_DELTA ** 2) + 4 / 29;
}

/** Inversa de f(). */
function fInv(t: number): number {
  return t > LAB_DELTA
    ? t ** 3
    : 3 * LAB_DELTA ** 2 * (t - 4 / 29);
}

export function xyzToLab({ X, Y, Z }: XYZColor): LabColor {
  const fx = f(X / Xn);
  const fy = f(Y / Yn);
  const fz = f(Z / Zn);
  return {
    L:  116 * fy - 16,
    a:  500 * (fx - fy),
    b:  200 * (fy - fz),
  };
}

export function labToXyz({ L, a, b }: LabColor): XYZColor {
  const fy = (L + 16) / 116;
  return {
    X: Xn * fInv(fy + a / 500),
    Y: Yn * fInv(fy),
    Z: Zn * fInv(fy - b / 200),
  };
}

// ─── RGB ↔ Lab (compostos) ───────────────────────────────────────────────────

export function rgbToLab(rgb: RGBColor): LabColor {
  return xyzToLab(rgbToXyz(rgb));
}

export function labToRgb(lab: LabColor): RGBColor {
  return xyzToRgb(labToXyz(lab));
}

// ─── PROCESSAMENTO DE ImageData ──────────────────────────────────────────────

/**
 * Converte todos os pixels de um ImageData para L*a*b*.
 * Alpha é ignorado; retorna array paralelo (índice i = pixel i).
 */
export function imageDataToLab(imageData: ImageData): LabColor[] {
  const { data, width, height } = imageData;
  const result: LabColor[] = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    result[i] = rgbToLab({
      r: data[offset]!,
      g: data[offset + 1]!,
      b: data[offset + 2]!,
    });
  }
  return result;
}

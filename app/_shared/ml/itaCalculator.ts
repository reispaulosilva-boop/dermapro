/**
 * DermaPro — Calculadora ITA (Individual Typology Angle)
 *
 * ITA° = arctan((L* − 50) / b*) × (180/π)
 *
 * Referência: Chardon et al., "Skin colour typology and suntanning pathways",
 * Int J Cosmet Sci 13(4):191-208, 1991.
 *
 * Faixas de categoria (Wilkes et al. 2015):
 *   > 55°       → very_light
 *   41–55°      → light
 *   28–41°      → intermediate
 *   10–28°      → tan
 *   -30 a 10°   → brown
 *   < -30°      → dark
 */

import type { LabColor } from './colorSpace';
import { rgbToLab, imageDataToLab } from './colorSpace';
import type { SkinROI } from './roiExtractor';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type ITACategory =
  | 'very_light' | 'light' | 'intermediate' | 'tan' | 'brown' | 'dark';

export type ITAResult = {
  angle: number;
  category: ITACategory;
  avgL: number;
  avgB: number;
};

// ─── CÁLCULO BASE ─────────────────────────────────────────────────────────────

/** Classifica um ângulo ITA na categoria correspondente. */
function classifyAngle(angle: number): ITACategory {
  if (angle >  55) return 'very_light';
  if (angle >  41) return 'light';
  if (angle >  28) return 'intermediate';
  if (angle >  10) return 'tan';
  if (angle > -30) return 'brown';
  return 'dark';
}

/**
 * Calcula ITA a partir das médias L* e b* já computadas.
 * Usa atan2(L-50, b) para robustez quando b ≈ 0.
 */
export function calculateITA(avgL: number, avgB: number): ITAResult {
  const angle = Math.atan2(avgL - 50, avgB) * (180 / Math.PI);
  return { angle, category: classifyAngle(angle), avgL, avgB };
}

// ─── A PARTIR DE PIXELS Lab ──────────────────────────────────────────────────

/**
 * Calcula ITA a partir de um array de pixels Lab.
 * Remove outliers por IQR antes de calcular a média (opcional).
 *
 * @param labPixels Array de cores Lab.
 * @param removeOutliers Se true, remove pixels fora de 1.5×IQR antes de calcular médias.
 */
export function calculateITAFromPixels(
  labPixels: LabColor[],
  removeOutliers = false,
): ITAResult {
  if (labPixels.length === 0) return calculateITA(50, 0);

  let pixels = labPixels;

  if (removeOutliers && labPixels.length >= 4) {
    pixels = filterByIQR(labPixels);
  }

  let sumL = 0, sumB = 0;
  for (const p of pixels) { sumL += p.L; sumB += p.b; }
  const avgL = sumL / pixels.length;
  const avgB = sumB / pixels.length;

  return calculateITA(avgL, avgB);
}

/** Remove pixels fora de 1.5×IQR no canal L. */
function filterByIQR(pixels: LabColor[]): LabColor[] {
  const lValues = pixels.map(p => p.L).sort((a, b) => a - b);
  const n = lValues.length;
  const q1 = lValues[Math.floor(n * 0.25)]!;
  const q3 = lValues[Math.floor(n * 0.75)]!;
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return pixels.filter(p => p.L >= lo && p.L <= hi);
}

// ─── A PARTIR DE CANVAS ──────────────────────────────────────────────────────

/**
 * Calcula ITA a partir das regiões de interesse de um canvas.
 * Converte os pixels das ROIs para Lab e delega a calculateITAFromPixels.
 */
export function calculateITAFromCanvas(
  canvas: HTMLCanvasElement,
  regions: SkinROI[],
): ITAResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) return calculateITA(50, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const allLab = imageDataToLab(imageData);

  // Coleta pixels que caem dentro de alguma ROI
  const roiPixels: LabColor[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pt = { x, y };
      const inAnyROI = regions.some(roi => {
        const { x: bx, y: by, width: bw, height: bh } = roi.bbox;
        if (x < bx || x > bx + bw || y < by || y > by + bh) return false;
        return true;
      });
      if (inAnyROI) roiPixels.push(allLab[y * width + x]!);
    }
  }

  return calculateITAFromPixels(roiPixels.length > 0 ? roiPixels : allLab);
}

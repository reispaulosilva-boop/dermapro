/**
 * DermaPro — ROI Extractor
 *
 * Extrai Regiões de Interesse (ROIs) da pele a partir dos 478 landmarks do
 * MediaPipe Face Landmarker (468 mesh + 10 iris).
 *
 * Mapeamento anatômico via topographicIndices.json (portado do FacePipe Pro).
 * Convenção Dir/Esq = ponto de vista do PACIENTE (consistente com MediaPipe).
 * Referência: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 */

import topographicIndices from './topographicIndices.json';
import { extractPolygonPaths } from './extractPolygonPaths';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type FacialPoint = { x: number; y: number; z?: number };

export type SkinROI = {
  name: string;
  polygons: FacialPoint[][];
  bbox: { x: number; y: number; width: number; height: number };
};

// ─── UTILITÁRIOS GEOMÉTRICOS ─────────────────────────────────────────────────

/** Ray casting: retorna true se o ponto está dentro do polígono. */
export function isPointInPolygon(
  point: FacialPoint,
  polygon: FacialPoint[],
): boolean {
  let inside = false;
  const { x, y } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x, yi = polygon[i]!.y;
    const xj = polygon[j]!.x, yj = polygon[j]!.y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Retorna true se o ponto está dentro de qualquer polígono da ROI. */
export function isPointInROI(point: FacialPoint, roi: SkinROI): boolean {
  for (const polygon of roi.polygons) {
    if (isPointInPolygon(point, polygon)) return true;
  }
  return false;
}

/** Bounding box de um único polígono. */
export function polygonToBbox(
  polygon: FacialPoint[],
): { x1: number; y1: number; x2: number; y2: number } {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const p of polygon) {
    if (p.x < x1) x1 = p.x;
    if (p.y < y1) y1 = p.y;
    if (p.x > x2) x2 = p.x;
    if (p.y > y2) y2 = p.y;
  }
  return { x1, y1, x2, y2 };
}

/** Bounding box que envolve todos os polígonos de uma ROI. */
export function polygonsToBbox(
  polygons: FacialPoint[][],
): { x: number; y: number; width: number; height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polygons) {
    for (const p of poly) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Área do polígono via fórmula de Shoelace (valor absoluto). */
export function polygonArea(polygon: FacialPoint[]): number {
  let area = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += polygon[j]!.x * polygon[i]!.y;
    area -= polygon[i]!.x * polygon[j]!.y;
  }
  return Math.abs(area) / 2;
}

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

/** Projeta landmark normalizado [0,1] para coordenadas de pixel. */
function lmToPx(
  lm: FacialPoint,
  width: number,
  height: number,
): FacialPoint {
  return { x: lm.x * width, y: lm.y * height, z: lm.z };
}

/**
 * Converte uma lista linear de índices (com fechamentos FacePipe) em
 * sub-polígonos de pixels. Cada fechamento (índice == primeiro do sub-caminho)
 * inicia um novo sub-polígono.
 */
function indicesToPolygonList(
  indices: number[],
  landmarks: FacialPoint[],
  width: number,
  height: number,
): FacialPoint[][] {
  const paths = extractPolygonPaths(indices);
  return paths.map(path =>
    path.map(idx => lmToPx(landmarks[idx] ?? { x: 0, y: 0 }, width, height)),
  );
}

// ─── ÍNDICES LEGADOS (usados apenas por funções não-migradas) ────────────────

// Contorno facial externo (face oval)
const IDX_FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109] as const;

// Centros das pupilas e cantos de olho (para medidas)
const IDX_PUPIL_RIGHT   = 468;
const IDX_PUPIL_LEFT    = 473;
const IDX_CANTHUS_RIGHT = 33;
const IDX_CANTHUS_LEFT  = 263;

// ─── EXTRAÇÃO DE ROIs ─────────────────────────────────────────────────────────

export function extractForeheadROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const frontal = indicesToPolygonList(topographicIndices.frontal, landmarks, width, height);
  const glabela = indicesToPolygonList(topographicIndices.glabela, landmarks, width, height);
  const polygons = [...frontal, ...glabela];
  return { name: 'forehead', polygons, bbox: polygonsToBbox(polygons) };
}

export function extractLeftCheekROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const ml = indicesToPolygonList(topographicIndices.malar_lateral_l, landmarks, width, height);
  const mm = indicesToPolygonList(topographicIndices.malar_medial_l,  landmarks, width, height);
  const ip = indicesToPolygonList(topographicIndices.infrapalpebral_l, landmarks, width, height);
  const polygons = [...ml, ...mm, ...ip];
  return { name: 'leftCheek', polygons, bbox: polygonsToBbox(polygons) };
}

export function extractRightCheekROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const ml = indicesToPolygonList(topographicIndices.malar_lateral_r, landmarks, width, height);
  const mm = indicesToPolygonList(topographicIndices.malar_medial_r,  landmarks, width, height);
  const ip = indicesToPolygonList(topographicIndices.infrapalpebral_r, landmarks, width, height);
  const polygons = [...ml, ...mm, ...ip];
  return { name: 'rightCheek', polygons, bbox: polygonsToBbox(polygons) };
}

export function extractChinROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygons = indicesToPolygonList(topographicIndices.mento, landmarks, width, height);
  return { name: 'chin', polygons, bbox: polygonsToBbox(polygons) };
}

export function extractNoseROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygons = indicesToPolygonList(topographicIndices.nariz, landmarks, width, height);
  return { name: 'nose', polygons, bbox: polygonsToBbox(polygons) };
}

export function extractSupralabialROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygons = indicesToPolygonList(topographicIndices.perioral, landmarks, width, height);
  return { name: 'supralabial', polygons, bbox: polygonsToBbox(polygons) };
}

// ─── MEDIDAS ─────────────────────────────────────────────────────────────────

/**
 * Distância interpupilar em pixels.
 * Usa iris landmarks (468/473) se disponíveis; cai para cantos externos (33/263).
 */
export function interpupillaryDistancePx(landmarks: FacialPoint[]): number {
  const hasIris = landmarks.length > IDX_PUPIL_LEFT;
  const rIdx = hasIris ? IDX_PUPIL_RIGHT : IDX_CANTHUS_RIGHT;
  const lIdx = hasIris ? IDX_PUPIL_LEFT  : IDX_CANTHUS_LEFT;
  const r = landmarks[rIdx] ?? { x: 0, y: 0 };
  const l = landmarks[lIdx] ?? { x: 0, y: 0 };
  return Math.hypot(l.x - r.x, l.y - r.y);
}

/**
 * Estima rotação facial a partir dos landmarks (sem matriz de transformação).
 * Aproximação baseada em assimetria de pontos simétricos.
 */
export function estimateFaceRotation(
  landmarks: FacialPoint[],
): { yaw: number; pitch: number; roll: number } {
  const leftTemple  = landmarks[234] ?? { x: 0.2, y: 0.5, z: 0 };
  const rightTemple = landmarks[454] ?? { x: 0.8, y: 0.5, z: 0 };
  const yaw = ((rightTemple.z ?? 0) - (leftTemple.z ?? 0)) * 90;

  const noseTip = landmarks[4]   ?? { x: 0.5, y: 0.5, z: 0 };
  const chin    = landmarks[152] ?? { x: 0.5, y: 0.8, z: 0 };
  const pitch   = ((noseTip.z ?? 0) - (chin.z ?? 0)) * 45;

  const rEye = landmarks[IDX_CANTHUS_RIGHT] ?? { x: 0.35, y: 0.4, z: 0 };
  const lEye = landmarks[IDX_CANTHUS_LEFT]  ?? { x: 0.65, y: 0.4, z: 0 };
  const roll = Math.atan2(lEye.y - rEye.y, lEye.x - rEye.x) * (180 / Math.PI);

  return { yaw, pitch, roll };
}

/**
 * Estima área facial em cm².
 *
 * @param landmarks Landmarks normalizados [0,1].
 * @param interpupillaryPx Distância interpupilar em pixels.
 * @param referenceMm Distância interpupilar de referência em mm (padrão adulto: 63 mm).
 */
export function estimateFaceAreaCm2(
  landmarks: FacialPoint[],
  interpupillaryPx: number,
  referenceMm = 63,
): number {
  if (interpupillaryPx <= 0) return 0;
  const pxPerMm   = interpupillaryPx / referenceMm;
  const pxPerCm   = pxPerMm * 10;
  const px2PerCm2 = pxPerCm * pxPerCm;

  const ovalPolygon = IDX_FACE_OVAL.map(i => landmarks[i] ?? { x: 0, y: 0 });
  const areaNormalized = polygonArea(ovalPolygon);
  return (areaNormalized * px2PerCm2) || 0;
}

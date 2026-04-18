/**
 * DermaPro — ROI Extractor
 *
 * Extrai Regiões de Interesse (ROIs) da pele a partir dos 478 landmarks do
 * MediaPipe Face Landmarker (468 mesh + 10 iris).
 *
 * Referência: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 */

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type FacialPoint = { x: number; y: number; z?: number };

export type SkinROI = {
  name: string;
  polygon: FacialPoint[];
  holes?: FacialPoint[][];
  bbox: { x1: number; y1: number; x2: number; y2: number };
};

// ─── ÍNDICES DE LANDMARKS ────────────────────────────────────────────────────

// Contorno facial externo (face oval)
const IDX_FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109] as const;

// Testa: hairline direita → temporal direita → sobrancelhas → glabela → sobrancelhas esq → temporal esq
const IDX_FOREHEAD = [
  10, 338, 297, 332, 284, 251,        // hairline: centro → têmpora direita
  21, 54, 103, 67, 109,               // temporal direita (conservador)
  46, 70, 63, 105, 66, 107,           // sobrancelha direita: externo → interno
  55, 8, 285,                          // glabela
  336, 296, 334, 293, 300, 276,       // sobrancelha esquerda: interno → externo
  389, 356,                            // pontos de transição para fechar hairline
] as const;

// Bochechas — polígonos completos cobrindo área infraorbital + malar + mandibular
const IDX_LEFT_CHEEK_POLY = [
  116, 123, 147, 213, 192, 214, 210, 211, 32, 208,
  199, 175, 152, 148, 176, 149, 150, 187, 207, 216,
  206, 205, 36, 142, 126, 203, 98, 97, 49, 131, 134, 51, 5,
] as const;

const IDX_RIGHT_CHEEK_POLY = [
  345, 346, 347, 348, 349, 350,        // infraorbital direita
  451, 452, 453, 464,                  // lateral nasal esquerda da foto
  435, 401, 366, 376, 352,             // lateral descendo
  411, 447, 454, 323, 361,             // mandibular (duplicatas 352 e 345 removidas)
  356, 389, 251, 284,                  // transição superior de volta
] as const;

// Queixo — de abaixo do lábio até ponta do queixo, com laterais
const IDX_CHIN_POLY = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,   // contorno da boca inferior
  287, 273, 335, 406, 313, 421, 418, 424, 422,           // lateral direita descendo
  152, 148, 176, 149, 150,                                // ponta do queixo
  194, 201, 200, 199, 175,                                // lateral esquerda subindo
  83, 182, 106, 43, 57,                                   // voltar à boca
] as const;

// Nariz (base e laterais, sem narinas)
const IDX_NOSE_BASE_POLY = [8, 9, 168, 6, 197, 195, 5, 4, 19, 94, 2, 164, 393, 417] as const;
// Narinas (holes) — ponto 2 removido para evitar holes que se tocam na ponta
const IDX_NARIS_RIGHT = [49, 48, 64, 98, 97] as const;
const IDX_NARIS_LEFT  = [279, 278, 294, 327, 326] as const;

// Região supralabial (filtrum + área acima dos lábios) — usado em melasma
const IDX_SUPRALABIAL = [0,37,39,40,185,61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0] as const;

// Olhos (para holes em ROIs que os contêm)
const IDX_LEFT_EYE  = [263,249,390,373,374,380,381,382,362,398,384,385,386,387,388,466] as const;
const IDX_RIGHT_EYE = [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246] as const;

// Centros das pupilas: iris landmarks 468 (olho direito, viewer esq.) e 473 (olho esq., viewer dir.)
// Fallback para cantos externos dos olhos: 33 (dir.) e 263 (esq.)
const IDX_PUPIL_RIGHT  = 468;
const IDX_PUPIL_LEFT   = 473;
const IDX_CANTHUS_RIGHT = 33;
const IDX_CANTHUS_LEFT  = 263;

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

/**
 * Retorna true se o ponto está dentro do polygon principal
 * E fora de todos os holes.
 */
export function isPointInROI(point: FacialPoint, roi: SkinROI): boolean {
  if (!isPointInPolygon(point, roi.polygon)) return false;
  if (roi.holes) {
    for (const hole of roi.holes) {
      if (isPointInPolygon(point, hole)) return false;
    }
  }
  return true;
}

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

function indicesToPolygon(
  indices: readonly number[],
  landmarks: FacialPoint[],
  width: number,
  height: number,
): FacialPoint[] {
  return indices.map(i => lmToPx(landmarks[i] ?? { x: 0, y: 0 }, width, height));
}

// ─── EXTRAÇÃO DE ROIs ─────────────────────────────────────────────────────────

export function extractForeheadROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygon = indicesToPolygon(IDX_FOREHEAD, landmarks, width, height);
  return { name: 'forehead', polygon, bbox: polygonToBbox(polygon) };
}

export function extractLeftCheekROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygon = indicesToPolygon(IDX_LEFT_CHEEK_POLY, landmarks, width, height);
  return { name: 'leftCheek', polygon, bbox: polygonToBbox(polygon) };
}

export function extractRightCheekROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygon = indicesToPolygon(IDX_RIGHT_CHEEK_POLY, landmarks, width, height);
  return { name: 'rightCheek', polygon, bbox: polygonToBbox(polygon) };
}

export function extractChinROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygon = indicesToPolygon(IDX_CHIN_POLY, landmarks, width, height);
  return { name: 'chin', polygon, bbox: polygonToBbox(polygon) };
}

export function extractNoseROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygon = indicesToPolygon(IDX_NOSE_BASE_POLY, landmarks, width, height);
  const holes = [
    indicesToPolygon(IDX_NARIS_RIGHT, landmarks, width, height),
    indicesToPolygon(IDX_NARIS_LEFT,  landmarks, width, height),
  ];
  return { name: 'nose', polygon, holes, bbox: polygonToBbox(polygon) };
}

export function extractSupralabialROI(
  landmarks: FacialPoint[],
  width: number,
  height: number,
): SkinROI {
  const polygon = indicesToPolygon(IDX_SUPRALABIAL, landmarks, width, height);
  return { name: 'supralabial', polygon, bbox: polygonToBbox(polygon) };
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
 * TODO: Preferir o resultado da matriz de transformação do FaceLandmarker quando disponível.
 */
export function estimateFaceRotation(
  landmarks: FacialPoint[],
): { yaw: number; pitch: number; roll: number } {
  // Yaw: diferença em z entre os pontos laterais
  const leftTemple  = landmarks[234] ?? { x: 0.2, y: 0.5, z: 0 };
  const rightTemple = landmarks[454] ?? { x: 0.8, y: 0.5, z: 0 };
  const yaw = ((rightTemple.z ?? 0) - (leftTemple.z ?? 0)) * 90;

  // Pitch: relação entre nariz e mento
  const noseTip = landmarks[4]   ?? { x: 0.5, y: 0.5, z: 0 };
  const chin    = landmarks[152] ?? { x: 0.5, y: 0.8, z: 0 };
  const pitch   = ((noseTip.z ?? 0) - (chin.z ?? 0)) * 45;

  // Roll: ângulo da linha interpupilar
  const rEye = landmarks[IDX_CANTHUS_RIGHT] ?? { x: 0.35, y: 0.4, z: 0 };
  const lEye = landmarks[IDX_CANTHUS_LEFT]  ?? { x: 0.65, y: 0.4, z: 0 };
  const roll = Math.atan2(lEye.y - rEye.y, lEye.x - rEye.x) * (180 / Math.PI);

  return { yaw, pitch, roll };
}

/**
 * Estima área facial em cm².
 *
 * @param landmarks Landmarks normalizados [0,1].
 * @param interpupillaryPx Distância interpupilar em pixels (para escala).
 * @param referenceMm Distância interpupilar de referência em mm (padrão adulto: 63 mm).
 */
export function estimateFaceAreaCm2(
  landmarks: FacialPoint[],
  interpupillaryPx: number,
  referenceMm = 63,
): number {
  if (interpupillaryPx <= 0) return 0;
  const pxPerMm  = interpupillaryPx / referenceMm;
  const pxPerCm  = pxPerMm * 10;
  const px2PerCm2 = pxPerCm * pxPerCm;

  // Polígono do contorno facial (face oval), já em coordenadas normalizadas → converter para px unitários
  const ovalPolygon = IDX_FACE_OVAL.map(i => landmarks[i] ?? { x: 0, y: 0 });
  const areaNormalized = polygonArea(ovalPolygon);  // em unidades normalizadas²
  // Para obter área em px², precisaríamos de width/height; aqui retornamos escala relativa
  // TODO: receber width/height como parâmetros para cálculo absoluto correto
  return (areaNormalized * px2PerCm2) || 0;
}

/**
 * DermaPro — FaceLandmarker Wrapper (MediaPipe)
 *
 * Singleton com lazy-load: inicializa WASM apenas no primeiro detect().
 * Suporta 1 face por vez; rejeita se nenhuma ou múltiplas faces forem detectadas.
 * Tenta CDN oficial primeiro; cai para cópia local em /public/models/ se offline.
 */

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';

const MODEL_CDN =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';
const MODEL_LOCAL = '/models/face_landmarker.task';
const WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export type LandmarkPoint = { x: number; y: number; z: number };

export type FaceRotation = {
  yaw: number;    // giro horizontal (esquerda/direita), graus
  pitch: number;  // inclinação vertical (cima/baixo), graus
  roll: number;   // rotação axial (lado), graus
};

export type DetectResult = {
  landmarks: LandmarkPoint[];
  faceCount: number;
  rotation?: FaceRotation;
};

let _instance: FaceLandmarker | null = null;
let _initPromise: Promise<FaceLandmarker> | null = null;

async function resolveModelPath(): Promise<string> {
  try {
    const res = await fetch(MODEL_CDN, { method: 'HEAD' });
    if (res.ok) return MODEL_CDN;
  } catch {
    // sem rede — usa cópia local
  }
  return MODEL_LOCAL;
}

async function getInstance(): Promise<FaceLandmarker> {
  if (_instance) return _instance;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
    const modelPath = await resolveModelPath();
    _instance = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelPath, delegate: 'GPU' },
      runningMode: 'IMAGE',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true,
    });
    return _instance;
  })();

  return _initPromise;
}

/**
 * Converte matriz de transformação 4×4 (row-major) para ângulos de Euler em graus.
 * Convenção ZYX: yaw=Y, pitch=X, roll=Z.
 */
function matrixToRotation(m: number[]): FaceRotation {
  // R (row-major 4×4): r[row][col] = m[row*4 + col]
  const r00 = m[0]!, r10 = m[4]!, r20 = m[8]!;
  const r21 = m[9]!, r22 = m[10]!;
  const RAD = 180 / Math.PI;
  return {
    yaw:   Math.atan2(r10, r00) * RAD,
    pitch: Math.atan2(-r20, Math.hypot(r21, r22)) * RAD,
    roll:  Math.atan2(r21, r22) * RAD,
  };
}

/**
 * Detecta landmarks faciais.
 *
 * @param source Canvas, OffscreenCanvas ou ImageBitmap já decodificado.
 * @returns Landmarks normalizados [0,1], contagem de faces e rotação estimada.
 * @throws Error se nenhuma ou múltiplas faces forem detectadas.
 *         No caso de múltiplas, o erro inclui a propriedade `faceCount`.
 */
export async function detect(
  source: HTMLCanvasElement | OffscreenCanvas | ImageBitmap,
): Promise<DetectResult> {
  const landmarker = await getInstance();
  // A API detect() aceita HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  // Para OffscreenCanvas/ImageBitmap, o cast é necessário (suporte real depende do browser)
  const result: FaceLandmarkerResult = landmarker.detect(
    source as HTMLCanvasElement,
  );

  const faceCount = result.faceLandmarks.length;

  if (faceCount === 0) {
    throw new Error('Nenhuma face detectada na imagem.');
  }

  if (faceCount > 1) {
    const err = new Error(
      `${faceCount} faces detectadas. Envie uma foto com apenas um rosto.`,
    );
    (err as Error & { faceCount: number }).faceCount = faceCount;
    throw err;
  }

  const raw: NormalizedLandmark[] = result.faceLandmarks[0]!;
  const landmarks: LandmarkPoint[] = raw.map(lm => ({
    x: lm.x,
    y: lm.y,
    z: lm.z ?? 0,
  }));

  const matrixData = result.facialTransformationMatrixes?.[0]?.data;
  const rotation = matrixData
    ? matrixToRotation(Array.from(matrixData))
    : undefined;

  return { landmarks, faceCount, rotation };
}

/** Reseta o singleton — uso exclusivo em testes. */
export function _resetInstance(): void {
  _instance = null;
  _initPromise = null;
}

'use client';

// TODO (Bloco 5): implementar useAcneDetector completo

import type { Detection } from '@/app/_shared/ml/yolo';

export type DetectorStatus = 'idle' | 'loading_model' | 'ready' | 'detecting' | 'error';

export interface UseAcneDetectorResult {
  status: DetectorStatus;
  downloadProgress: number;
  backend: 'webgpu' | 'wasm' | null;
  error: string | null;
  detect: (canvas: HTMLCanvasElement) => Promise<Detection[]>;
}

export function useAcneDetector(): UseAcneDetectorResult {
  // TODO (Bloco 5): useModelDownload + ort.InferenceSession + detect() + stub mode (USE_STUB_DETECTOR)
  throw new Error('useAcneDetector: não implementado ainda (Bloco 5)');
}

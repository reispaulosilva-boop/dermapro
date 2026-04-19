'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { preprocessImageForYOLO, postprocessYoloOutput } from '@/app/_shared/ml/yolo';
import type { Detection } from '@/app/_shared/ml/yolo';
import { getModelConfig, USE_STUB_DETECTOR } from '@/app/_shared/config/models';
import {
  MODEL_ID,
  MODEL_INPUT_SIZE,
  DETECTION_CONF_THRESHOLD,
  NMS_IOU_THRESHOLD,
} from '../_lib/constants';

export type DetectorStatus = 'idle' | 'loading' | 'ready' | 'inferring' | 'error';

export interface UseAcneDetectorResult {
  status: DetectorStatus;
  error: string | null;
  detect: (canvas: HTMLCanvasElement) => Promise<Detection[]>;
}

// ─── STUB ─────────────────────────────────────────────────────────────────────

function makeStubDetections(canvas: HTMLCanvasElement): Detection[] {
  const w = canvas.width;
  const h = canvas.height;
  const count = 4 + Math.floor(Math.random() * 8);
  const dets: Detection[] = [];
  for (let i = 0; i < count; i++) {
    const cx = 0.2 * w + Math.random() * 0.6 * w;
    const cy = 0.15 * h + Math.random() * 0.65 * h;
    const size = 0.02 * Math.min(w, h) + Math.random() * 0.03 * Math.min(w, h);
    dets.push({
      bbox: [cx - size, cy - size, cx + size, cy + size],
      score: 0.50 + Math.random() * 0.45,
      classId: 0,
      className: 'lesao_acneiforme',
    });
  }
  return dets;
}

const INFERENCE_TIMEOUT_MS = 30_000;

export function useAcneDetector(modelBuffer: ArrayBuffer | null): UseAcneDetectorResult {
  const [status, setStatus] = useState<DetectorStatus>(USE_STUB_DETECTOR ? 'ready' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<import('onnxruntime-web').InferenceSession | null>(null);
  const config = getModelConfig(MODEL_ID);

  // No stub mode: skip ONNX entirely — detector is permanently ready
  if (USE_STUB_DETECTOR) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const stubDetect = useCallback(async (canvas: HTMLCanvasElement): Promise<Detection[]> => {
      return new Promise(resolve =>
        setTimeout(() => resolve(makeStubDetections(canvas)), 600),
      );
    }, []);
    return { status: 'ready', error: null, detect: stubDetect };
  }

  useEffect(() => {
    if (!modelBuffer) return;

    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const ort = await import('onnxruntime-web');
        // WASM files servidos via CDN; para uso offline copiar para public/
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
        // WebGPU removido após trava silenciosa em Apple M1 com YOLOv8m (2026-04-19).
        // WASM é determinístico e tempo de inferência (~2-5s) é aceitável para análise
        // de fotos em consultório. Reintroduzir WebGPU apenas com timeout de fallback
        // e feature-flag explícito.
        const session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ['wasm'],
        });
        if (!cancelled) {
          sessionRef.current = session;
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar modelo ONNX.');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      sessionRef.current?.release().catch(() => {});
      sessionRef.current = null;
    };
  }, [modelBuffer]);

  const detect = useCallback(async (canvas: HTMLCanvasElement): Promise<Detection[]> => {
    const session = sessionRef.current;
    if (!session) return [];

    setStatus('inferring');
    setError(null);

    try {
      const ort = await import('onnxruntime-web');
      const { tensor, dims, scale, padX, padY } =
        preprocessImageForYOLO(canvas, MODEL_INPUT_SIZE);

      // Nome do input: YOLOv8 exportado pela Ultralytics usa 'images'
      const inputName = session.inputNames[0] ?? 'images';
      const feeds: Record<string, import('onnxruntime-web').Tensor> = {
        [inputName]: new ort.Tensor('float32', tensor, dims),
      };

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('A análise demorou mais do que o esperado. Recarregue a página e tente novamente.')),
          INFERENCE_TIMEOUT_MS,
        ),
      );
      const results = await Promise.race([session.run(feeds), timeoutPromise]);

      // Primeiro output: shape [1, 5, 8400] para modelo single-class
      const outputKey = session.outputNames[0] ?? Object.keys(results)[0]!;
      const outputTensor = results[outputKey]!;

      const detections = postprocessYoloOutput(
        outputTensor.data as Float32Array,
        outputTensor.dims as number[],
        scale, padX, padY,
        DETECTION_CONF_THRESHOLD,
        NMS_IOU_THRESHOLD,
        config.classNames,
      );

      setStatus('ready');
      return detections;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro durante inferência.';
      setError(msg);
      setStatus('error');
      return [];
    }
  }, [config.classNames]);

  return { status, error, detect };
}

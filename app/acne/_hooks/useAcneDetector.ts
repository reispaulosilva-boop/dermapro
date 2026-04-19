'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { preprocessImageForYOLO, postprocessYoloOutput } from '@/app/_shared/ml/yolo';
import type { Detection } from '@/app/_shared/ml/yolo';
import { getModelConfig } from '@/app/_shared/config/models';
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

export function useAcneDetector(modelBuffer: ArrayBuffer | null): UseAcneDetectorResult {
  const [status, setStatus] = useState<DetectorStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<import('onnxruntime-web').InferenceSession | null>(null);
  const config = getModelConfig(MODEL_ID);

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
        const session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ['webgpu', 'wasm'],
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

      const results = await session.run(feeds);

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

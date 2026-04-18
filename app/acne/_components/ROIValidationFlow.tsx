'use client';

import { useState, useCallback } from 'react';
import { UploadCard } from '@/app/_shared/components/UploadCard';
import { UncertaintyBanner } from '@/app/_shared/components/UncertaintyBanner';
import { detect } from '@/app/_shared/ml/faceLandmarker';
import type { LandmarkPoint } from '@/app/_shared/ml/faceLandmarker';
import {
  extractForeheadROI,
  extractLeftCheekROI,
  extractRightCheekROI,
  extractChinROI,
  extractNoseROI,
} from '@/app/_shared/ml/roiExtractor';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import { runQualityChecks } from '@/app/_shared/qa/imageQuality';
import { MIN_UPLOAD_WIDTH, MIN_UPLOAD_HEIGHT } from '../_lib/constants';
import ROIValidationCanvas from './ROIValidationCanvas';
import ROIValidationControls from './ROIValidationControls';

type FlowStep = 'upload' | 'processing' | 'review' | 'error';

interface FlowState {
  step:        FlowStep;
  imageBitmap: ImageBitmap | null;
  landmarks:   LandmarkPoint[];
  rois:        SkinROI[];
  errors:      string[];
  warnings:    string[];
}

const UPLOAD_INSTRUCTIONS = [
  'Foto frontal, olhando diretamente para a câmera.',
  'Retire óculos e afaste o cabelo do rosto.',
  'Iluminação uniforme, sem sombras fortes.',
  'Uma única pessoa por foto.',
];

function bitmapToCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width  = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
  return canvas;
}

export interface ROIValidationFlowProps {
  onValidated: (correct: boolean) => void;
}

export default function ROIValidationFlow({ onValidated }: ROIValidationFlowProps) {
  const [state, setState] = useState<FlowState>({
    step: 'upload', imageBitmap: null, landmarks: [], rois: [], errors: [], warnings: [],
  });
  const [showLandmarks, setShowLandmarks] = useState(false);

  const handleFileSelected = useCallback(async (_file: File, bitmap: ImageBitmap) => {
    setState(s => ({ ...s, step: 'processing', imageBitmap: bitmap, errors: [], warnings: [] }));

    // 1. Quality check
    const qaCanvas = bitmapToCanvas(bitmap);
    const qa = runQualityChecks(qaCanvas, {
      minWidth:     MIN_UPLOAD_WIDTH,
      minHeight:    MIN_UPLOAD_HEIGHT,
      maxBlurScore: 80,
    });

    if (!qa.passed) {
      setState(s => ({ ...s, step: 'error', errors: qa.errors, warnings: qa.warnings }));
      return;
    }

    // 2. Face detection
    let landmarks: LandmarkPoint[];
    try {
      const result = await detect(bitmap);
      landmarks = result.landmarks;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido ao detectar rosto.';
      const isMultipleFaces = msg.includes('faces detectadas');
      setState(s => ({
        ...s,
        step: 'error',
        errors: [isMultipleFaces
          ? 'Mais de um rosto detectado. Envie uma foto com apenas uma pessoa.'
          : 'Não detectamos um rosto. Tente outra foto frontal com boa iluminação.'],
        warnings: qa.warnings,
      }));
      return;
    }

    // 3. Extrai ROIs com dimensões originais da foto
    const w = bitmap.width;
    const h = bitmap.height;
    const rois: SkinROI[] = [
      extractForeheadROI(landmarks, w, h),
      extractLeftCheekROI(landmarks, w, h),
      extractRightCheekROI(landmarks, w, h),
      extractChinROI(landmarks, w, h),
      extractNoseROI(landmarks, w, h),
    ];

    setState(s => ({
      ...s,
      step: 'review',
      landmarks,
      rois,
      warnings: qa.warnings,
    }));
  }, []);

  const handleTryAgain = () => {
    setState({ step: 'upload', imageBitmap: null, landmarks: [], rois: [], errors: [], warnings: [] });
    setShowLandmarks(false);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  if (state.step === 'upload') {
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-strong)' }}>
            Validação de regiões faciais
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Antes de começar a análise de acne, precisamos confirmar que o sistema está
            detectando as regiões corretas do seu rosto. Envie uma foto frontal para verificar.
          </p>
        </div>
        <UploadCard
          onFileSelected={handleFileSelected}
          moduleType="acne"
          minWidth={MIN_UPLOAD_WIDTH}
          minHeight={MIN_UPLOAD_HEIGHT}
          instructions={UPLOAD_INSTRUCTIONS}
        />
      </div>
    );
  }

  if (state.step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--mod-acne)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Detectando pontos faciais…
        </p>
      </div>
    );
  }

  if (state.step === 'error') {
    return (
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <UncertaintyBanner warnings={[...state.errors, ...state.warnings]} severity="warning" />
        <button
          type="button"
          onClick={handleTryAgain}
          className="text-sm underline underline-offset-4 self-start"
          style={{ color: 'var(--mod-acne)' }}
        >
          Tentar outra foto
        </button>
      </div>
    );
  }

  // step === 'review'
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-strong)' }}>
          Regiões detectadas — estão corretas?
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Verifique se cada área colorida cobre a região anatômica correta.
          Testa, bochechas, mento e nariz devem estar bem delimitados.
        </p>
      </div>

      {state.warnings.length > 0 && (
        <UncertaintyBanner warnings={state.warnings} severity="info" />
      )}

      {state.imageBitmap && (
        <ROIValidationCanvas
          imageBitmap={state.imageBitmap}
          landmarks={state.landmarks}
          rois={state.rois}
          showLandmarks={showLandmarks}
        />
      )}

      <ROIValidationControls
        showLandmarks={showLandmarks}
        onToggleLandmarks={() => setShowLandmarks(v => !v)}
        onValidated={onValidated}
      />

      <button
        type="button"
        onClick={handleTryAgain}
        className="text-xs underline underline-offset-4 self-start"
        style={{ color: 'var(--text-faint)' }}
      >
        Usar outra foto para validação
      </button>
    </div>
  );
}

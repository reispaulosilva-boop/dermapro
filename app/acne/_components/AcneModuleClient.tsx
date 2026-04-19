'use client';

import { useEffect, useRef, useState } from 'react';
import { DisclaimerModal } from '@/app/_shared/components/DisclaimerModal';
import { UploadCard } from '@/app/_shared/components/UploadCard';
import { detect } from '@/app/_shared/ml/faceLandmarker';
import {
  extractForeheadROI,
  extractLeftCheekROI,
  extractRightCheekROI,
  extractChinROI,
  extractNoseROI,
} from '@/app/_shared/ml/roiExtractor';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';
import { countByRegion } from '../_lib/countByRegion';
import type { RegionCount } from '../_lib/countByRegion';
import { hayashiSeverity } from '../_lib/hayashiSeverity';
import type { SeverityResult } from '../_lib/hayashiSeverity';
import { getModelConfig, USE_STUB_DETECTOR } from '@/app/_shared/config/models';
import { exportAcnePdf } from '../_lib/acnePdfExport';
import {
  MODEL_ID,
  MIN_UPLOAD_WIDTH,
  MIN_UPLOAD_HEIGHT,
  INSTRUCTIONS_UPLOAD,
} from '../_lib/constants';
import { useModelDownload } from '../_hooks/useModelDownload';
import { useAcneDetector } from '../_hooks/useAcneDetector';
import {
  runQualityChecks,
  QA_BLUR_ERROR,
  QA_BLUR_WARN,
  QA_BRIGHT_MIN,
  QA_BRIGHT_MAX,
  QA_SIDE_BIAS_MAX,
} from '@/app/_shared/qa/imageQuality';
import ROIValidationFlow from './ROIValidationFlow';
import AcneResultPanel from './AcneResultPanel';
import type { AcnePreviewCanvasHandle } from './AcnePreviewCanvas';
import { PresentationModeToggle } from '@/app/_shared/components/PresentationModeToggle';

type Step = 'disclaimer' | 'roi_validation' | 'upload' | 'analyzing' | 'results';

const STORAGE_KEY_VALIDATED = 'dermapro-roi-validated';

interface AnalysisResult {
  detections: Detection[];
  rois: SkinROI[];
  regionCounts: RegionCount[];
  severity: SeverityResult;
}

function AnalyzingView({
  modelStatus,
  modelProgress,
  detectorStatus,
}: {
  modelStatus: string;
  modelProgress: number;
  detectorStatus: string;
}) {
  let message: string;
  if (modelStatus === 'idle' || modelStatus === 'downloading') {
    message = modelStatus === 'downloading'
      ? `Baixando modelo neural: ${modelProgress}%`
      : 'Aguardando download do modelo...';
  } else if (modelStatus === 'ready' && (detectorStatus === 'idle' || detectorStatus === 'loading')) {
    message = 'Carregando modelo neural...';
  } else if (detectorStatus === 'inferring') {
    message = 'Executando inferência...';
  } else {
    message = 'Detectando lesões...';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--s-4)',
        color: 'var(--text-muted)',
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--brand-primary-400)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spin"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <p aria-hidden="true" style={{ fontSize: 15, textAlign: 'center', maxWidth: 300 }}>
        {message}
      </p>
    </div>
  );
}

export default function AcneModuleClient() {
  const [step, setStep] = useState<Step>('disclaimer');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [uploadedBitmap, setUploadedBitmap] = useState<ImageBitmap | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [roisValidated, setRoisValidated] = useState(false);
  const [qaWarnings, setQaWarnings] = useState<string[]>([]);
  const canvasRef = useRef<AcnePreviewCanvasHandle | null>(null);

  const config = getModelConfig(MODEL_ID);
  const modelDownload = useModelDownload(config);
  const acneDetector = useAcneDetector(modelDownload.modelArrayBuffer);

  useEffect(() => {
    setDisclaimerOpen(true);
  }, []);

  const handleDisclaimerAccept = () => {
    setDisclaimerOpen(false);
    if (!USE_STUB_DETECTOR) void modelDownload.startDownload();
    const alreadyValidated = localStorage.getItem(STORAGE_KEY_VALIDATED) === 'true';
    setRoisValidated(alreadyValidated);
    setStep(alreadyValidated ? 'upload' : 'roi_validation');
  };

  const handleROIValidated = (_correct: boolean, warnings: string[]) => {
    setRoisValidated(true);
    setQaWarnings(warnings);
    setStep('upload');
  };

  const handleImageUpload = (_file: File, bitmap: ImageBitmap) => {
    // Validação de qualidade (QA)
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setAnalysisError('Erro ao preparar validação de imagem.');
      return;
    }
    
    ctx.drawImage(bitmap, 0, 0);
    
    const qaResult = runQualityChecks(canvas, {
      minWidth: MIN_UPLOAD_WIDTH,
      minHeight: MIN_UPLOAD_HEIGHT,
      blurErrorThreshold: QA_BLUR_ERROR,
      blurWarnThreshold: QA_BLUR_WARN,
      minBrightness: QA_BRIGHT_MIN,
      maxBrightness: QA_BRIGHT_MAX,
      maxSideBias: QA_SIDE_BIAS_MAX,
    });

    if (!qaResult.passed) {
      setAnalysisError(qaResult.errors[0] || 'A imagem não atende aos critérios de qualidade.');
      return;
    }

    setQaWarnings(qaResult.warnings);
    setUploadedBitmap(bitmap);
    setAnalysisError(null);
    setStep('analyzing');
  };

  const handleReset = () => {
    uploadedBitmap?.close();
    setUploadedBitmap(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setStep('upload');
  };

  const handleExportPdf = () => {
    if (!analysisResult) return;
    void exportAcnePdf({
      annotatedCanvas: canvasRef.current?.getAnnotatedCanvas() ?? null,
      severity: analysisResult.severity,
      regionCounts: analysisResult.regionCounts,
      qaWarnings,
    });
  };

  // Abort analysis if model download or detector hits an error
  useEffect(() => {
    if (step !== 'analyzing') return;
    if ((!USE_STUB_DETECTOR && modelDownload.status === 'error') || acneDetector.status === 'error') {
      const msg =
        modelDownload.error ??
        acneDetector.error ??
        'Erro ao carregar o modelo de detecção.';
      setAnalysisError(msg);
      setStep('upload');
    }
  }, [step, modelDownload.status, modelDownload.error, acneDetector.status, acneDetector.error]);

  // Trigger analysis when model + detector are ready and we're in analyzing step
  useEffect(() => {
    if (step !== 'analyzing' || !uploadedBitmap) return;
    if (!USE_STUB_DETECTOR && modelDownload.status !== 'ready') return;
    if (acneDetector.status !== 'ready') return;

    let cancelled = false;

    void (async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = uploadedBitmap.width;
        canvas.height = uploadedBitmap.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(uploadedBitmap, 0, 0);

        const { landmarks } = await detect(canvas);
        if (cancelled) return;

        const w = uploadedBitmap.width;
        const h = uploadedBitmap.height;
        const rois: SkinROI[] = [
          extractForeheadROI(landmarks, w, h),
          extractLeftCheekROI(landmarks, w, h),
          extractRightCheekROI(landmarks, w, h),
          extractChinROI(landmarks, w, h),
          extractNoseROI(landmarks, w, h),
        ];

        const detections = await acneDetector.detect(canvas);
        if (cancelled) return;

        const regionCounts = countByRegion(detections, rois);
        const severity = hayashiSeverity(detections.length);

        setAnalysisResult({ detections, rois, regionCounts, severity });
        setStep('results');
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro durante análise.';
          setAnalysisError(msg);
          setStep('upload');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [step, uploadedBitmap, modelDownload.status, acneDetector.status, acneDetector.detect]);

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <DisclaimerModal
        moduleType="acne"
        open={disclaimerOpen}
        onAccept={handleDisclaimerAccept}
      />

      {step === 'roi_validation' && (
        <ROIValidationFlow onValidated={handleROIValidated} />
      )}

      {step === 'upload' && (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          <div>
            <h1
              className="text-2xl font-medium"
              style={{ color: 'var(--text-strong)' }}
            >
              Análise de Acne
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Envie uma foto frontal para detectar e classificar lesões acneiformes.
            </p>
          </div>

          {analysisError && (
            <div
              style={{
                padding: 'var(--s-3) var(--s-4)',
                borderRadius: 'var(--r-md)',
                background: 'color-mix(in oklab, var(--sem-alert) 10%, var(--bg-surface))',
                border: '1px solid var(--sem-alert)',
                fontSize: 13,
                color: 'var(--sem-alert)',
              }}
            >
              {analysisError}
            </div>
          )}

          {modelDownload.status === 'downloading' && (
            <div
              role="status"
              aria-live="polite"
              style={{
                padding: 'var(--s-2) var(--s-4)',
                borderRadius: 'var(--r-md)',
                background: 'var(--ink-2)',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              Pré-carregando modelo: {modelDownload.progress}%
            </div>
          )}

          {modelDownload.status === 'error' && !analysisError && (
            <div
              role="alert"
              style={{
                padding: 'var(--s-3) var(--s-4)',
                borderRadius: 'var(--r-md)',
                background: 'color-mix(in oklab, var(--sem-alert) 10%, var(--bg-surface))',
                border: '1px solid var(--sem-alert)',
                fontSize: 13,
                color: 'var(--sem-alert)',
              }}
            >
              {modelDownload.error ?? 'Erro ao carregar o modelo. Verifique sua conexão e recarregue a página.'}
            </div>
          )}

          <UploadCard
            onFileSelected={handleImageUpload}
            minWidth={MIN_UPLOAD_WIDTH}
            minHeight={MIN_UPLOAD_HEIGHT}
            instructions={INSTRUCTIONS_UPLOAD}
          />
        </div>
      )}

      {step === 'analyzing' && (
        <AnalyzingView
          modelStatus={modelDownload.status}
          modelProgress={modelDownload.progress}
          detectorStatus={acneDetector.status}
        />
      )}

      {step === 'results' && analysisResult && uploadedBitmap && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1
              className="text-xl font-medium"
              style={{ color: 'var(--text-strong)' }}
            >
              Resultado da Análise
            </h1>
            <PresentationModeToggle />
          </div>
          <AcneResultPanel
            detections={analysisResult.detections}
            rois={analysisResult.rois}
            imageBitmap={uploadedBitmap}
            severity={analysisResult.severity}
            regionCounts={analysisResult.regionCounts}
            onExportPdf={handleExportPdf}
            onReset={handleReset}
            canvasRef={canvasRef}
            roisValidated={roisValidated}
          />
        </div>
      )}
    </main>
  );
}

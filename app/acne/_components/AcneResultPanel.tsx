'use client';

// TODO (Bloco 7): implementar AcneResultPanel completo

import type { RefObject } from 'react';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';
import type { SeverityResult } from '../_lib/hayashiSeverity';
import type { RegionCount } from '../_lib/countByRegion';
import type { AcnePreviewCanvasHandle } from './AcnePreviewCanvas';

export interface AcneResultPanelProps {
  detections: Detection[];
  rois: SkinROI[];
  imageBitmap: ImageBitmap;
  severity: SeverityResult;
  regionCounts: RegionCount[];
  onExportPdf: () => void;
  onReset: () => void;
  canvasRef: RefObject<AcnePreviewCanvasHandle | null>;
  roisValidated: boolean;
}

export default function AcneResultPanel(_props: AcneResultPanelProps) {
  // TODO (Bloco 7): canvas 60% + painel 40%, SeverityBadge, RegionChart, DownloadPhotoButton, Exportar PDF
  return <div>Resultado da análise (em construção)</div>;
}

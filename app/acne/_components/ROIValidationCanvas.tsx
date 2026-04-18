'use client';

// TODO (Bloco 4): implementar ROIValidationCanvas completo

import type { FacialPoint, SkinROI } from '@/app/_shared/ml/roiExtractor';

export interface ROIValidationCanvasProps {
  imageBitmap: ImageBitmap;
  landmarks: FacialPoint[];
  rois: SkinROI[];
  showLandmarks: boolean;
  onROISelection?: (roiName: string) => void;
}

export default function ROIValidationCanvas(_props: ROIValidationCanvasProps) {
  // TODO (Bloco 4): canvas com devicePixelRatio, polígonos coloridos por região, 478 landmarks toggle
  return <canvas aria-label="Validação das regiões faciais (em construção)" />;
}

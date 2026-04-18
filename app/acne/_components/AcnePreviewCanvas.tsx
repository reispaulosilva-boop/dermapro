'use client';

// TODO (Bloco 7): implementar AcnePreviewCanvas completo

import { forwardRef } from 'react';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';

export interface AcnePreviewCanvasProps {
  imageBitmap: ImageBitmap;
  detections: Detection[];
  rois?: SkinROI[];
  showLabels: boolean;
}

export interface AcnePreviewCanvasHandle {
  getAnnotatedCanvas(): HTMLCanvasElement;
}

// TODO (Bloco 7): canvas com bboxes, devicePixelRatio, modo apresentação, ref exposta via useImperativeHandle
const AcnePreviewCanvas = forwardRef<AcnePreviewCanvasHandle, AcnePreviewCanvasProps>(
  (_props, _ref) => {
    return <canvas aria-label="Análise de acne (em construção)" />;
  }
);
AcnePreviewCanvas.displayName = 'AcnePreviewCanvas';

export default AcnePreviewCanvas;

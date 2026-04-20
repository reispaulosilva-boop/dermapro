'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';
import { getAcneOverlayStyle, drawBboxesOnCanvas } from '../_lib/acneOverlay';
import { usePresentationMode } from '@/app/_shared/components/PresentationModeProvider';

export interface AcnePreviewCanvasProps {
  imageBitmap: ImageBitmap;
  detections: Detection[];
  rois?: SkinROI[];
  showLabels: boolean;
}

export interface AcnePreviewCanvasHandle {
  getAnnotatedCanvas(): HTMLCanvasElement;
}

const AcnePreviewCanvas = forwardRef<AcnePreviewCanvasHandle, AcnePreviewCanvasProps>(
  ({ imageBitmap, detections, showLabels }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { presentationMode } = usePresentationMode();

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const logW = imageBitmap.width;
      const logH = imageBitmap.height;

      canvas.width = logW * dpr;
      canvas.height = logH * dpr;
      // Definir só a largura; o height: auto do CSS usa os atributos width/height
      // para preservar aspect ratio quando maxWidth: 100% reduz o canvas.
      canvas.style.width = `${logW}px`;
      canvas.style.height = `${logH}px`;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.drawImage(imageBitmap, 0, 0, logW, logH);
      drawBboxesOnCanvas(ctx, detections, getAcneOverlayStyle(presentationMode), showLabels);
      ctx.restore();
    }, [imageBitmap, detections, showLabels, presentationMode]);

    useImperativeHandle(ref, () => ({
      getAnnotatedCanvas: () => canvasRef.current!,
    }));

    return (
      <canvas
        ref={canvasRef}
        aria-label="Análise de acne com marcações de lesões"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    );
  },
);
AcnePreviewCanvas.displayName = 'AcnePreviewCanvas';

export default AcnePreviewCanvas;

'use client';

import { useEffect, useRef } from 'react';
import { usePresentationMode } from '@/app/_shared/components/PresentationModeProvider';
import type { LandmarkPoint } from '@/app/_shared/ml/faceLandmarker';
import { isPointInROI } from '@/app/_shared/ml/roiExtractor';
import type { FacialPoint, SkinROI } from '@/app/_shared/ml/roiExtractor';

// Usa as cores base dos módulos do design system (tokens.ts) como 5 cores distintas para ROIs
const ROI_COLORS: Record<string, string> = {
  forehead:   '#c97d6a',  // mod-acne — terracota
  leftCheek:  '#b78a5a',  // mod-melasma — âmbar-caramelo
  rightCheek: '#6e9a8e',  // mod-texture — verde-azulado
  chin:       '#8a7ba8',  // mod-signs — lilás fumê
  nose:       '#a87780',  // mod-rosacea — rosê vinho
};

const ROI_LABELS_PT: Record<string, string> = {
  forehead:   'Testa',
  leftCheek:  'Bochecha E',
  rightCheek: 'Bochecha D',
  chin:       'Mento',
  nose:       'Nariz',
};

export interface ROIValidationCanvasProps {
  imageBitmap: ImageBitmap;
  landmarks: LandmarkPoint[];
  rois: SkinROI[];
  showLandmarks: boolean;
  onROISelection?: (roiName: string) => void;
}

function polygonCentroid(polygon: FacialPoint[]): FacialPoint {
  const cx = polygon.reduce((s, p) => s + p.x, 0) / polygon.length;
  const cy = polygon.reduce((s, p) => s + p.y, 0) / polygon.length;
  return { x: cx, y: cy };
}

function drawPolygonWithHoles(
  ctx: CanvasRenderingContext2D,
  polygon: FacialPoint[],
  holes: FacialPoint[][] | undefined,
  sx: number,
  sy: number,
) {
  ctx.beginPath();
  if (polygon.length === 0) return;
  ctx.moveTo(polygon[0]!.x * sx, polygon[0]!.y * sy);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i]!.x * sx, polygon[i]!.y * sy);
  }
  ctx.closePath();
  if (holes) {
    for (const hole of holes) {
      if (hole.length === 0) continue;
      ctx.moveTo(hole[0]!.x * sx, hole[0]!.y * sy);
      for (let i = 1; i < hole.length; i++) {
        ctx.lineTo(hole[i]!.x * sx, hole[i]!.y * sy);
      }
      ctx.closePath();
    }
  }
}

export default function ROIValidationCanvas({
  imageBitmap,
  landmarks,
  rois,
  showLandmarks,
  onROISelection,
}: ROIValidationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { presentationMode } = usePresentationMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const imgW = imageBitmap.width;
    const imgH = imageBitmap.height;

    // Preenche largura do container mantendo aspect ratio
    const logW = container.offsetWidth || imgW;
    const logH = Math.round(logW * (imgH / imgW));

    // MASTER §4.8 — devicePixelRatio
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = logW * dpr;
    canvas.height = logH * dpr;
    canvas.style.width  = `${logW}px`;
    canvas.style.height = `${logH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Foto de fundo
    ctx.drawImage(imageBitmap, 0, 0, logW, logH);

    // Fatores de escala: coords de ROI estão em [0, imgW] × [0, imgH]
    const sx = logW / imgW;
    const sy = logH / imgH;

    // Polígonos de ROI
    for (const roi of rois) {
      const hex = ROI_COLORS[roi.name] ?? '#ffffff';
      drawPolygonWithHoles(ctx, roi.polygon, roi.holes, sx, sy);
      ctx.fillStyle = hex + '4d';   // 30% alpha
      ctx.fill('evenodd');
      ctx.strokeStyle = hex + 'cc'; // 80% alpha
      ctx.lineWidth = presentationMode ? 3 : 2;
      ctx.stroke();

      // Label no centróide
      const c = polygonCentroid(roi.polygon);
      const fontSize = presentationMode ? 16 : 13;
      ctx.font = `600 ${fontSize}px var(--font-sans, system-ui)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ROI_LABELS_PT[roi.name] ?? roi.name, c.x * sx, c.y * sy);
      ctx.shadowBlur = 0;
    }

    // 478 landmarks como dots semi-transparentes
    if (showLandmarks) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (const lm of landmarks) {
        // Landmarks são normalizados [0,1] — usar logW/logH diretamente
        ctx.beginPath();
        ctx.arc(lm.x * logW, lm.y * logH, presentationMode ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [imageBitmap, landmarks, rois, showLandmarks, presentationMode]);

  // Click: identifica ROI clicada
  useEffect(() => {
    if (!onROISelection) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgW = imageBitmap.width;
    const imgH = imageBitmap.height;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top)  / rect.height;
      const pt: FacialPoint = { x: normX * imgW, y: normY * imgH };
      for (const roi of rois) {
        if (isPointInROI(pt, roi)) {
          onROISelection(roi.name);
          return;
        }
      }
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [imageBitmap, rois, onROISelection]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        style={{ display: 'block', maxWidth: '100%' }}
        aria-label="Validação das regiões faciais detectadas pelo sistema"
      />
    </div>
  );
}

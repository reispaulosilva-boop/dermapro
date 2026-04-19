'use client';

import type { Detection } from '@/app/_shared/ml/yolo';

export interface OverlayStyle {
  strokeColor: string;
  fillColor: string;
  lineWidth: number;
  labelFontSize: number;
}

export function getAcneOverlayStyle(presentationMode: boolean): OverlayStyle {
  return {
    strokeColor:   'rgba(226, 138, 123, 0.85)',
    fillColor:     presentationMode ? 'rgba(226, 138, 123, 0.20)' : 'rgba(226, 138, 123, 0.15)',
    lineWidth:     presentationMode ? 3 : 2,
    labelFontSize: presentationMode ? 13 : 11,
  };
}

export function drawBboxesOnCanvas(
  ctx: CanvasRenderingContext2D,
  detections: Detection[],
  style: OverlayStyle,
  showLabels: boolean,
): void {
  for (const det of detections) {
    const [x1, y1, x2, y2] = det.bbox;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    // Círculo ligeiramente menor que a bbox (0.7) — mais anatômico e menos agressivo visualmente
    const radius = Math.max(x2 - x1, y2 - y1) / 2 * 0.7;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = style.fillColor;
    ctx.fill();
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.lineWidth;
    ctx.stroke();

    // "?" discreto apenas para detecções de baixa confiança — evita poluição visual
    if (showLabels && det.score < 0.30) {
      ctx.font = `${style.labelFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = style.strokeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, cy);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
  }
}

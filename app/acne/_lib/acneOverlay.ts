'use client';

import type { Detection } from '@/app/_shared/ml/yolo';

export interface OverlayStyle {
  strokeColor: string;
  fillColor: string;
  lineWidth: number;
  cornerRadius: number;
  labelFontSize: number;
}

export function getAcneOverlayStyle(presentationMode: boolean): OverlayStyle {
  return {
    strokeColor:   'rgba(226, 138, 123, 0.85)',
    fillColor:     'rgba(226, 138, 123, 0.08)',
    lineWidth:     presentationMode ? 3 : 2,
    cornerRadius:  4,
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
    const w = x2 - x1;
    const h = y2 - y1;
    const r = Math.min(style.cornerRadius, w / 2, h / 2);

    ctx.beginPath();
    ctx.moveTo(x1 + r, y1);
    ctx.lineTo(x2 - r, y1);
    ctx.arcTo(x2, y1, x2, y1 + r, r);
    ctx.lineTo(x2, y2 - r);
    ctx.arcTo(x2, y2, x2 - r, y2, r);
    ctx.lineTo(x1 + r, y2);
    ctx.arcTo(x1, y2, x1, y2 - r, r);
    ctx.lineTo(x1, y1 + r);
    ctx.arcTo(x1, y1, x1 + r, y1, r);
    ctx.closePath();

    ctx.fillStyle = style.fillColor;
    ctx.fill();
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.lineWidth;
    ctx.stroke();

    if (showLabels) {
      ctx.font = `${style.labelFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = style.strokeColor;
      ctx.fillText(`${Math.round(det.score * 100)}%`, x1 + 3, y1 - 3);
    }
  }
}

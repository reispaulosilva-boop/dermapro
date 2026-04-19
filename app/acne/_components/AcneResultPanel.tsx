'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';
import type { SeverityResult } from '../_lib/hayashiSeverity';
import type { RegionCount } from '../_lib/countByRegion';
import type { AcnePreviewCanvasHandle } from './AcnePreviewCanvas';
import AcnePreviewCanvas from './AcnePreviewCanvas';
import SeverityBadge from './SeverityBadge';
import RegionChart from './RegionChart';
import { DownloadPhotoButton } from '@/app/_shared/components/DownloadPhotoButton';
import { Button } from '@/components/ui/button';
import { MODULE_ID } from '../_lib/constants';

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

export default function AcneResultPanel({
  detections,
  rois: _rois,
  imageBitmap,
  severity,
  regionCounts,
  onExportPdf,
  onReset,
  canvasRef,
  roisValidated: _roisValidated,
}: AcneResultPanelProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(imageBitmap, 0, 0);
    originalCanvasRef.current = canvas;
  }, [imageBitmap]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-6)',
          alignItems: 'flex-start',
        }}
        className="lg:flex-row"
      >
        {/* Canvas — 60% on desktop */}
        <div
          style={{
            flex: '1 1 60%',
            minWidth: 0,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <AcnePreviewCanvas
            ref={canvasRef}
            imageBitmap={imageBitmap}
            detections={detections}
            showLabels={true}
          />
        </div>

        {/* Stats panel — 40% on desktop */}
        <div
          style={{
            flex: '1 1 40%',
            minWidth: 280,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-4)',
          }}
        >
          <SeverityBadge severity={severity} />

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--s-4)',
            }}
          >
            <RegionChart regionCounts={regionCounts} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
            <DownloadPhotoButton
              originalCanvas={originalCanvasRef.current ?? undefined}
              annotatedCanvas={canvasRef.current?.getAnnotatedCanvas() ?? undefined}
              moduleId={MODULE_ID}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPdf}
              className="gap-2 border-[var(--border-subtle)] bg-transparent text-[var(--text-body)] hover:bg-[var(--ink-3)]"
            >
              Exportar PDF
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            style={{ alignSelf: 'flex-start', color: 'var(--text-muted)' }}
          >
            Nova análise
          </Button>

          <p
            style={{
              fontSize: 11,
              color: 'var(--text-faint)',
              marginTop: 'auto',
              paddingTop: 'var(--s-2)',
            }}
          >
            Resultado de apoio clínico. Não substitui avaliação presencial nem constitui diagnóstico.
          </p>
        </div>
      </div>
    </div>
  );
}

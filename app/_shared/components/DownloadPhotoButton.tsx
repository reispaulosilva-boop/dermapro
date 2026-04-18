'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DownloadPhotoButtonProps {
  originalCanvas?: HTMLCanvasElement | null;
  annotatedCanvas?: HTMLCanvasElement | null;
  moduleId: string;
  filenamePrefix?: string;
}

function buildFilename(prefix: string, moduleId: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${prefix}-${moduleId}-${date}-${time}.png`;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    'image/png',
  );
}

export function DownloadPhotoButton({
  originalCanvas,
  annotatedCanvas,
  moduleId,
  filenamePrefix = 'dermapro',
}: DownloadPhotoButtonProps) {
  const hasAny = Boolean(originalCanvas ?? annotatedCanvas);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasAny}
          className="gap-2 border-[var(--border-subtle)] bg-transparent text-[var(--text-body)] hover:bg-[var(--ink-3)]"
        >
          <Download size={15} />
          Baixar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-body)]"
      >
        <DropdownMenuItem
          disabled={!originalCanvas}
          onSelect={() => {
            if (originalCanvas) {
              downloadCanvas(originalCanvas, buildFilename(`${filenamePrefix}-original`, moduleId));
            }
          }}
        >
          Baixar foto original
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!annotatedCanvas}
          onSelect={() => {
            if (annotatedCanvas) {
              downloadCanvas(annotatedCanvas, buildFilename(`${filenamePrefix}-marcacoes`, moduleId));
            }
          }}
        >
          Baixar foto com marcações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

// TODO (Bloco 3): implementar useModelDownload completo

import type { ModelConfig } from '@/app/_shared/config/models';

export type ModelDownloadStatus = 'idle' | 'downloading' | 'ready' | 'error';

export interface UseModelDownloadResult {
  status: ModelDownloadStatus;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  error: string | null;
  modelArrayBuffer: ArrayBuffer | null;
  startDownload: () => Promise<void>;
  reset: () => void;
}

export function useModelDownload(_config: ModelConfig): UseModelDownloadResult {
  // TODO (Bloco 3): fetch com ReadableStream, progresso chunk-a-chunk, error handling em pt-BR
  throw new Error('useModelDownload: não implementado ainda (Bloco 3)');
}

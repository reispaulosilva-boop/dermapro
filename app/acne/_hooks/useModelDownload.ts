'use client';

// TODO (Bloco 3): implementar useModelDownload completo
// TODO: trocar ModelConfig por import de @/app/_shared/config/models quando criado no Prompt 2.2

export type ModelDownloadStatus = 'idle' | 'downloading' | 'ready' | 'error';

// Placeholder — substituir por import real no Bloco 3
export interface ModelConfig {
  id: string;
  url: string;
  expectedSize: number;
}

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

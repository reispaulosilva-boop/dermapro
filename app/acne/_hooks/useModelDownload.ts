'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
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

// ─── ESTADO / REDUCER ────────────────────────────────────────────────────────

interface State {
  status: ModelDownloadStatus;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  error: string | null;
  modelArrayBuffer: ArrayBuffer | null;
}

type Action =
  | { type: 'START'; totalBytes: number }
  | { type: 'PROGRESS'; bytesDownloaded: number; totalBytes: number }
  | { type: 'READY'; buffer: ArrayBuffer }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

export const INITIAL_STATE: State = {
  status: 'idle',
  progress: 0,
  bytesDownloaded: 0,
  totalBytes: 0,
  error: null,
  modelArrayBuffer: null,
};

export function downloadReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...INITIAL_STATE, status: 'downloading', totalBytes: action.totalBytes };
    case 'PROGRESS': {
      const progress = action.totalBytes > 0
        ? Math.min(99, Math.round((action.bytesDownloaded / action.totalBytes) * 100))
        : 0;
      return { ...state, bytesDownloaded: action.bytesDownloaded, totalBytes: action.totalBytes, progress };
    }
    case 'READY':
      return { ...state, status: 'ready', progress: 100, modelArrayBuffer: action.buffer };
    case 'ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'RESET':
      return INITIAL_STATE;
  }
}

// ─── MENSAGENS DE ERRO em pt-BR ───────────────────────────────────────────────

export function httpErrorMessage(status: number): string {
  if (status === 404) return 'Modelo não encontrado. Tente recarregar a página.';
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';
  return `Erro ao baixar o modelo (HTTP ${status}).`;
}

// ─── CACHE IndexedDB ──────────────────────────────────────────────────────────
// Degradação graciosa: qualquer falha no IndexedDB é silenciada; app funciona sem cache.

const DB_NAME = 'dermapro-models';
const STORE_NAME = 'models';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getFromCache(id: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve((req.result as ArrayBuffer | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveToCache(id: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(buffer, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB indisponível ou quota excedida: opera sem cache
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useModelDownload(config: ModelConfig): UseModelDownloadResult {
  const [state, dispatch] = useReducer(downloadReducer, INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  // Cancela download em andamento ao desmontar o componente
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const startDownload = useCallback(async () => {
    // Evita download duplicado
    if (state.status === 'downloading' || state.status === 'ready') return;

    // Verifica cache IndexedDB antes de baixar
    const cached = await getFromCache(config.id);
    if (cached) {
      dispatch({ type: 'READY', buffer: cached });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: 'START', totalBytes: config.expectedSize });

    try {
      const response = await fetch(config.url, { signal: controller.signal });

      if (!response.ok) {
        dispatch({ type: 'ERROR', error: httpErrorMessage(response.status) });
        return;
      }

      if (!response.body) {
        dispatch({ type: 'ERROR', error: 'Erro de conexão ao baixar o modelo. Verifique sua internet.' });
        return;
      }

      // content-length pode estar ausente em alguns CDNs; usa expectedSize como fallback
      const contentLength = Number(response.headers.get('content-length')) || config.expectedSize;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let bytesDownloaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        bytesDownloaded += value.length;
        dispatch({ type: 'PROGRESS', bytesDownloaded, totalBytes: contentLength });
      }

      // Concatena chunks em ArrayBuffer sem Blob intermediário (mais rápido)
      const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const buffer = merged.buffer;
      await saveToCache(config.id, buffer);
      dispatch({ type: 'READY', buffer });

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        dispatch({ type: 'ERROR', error: 'Download cancelado.' });
        return;
      }
      dispatch({ type: 'ERROR', error: 'Erro de conexão ao baixar o modelo. Verifique sua internet.' });
    }
  }, [config, state.status]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  return {
    status:            state.status,
    progress:          state.progress,
    bytesDownloaded:   state.bytesDownloaded,
    totalBytes:        state.totalBytes,
    error:             state.error,
    modelArrayBuffer:  state.modelArrayBuffer,
    startDownload,
    reset,
  };
}

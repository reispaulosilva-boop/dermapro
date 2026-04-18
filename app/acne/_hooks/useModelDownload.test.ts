/**
 * Testes de useModelDownload.
 *
 * Estratégia:
 * - downloadReducer e httpErrorMessage são funções puras — cobertura completa aqui.
 * - getFromCache / saveToCache dependem de IndexedDB (indisponível em jsdom) — TODO integração.
 * - O hook React completo (renderHook + fetch mock) requer @testing-library/react;
 *   instalação pendente de aprovação. TODO: adicionar quando a dep for aprovada.
 */
import { describe, it, expect } from 'vitest';
import {
  downloadReducer,
  INITIAL_STATE,
  httpErrorMessage,
} from './useModelDownload';

// ─── REDUCER ─────────────────────────────────────────────────────────────────

describe('downloadReducer — estado inicial', () => {
  it('INITIAL_STATE tem status idle e progress 0', () => {
    expect(INITIAL_STATE.status).toBe('idle');
    expect(INITIAL_STATE.progress).toBe(0);
    expect(INITIAL_STATE.bytesDownloaded).toBe(0);
    expect(INITIAL_STATE.error).toBeNull();
    expect(INITIAL_STATE.modelArrayBuffer).toBeNull();
  });
});

describe('downloadReducer — START', () => {
  it('transita para downloading com totalBytes correto', () => {
    const next = downloadReducer(INITIAL_STATE, { type: 'START', totalBytes: 1000 });
    expect(next.status).toBe('downloading');
    expect(next.totalBytes).toBe(1000);
    expect(next.progress).toBe(0);
    expect(next.error).toBeNull();
  });

  it('limpa estado anterior ao reiniciar', () => {
    const withError = downloadReducer(INITIAL_STATE, { type: 'ERROR', error: 'falhou' });
    const restarted = downloadReducer(withError, { type: 'START', totalBytes: 500 });
    expect(restarted.error).toBeNull();
    expect(restarted.status).toBe('downloading');
  });
});

describe('downloadReducer — PROGRESS', () => {
  it('calcula progress corretamente (50%)', () => {
    const downloading = downloadReducer(INITIAL_STATE, { type: 'START', totalBytes: 1000 });
    const next = downloadReducer(downloading, { type: 'PROGRESS', bytesDownloaded: 500, totalBytes: 1000 });
    expect(next.progress).toBe(50);
    expect(next.bytesDownloaded).toBe(500);
  });

  it('progress fica em 0 se totalBytes for 0', () => {
    const downloading = downloadReducer(INITIAL_STATE, { type: 'START', totalBytes: 0 });
    const next = downloadReducer(downloading, { type: 'PROGRESS', bytesDownloaded: 0, totalBytes: 0 });
    expect(next.progress).toBe(0);
  });

  it('progress não ultrapassa 99 antes de READY', () => {
    const downloading = downloadReducer(INITIAL_STATE, { type: 'START', totalBytes: 100 });
    // CDN pode enviar mais bytes que o content-length reportado
    const next = downloadReducer(downloading, { type: 'PROGRESS', bytesDownloaded: 110, totalBytes: 100 });
    expect(next.progress).toBeLessThanOrEqual(99);
  });
});

describe('downloadReducer — READY', () => {
  it('transita para ready com progress 100 e buffer preenchido', () => {
    const downloading = downloadReducer(INITIAL_STATE, { type: 'START', totalBytes: 100 });
    const buffer = new ArrayBuffer(100);
    const next = downloadReducer(downloading, { type: 'READY', buffer });
    expect(next.status).toBe('ready');
    expect(next.progress).toBe(100);
    expect(next.modelArrayBuffer).toBe(buffer);
  });
});

describe('downloadReducer — ERROR', () => {
  it('transita para error com mensagem', () => {
    const next = downloadReducer(INITIAL_STATE, { type: 'ERROR', error: 'Falhou.' });
    expect(next.status).toBe('error');
    expect(next.error).toBe('Falhou.');
  });
});

describe('downloadReducer — RESET', () => {
  it('volta ao estado inicial a partir de ready', () => {
    const buffer = new ArrayBuffer(100);
    const ready = downloadReducer(INITIAL_STATE, { type: 'READY', buffer });
    const reset = downloadReducer(ready, { type: 'RESET' });
    expect(reset).toEqual(INITIAL_STATE);
  });

  it('volta ao estado inicial a partir de error', () => {
    const errored = downloadReducer(INITIAL_STATE, { type: 'ERROR', error: 'x' });
    const reset = downloadReducer(errored, { type: 'RESET' });
    expect(reset).toEqual(INITIAL_STATE);
  });
});

// ─── HTTP ERROR MESSAGES ──────────────────────────────────────────────────────

describe('httpErrorMessage', () => {
  it('404 → mensagem de modelo não encontrado', () => {
    const msg = httpErrorMessage(404);
    expect(msg).toContain('não encontrado');
  });

  it('500 → mensagem de erro no servidor', () => {
    const msg = httpErrorMessage(500);
    expect(msg).toContain('servidor');
  });

  it('503 → também é erro de servidor (5xx)', () => {
    const msg = httpErrorMessage(503);
    expect(msg).toContain('servidor');
  });

  it('403 → mensagem genérica com código HTTP', () => {
    const msg = httpErrorMessage(403);
    expect(msg).toContain('403');
  });

  it('todas as mensagens estão em pt-BR (sem palavras em inglês)', () => {
    const msgs = [httpErrorMessage(404), httpErrorMessage(500), httpErrorMessage(403)];
    for (const m of msgs) {
      expect(m).not.toMatch(/\b(error|server|not found)\b/i);
    }
  });
});

// ─── TODO: TESTES DE INTEGRAÇÃO DO HOOK ──────────────────────────────────────
// Os testes abaixo requerem @testing-library/react (renderHook) + mock de fetch
// com ReadableStream — tecnicamente viável em jsdom mas envolve nova dependência.
// Aguardando aprovação para instalar @testing-library/react.
//
// Coberturas pendentes:
// - startDownload dispara fetch com URL correta
// - startDownload com fetch bem-sucedido → status 'ready' + buffer preenchido
// - startDownload com 404 → status 'error' com mensagem pt-BR correta
// - startDownload com AbortError → "Download cancelado."
// - Progresso atualiza corretamente chunk a chunk
// - Cache hit (IndexedDB mock) → status 'ready' sem chamada a fetch
// - reset() volta ao estado inicial e aborta fetch em andamento
// - Unmount durante download chama abort()

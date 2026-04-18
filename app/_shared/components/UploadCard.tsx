'use client';

import { useCallback, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface UploadCardProps {
  onFileSelected: (file: File, bitmap: ImageBitmap) => void;
  moduleType?: string;
  minWidth?: number;
  minHeight?: number;
  instructions?: string[];
}

type DropState = 'idle' | 'dragging' | 'loading' | 'error';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export function UploadCard({
  onFileSelected,
  minWidth = 640,
  minHeight = 480,
  instructions,
}: UploadCardProps) {
  const [dropState, setDropState] = useState<DropState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultInstructions = [
    'Use luz natural ou lâmpada difusa, sem flash direto.',
    'Olhe frontalmente para a câmera, rosto desocluído.',
    'Rosto sem maquiagem para melhor resultado.',
    `Resolução mínima: ${minWidth}×${minHeight}.`,
  ];
  const hints = instructions ?? defaultInstructions;

  const processFile = useCallback(
    async (file: File) => {
      setErrorMsg('');

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMsg('Formato inválido. Use JPG ou PNG.');
        setDropState('error');
        return;
      }
      if (file.size > MAX_BYTES) {
        setErrorMsg('Arquivo muito grande. Máximo 20 MB.');
        setDropState('error');
        return;
      }

      setDropState('loading');
      try {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width < minWidth || bitmap.height < minHeight) {
          bitmap.close();
          setErrorMsg(`Resolução insuficiente. Mínimo ${minWidth}×${minHeight} px.`);
          setDropState('error');
          return;
        }
        setDropState('idle');
        onFileSelected(file, bitmap);
      } catch {
        setErrorMsg('Não foi possível processar a imagem.');
        setDropState('error');
      }
    },
    [minWidth, minHeight, onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropState('idle');
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const borderColor =
    dropState === 'dragging'
      ? 'var(--brand-primary-400)'
      : dropState === 'error'
        ? 'var(--sem-alert)'
        : 'var(--ink-5)';

  return (
    <Card
      className="overflow-hidden"
      style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Área de upload de imagem"
        style={{
          border: `1.5px dashed ${borderColor}`,
          borderRadius: 'var(--r-lg)',
          background: dropState === 'dragging' ? 'var(--ink-2)' : 'var(--ink-1)',
          padding: 'var(--s-10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--s-3)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease)',
          outline: 'none',
        }}
        onDragOver={(e) => { e.preventDefault(); setDropState('dragging'); }}
        onDragLeave={() => setDropState('idle')}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <div
          style={{
            width: 56, height: 56,
            borderRadius: 'var(--r-full)',
            background: 'color-mix(in oklab, var(--brand-primary-500) 22%, var(--ink-2))',
            color: 'var(--brand-primary-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 'var(--s-2)',
          }}
        >
          {dropState === 'loading' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          )}
        </div>

        <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 6 }}>
          {dropState === 'loading' ? 'Processando...' : 'Capture ou envie uma foto'}
        </div>

        <div style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 440 }}>
          Arraste uma imagem aqui ou clique para escolher. JPG ou PNG, até 20 MB.
        </div>

        {dropState === 'error' && errorMsg && (
          <div style={{ fontSize: 13, color: 'var(--sem-alert)', marginTop: 4 }}>{errorMsg}</div>
        )}
      </div>

      {/* Instructions */}
      {hints.length > 0 && (
        <ul
          style={{
            margin: '12px 0 0',
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {hints.map((hint, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-faint)', marginTop: 7, flexShrink: 0 }} />
              {hint}
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </Card>
  );
}

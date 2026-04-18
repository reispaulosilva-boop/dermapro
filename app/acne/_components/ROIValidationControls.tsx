'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const REGION_OPTIONS = [
  { id: 'forehead',   label: 'Testa' },
  { id: 'leftCheek',  label: 'Bochecha esquerda' },
  { id: 'rightCheek', label: 'Bochecha direita' },
  { id: 'chin',       label: 'Mento' },
  { id: 'nose',       label: 'Nariz' },
];

const STORAGE_KEY_VALIDATED = 'dermapro-roi-validated';
const STORAGE_KEY_FEEDBACK   = 'dermapro-roi-validation-feedback';

export interface ROIValidationControlsProps {
  showLandmarks: boolean;
  onToggleLandmarks: () => void;
  onValidated: (correct: boolean) => void;
}

export default function ROIValidationControls({
  showLandmarks,
  onToggleLandmarks,
  onValidated,
}: ROIValidationControlsProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selected, setSelected]         = useState<Set<string>>(new Set());

  const handleCorrect = () => {
    localStorage.setItem(STORAGE_KEY_VALIDATED, 'true');
    onValidated(true);
  };

  const handleOpenFeedback = () => {
    setSelected(new Set());
    setFeedbackOpen(true);
  };

  const toggleRegion = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmitFeedback = () => {
    const feedback = {
      timestamp: new Date().toISOString(),
      incorrectRegions: Array.from(selected),
    };
    sessionStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(feedback));
    setFeedbackOpen(false);
    onValidated(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3 mt-4">
        {/* Toggle landmarks */}
        <button
          type="button"
          onClick={onToggleLandmarks}
          className="flex items-center gap-2 text-sm self-start"
          style={{ color: 'var(--text-muted)' }}
        >
          <span
            className="inline-block w-4 h-4 rounded border flex-shrink-0"
            style={{
              background: showLandmarks ? 'var(--mod-acne)' : 'transparent',
              borderColor: 'var(--mod-acne)',
            }}
          />
          Mostrar 478 landmarks
        </button>

        {/* Ação principal */}
        <div className="flex flex-wrap gap-3 mt-2">
          <Button
            onClick={handleCorrect}
            style={{
              background: 'var(--mod-acne)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
            }}
          >
            ROIs parecem corretas
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenFeedback}
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-body)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            ROIs parecem erradas
          </Button>
        </div>
      </div>

      {/* Modal de feedback */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent
          className="max-w-sm"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-strong)' }}>
              Quais regiões parecem erradas?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Selecione as regiões que não estão cobrindo a área correta do rosto.
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {REGION_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleRegion(id)}
                className="flex items-center gap-3 p-2 rounded text-sm text-left"
                style={{
                  background: selected.has(id) ? 'var(--bg-elevated)' : 'transparent',
                  color: 'var(--text-body)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span
                  className="w-4 h-4 rounded border flex-shrink-0"
                  style={{
                    background: selected.has(id) ? 'var(--sem-attention)' : 'transparent',
                    borderColor: selected.has(id) ? 'var(--sem-attention)' : 'var(--border-subtle)',
                  }}
                />
                {label}
              </button>
            ))}
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="ghost"
              onClick={() => setFeedbackOpen(false)}
              style={{ color: 'var(--text-muted)' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={selected.size === 0}
              style={{
                background: 'var(--sem-attention)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                opacity: selected.size === 0 ? 0.5 : 1,
              }}
            >
              Confirmar feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePresentationMode } from './PresentationModeProvider';

export function PresentationModeToggle() {
  const { presentationMode, togglePresentationMode } = usePresentationMode();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={togglePresentationMode}
      aria-label={presentationMode ? 'Sair do modo apresentação' : 'Ativar modo apresentação'}
      className="gap-2 border-[var(--border-subtle)] bg-transparent text-[var(--text-body)] hover:bg-[var(--ink-3)]"
      title="Modo apresentação (P)"
    >
      {presentationMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      {presentationMode ? 'Sair da apresentação' : 'Modo apresentação'}
    </Button>
  );
}

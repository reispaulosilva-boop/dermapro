'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface PresentationModeContextValue {
  presentationMode: boolean;
  togglePresentationMode: () => void;
}

const PresentationModeContext = createContext<PresentationModeContextValue | null>(null);

export function PresentationModeProvider({ children }: { children: React.ReactNode }) {
  const [presentationMode, setPresentationMode] = useState(false);

  const togglePresentationMode = useCallback(() => {
    setPresentationMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('presentation-mode');
      } else {
        document.body.classList.remove('presentation-mode');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === 'p' || e.key === 'P' &&
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        togglePresentationMode();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePresentationMode]);

  return (
    <PresentationModeContext.Provider value={{ presentationMode, togglePresentationMode }}>
      {children}
    </PresentationModeContext.Provider>
  );
}

export function usePresentationMode(): PresentationModeContextValue {
  const ctx = useContext(PresentationModeContext);
  if (!ctx) {
    throw new Error('usePresentationMode must be used inside PresentationModeProvider');
  }
  return ctx;
}

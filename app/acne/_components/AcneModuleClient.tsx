'use client';

import { useEffect, useState } from 'react';
import { DisclaimerModal } from '@/app/_shared/components/DisclaimerModal';
import ROIValidationFlow from './ROIValidationFlow';

type Step = 'disclaimer' | 'roi_validation' | 'upload';

const STORAGE_KEY_VALIDATED = 'dermapro-roi-validated';

export default function AcneModuleClient() {
  const [step, setStep] = useState<Step>('disclaimer');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Determina o passo inicial após montar (lê localStorage no client)
  useEffect(() => {
    setDisclaimerOpen(true);
  }, []);

  const handleDisclaimerAccept = () => {
    setDisclaimerOpen(false);
    const alreadyValidated = localStorage.getItem(STORAGE_KEY_VALIDATED) === 'true';
    setStep(alreadyValidated ? 'upload' : 'roi_validation');
  };

  const handleROIValidated = (_correct: boolean) => {
    // Independente do resultado, avança para o upload de análise.
    // Se errado, ROIValidationControls já salvou feedback em sessionStorage.
    setStep('upload');
  };

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <DisclaimerModal
        moduleType="acne"
        open={disclaimerOpen}
        onAccept={handleDisclaimerAccept}
      />

      {step === 'roi_validation' && (
        <ROIValidationFlow onValidated={handleROIValidated} />
      )}

      {step === 'upload' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-medium" style={{ color: 'var(--text-strong)' }}>
            Análise de Acne
          </h1>
          <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
            Envie uma foto para iniciar a detecção de lesões. (Em implementação — Bloco 5)
          </p>
        </div>
      )}
    </main>
  );
}

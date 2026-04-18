'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export type DisclaimerModuleType =
  | 'general'
  | 'acne'
  | 'melasma'
  | 'textura'
  | 'linhas'
  | 'rosacea'
  | 'estrutura';

interface DisclaimerModalProps {
  moduleType: DisclaimerModuleType;
  open: boolean;
  onAccept: () => void;
}

const BASE_TEXT =
  'O DermaPro é uma ferramenta de análise visual estética e educacional. Não constitui dispositivo médico nem substitui avaliação clínica presencial. Imagens processadas localmente, nunca enviadas a servidores.';

const MODULE_TEXTS: Record<DisclaimerModuleType, string> = {
  general: BASE_TEXT,
  acne: `${BASE_TEXT} O módulo de Acne realiza contagem e classificação de lesões visíveis na foto. Os resultados são estimativas baseadas em processamento de imagem e devem ser interpretados em conjunto com avaliação clínica.`,
  melasma: `${BASE_TEXT} O módulo de Melasma estima distribuição de hiperpigmentação cutânea. Fatores como iluminação e maquiagem podem afetar os resultados.`,
  textura: `${BASE_TEXT} O módulo de Textura analisa poros visíveis e oleosidade aparente na imagem. É uma estimativa visual, não uma medição clínica.`,
  linhas: `${BASE_TEXT} O módulo de Sinais de Expressão detecta linhas finas e vincos dinâmicos. Os resultados são normais para o processo de envelhecimento e apresentados sem linguagem alarmista.`,
  rosacea: `${BASE_TEXT} Este módulo está em desenvolvimento.`,
  estrutura: `${BASE_TEXT} Este módulo está em desenvolvimento.`,
};

export function DisclaimerModal({ moduleType, open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[560px] bg-[var(--bg-surface)] border-[var(--border-subtle)]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-[var(--r-md)] bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)] grid place-items-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-faint)] mb-0.5">
                Primeiro uso
              </p>
              <DialogTitle className="text-[22px] font-medium text-[var(--text-strong)] tracking-tight">
                Antes de começar
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="text-[15px] leading-[1.55] text-[var(--text-body)] py-2">
          <p>{MODULE_TEXTS[moduleType]}</p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
          <Link
            href="/sobre"
            className="text-sm text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-body)]"
          >
            Saber mais
          </Link>
          <Button
            onClick={onAccept}
            className="bg-[var(--brand-primary-700)] hover:bg-[var(--brand-primary-800)] text-[var(--text-strong)]"
          >
            Entendi e quero prosseguir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

// TODO (Bloco 6): implementar hayashiSeverity completo

export type HayashiLevel = 'I' | 'II' | 'III' | 'IV';

export interface SeverityResult {
  level: HayashiLevel;
  /** 'Leve' | 'Moderado' | 'Marcante' | 'Intenso' — nunca 'grave' ou 'severo' */
  label: string;
  /** Descrição neutra em pt-BR conforme MASTER seção 4.4 */
  description: string;
  /** CSS custom property, ex: 'var(--mod-acne-level-i)' */
  color: string;
}

export function hayashiSeverity(_totalCount: number): SeverityResult {
  // TODO (Bloco 6): implementar limiares Hayashi 2008
  throw new Error('hayashiSeverity: não implementado ainda (Bloco 6)');
}

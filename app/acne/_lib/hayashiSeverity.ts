import { HAYASHI_THRESHOLDS } from './constants';

export type HayashiLevel = 'I' | 'II' | 'III' | 'IV';

export interface SeverityResult {
  level: HayashiLevel;
  /** Nunca 'grave' ou 'severo' — MASTER §4.4 */
  label: 'Leve' | 'Moderado' | 'Marcante' | 'Intenso';
  description: string;
  /** CSS custom property referenciando token do design system */
  color: string;
}

/**
 * Classifica a contagem total de lesões na escala de Hayashi (2008).
 *   I  (Leve)     : ≤ 5 lesões
 *   II (Moderado) : 6–20 lesões
 *   III (Marcante): 21–50 lesões
 *   IV (Intenso)  : > 50 lesões
 */
export function hayashiSeverity(totalCount: number): SeverityResult {
  if (totalCount <= HAYASHI_THRESHOLDS.MILD) {
    return {
      level: 'I',
      label: 'Leve',
      description: `${totalCount} lesão${totalCount === 1 ? '' : 'ões'} visível${totalCount === 1 ? '' : 'eis'} detectada${totalCount === 1 ? '' : 's'}.`,
      color: 'var(--mod-acne-level-i)',
    };
  }
  if (totalCount <= HAYASHI_THRESHOLDS.MODERATE) {
    return {
      level: 'II',
      label: 'Moderado',
      description: `${totalCount} lesões visíveis detectadas.`,
      color: 'var(--mod-acne-level-ii)',
    };
  }
  if (totalCount <= HAYASHI_THRESHOLDS.SEVERE) {
    return {
      level: 'III',
      label: 'Marcante',
      description: `${totalCount} lesões visíveis detectadas.`,
      color: 'var(--mod-acne-level-iii)',
    };
  }
  return {
    level: 'IV',
    label: 'Intenso',
    description: `${totalCount} lesões visíveis detectadas.`,
    color: 'var(--mod-acne-level-iv)',
  };
}

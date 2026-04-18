'use client';

// TODO (Bloco 7): implementar SeverityBadge completo

import type { SeverityResult } from '../_lib/hayashiSeverity';

export interface SeverityBadgeProps {
  severity: SeverityResult;
}

export default function SeverityBadge(_props: SeverityBadgeProps) {
  // TODO (Bloco 7): badge com cor --mod-acne-level-{i|ii|iii|iv}, tipografia legível a distância (TV)
  return <div>Severidade (em construção)</div>;
}

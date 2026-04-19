'use client';

import { usePresentationMode } from '@/app/_shared/components/PresentationModeProvider';
import type { SeverityResult } from '../_lib/hayashiSeverity';

export interface SeverityBadgeProps {
  severity: SeverityResult;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { presentationMode } = usePresentationMode();

  const levelSize  = presentationMode ? 44 : 28;
  const labelSize  = presentationMode ? 28 : 18;
  const descSize   = presentationMode ? 16 : 13;
  const padding    = presentationMode ? 'var(--s-6) var(--s-6)' : 'var(--s-4) var(--s-5)';

  return (
    <div
      role="status"
      aria-label={`Severidade: Nível ${severity.level} — ${severity.label}. ${severity.description}`}
      style={{
        borderLeft: `4px solid ${severity.color}`,
        background: `color-mix(in oklab, ${severity.color} 12%, var(--bg-surface))`,
        borderRadius: 'var(--r-md)',
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-2)' }}>
        <span
          aria-hidden="true"
          style={{
            fontSize: levelSize,
            fontWeight: 700,
            lineHeight: 1,
            color: severity.color,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {severity.level}
        </span>
        <span
          aria-hidden="true"
          style={{
            fontSize: labelSize,
            fontWeight: 600,
            color: 'var(--text-strong)',
          }}
        >
          {severity.label}
        </span>
      </div>
      <p aria-hidden="true" style={{ fontSize: descSize, color: 'var(--text-muted)', margin: 0 }}>
        {severity.description}
      </p>
    </div>
  );
}

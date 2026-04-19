'use client';

import type { SeverityResult } from '../_lib/hayashiSeverity';

export interface SeverityBadgeProps {
  severity: SeverityResult;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${severity.color}`,
        background: `color-mix(in oklab, ${severity.color} 12%, var(--bg-surface))`,
        borderRadius: 'var(--r-md)',
        padding: 'var(--s-4) var(--s-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-2)' }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            color: severity.color,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {severity.level}
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-strong)',
          }}
        >
          {severity.label}
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        {severity.description}
      </p>
    </div>
  );
}

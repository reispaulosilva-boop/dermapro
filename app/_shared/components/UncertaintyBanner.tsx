'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';

interface UncertaintyBannerProps {
  warnings: string[];
  severity?: 'info' | 'warning';
}

export function UncertaintyBanner({ warnings, severity = 'info' }: UncertaintyBannerProps) {
  if (warnings.length === 0) return null;

  const Icon = severity === 'warning' ? AlertCircle : Info;
  const bgColor = severity === 'warning' ? 'var(--sem-attention-bg)' : 'var(--sem-info-bg)';
  const textColor = severity === 'warning' ? 'var(--brand-accent-300)' : '#9cc0d3';
  const borderColor = severity === 'warning' ? 'color-mix(in oklab, var(--brand-accent-400) 40%, transparent)' : 'color-mix(in oklab, #9cc0d3 30%, transparent)';

  return (
    <Alert
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        padding: '12px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <Icon size={16} style={{ color: textColor, marginTop: 2, flexShrink: 0 }} />
      <AlertDescription style={{ color: textColor, fontSize: 14, lineHeight: 1.5 }}>
        {warnings.length === 1 ? (
          warnings[0]
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', marginTop: 8, flexShrink: 0 }} />
                {w}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

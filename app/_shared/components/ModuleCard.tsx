'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ModuleConfig } from '@/app/_shared/config/modules';

interface ModuleCardProps {
  module: ModuleConfig;
}

const MODULE_COLOR_VARS: Record<string, string> = {
  acne: 'var(--mod-acne)',
  melasma: 'var(--mod-melasma)',
  textura: 'var(--mod-textura)',
  linhas: 'var(--mod-linhas)',
  rosacea: 'var(--mod-rosacea)',
  'estrutura-facial': 'var(--mod-estrutura)',
};

const MODULE_SOFT_VARS: Record<string, string> = {
  acne: 'var(--mod-acne-soft)',
  melasma: 'var(--mod-melasma-soft)',
  textura: 'var(--mod-textura-soft)',
  linhas: 'var(--mod-linhas-soft)',
  rosacea: 'var(--mod-rosacea-soft)',
  'estrutura-facial': 'var(--mod-estrutura-soft)',
};

function BadgeChip({ label, variant }: { label: string; variant: 'beta' | 'em-breve' }) {
  const bg = variant === 'beta' ? 'var(--sem-info-bg)' : 'var(--ink-3)';
  const color = variant === 'beta' ? '#9cc0d3' : 'var(--text-faint)';
  const border = variant === 'beta' ? 'color-mix(in oklab, #9cc0d3 30%, transparent)' : 'var(--ink-5)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 'var(--r-full)',
      fontSize: 11, fontWeight: 500, letterSpacing: '0.03em',
      background: bg, color, border: `1px solid ${border}`,
    }}>
      {label}
    </span>
  );
}

function CardInner({ module: m }: ModuleCardProps) {
  const [hover, setHover] = useState(false);

  const color = MODULE_COLOR_VARS[m.id] ?? 'var(--ink-7)';
  const soft = MODULE_SOFT_VARS[m.id] ?? 'var(--ink-3)';

  // Resolve Lucide icon by name (cast through unknown to satisfy strict type check)
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[m.icon];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s-6)',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        opacity: m.enabled ? 1 : 0.6,
        cursor: m.enabled ? 'pointer' : 'not-allowed',
        boxShadow: hover && m.enabled ? 'var(--sh-md)' : 'var(--sh-sm)',
        transform: hover && m.enabled ? 'translateY(-2px)' : 'none',
        transition: 'transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease)',
        borderColor: hover && m.enabled
          ? `color-mix(in oklab, ${color} 45%, var(--ink-5))`
          : 'var(--border-subtle)',
      }}
    >
      {/* Left accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 4, height: '100%',
        background: color,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        {/* Icon glyph */}
        <div style={{
          width: 44, height: 44,
          borderRadius: 'var(--r-md)',
          background: soft,
          border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {IconComponent ? <IconComponent size={20} /> : null}
        </div>

        {/* Badge */}
        {m.badge === 'beta' && <BadgeChip label="Beta" variant="beta" />}
        {m.badge === 'em-breve' && <BadgeChip label="Em breve" variant="em-breve" />}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: '0 0 6px',
          fontSize: 22, fontWeight: 500,
          color: 'var(--text-strong)',
          letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>
          {m.name}
        </h3>
        <p style={{
          margin: 0,
          fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.45,
        }}>
          {m.description}
        </p>
      </div>

      {/* Footer CTA */}
      {m.enabled && (
        <div style={{
          marginTop: 24,
          paddingTop: 'var(--s-3)',
          borderTop: '1px solid var(--ink-4)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 13, color: 'var(--ink-8)',
        }}>
          <span style={{ color, fontWeight: 500 }}>Iniciar análise</span>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--r-full)',
            background: `color-mix(in oklab, ${color} 18%, var(--ink-3))`,
            color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModuleCard({ module: m }: ModuleCardProps) {
  if (m.enabled) {
    return (
      <Link href={m.href} style={{ display: 'block', textDecoration: 'none' }}>
        <CardInner module={m} />
      </Link>
    );
  }
  return <CardInner module={m} />;
}

import { getAllModules } from '@/app/_shared/config/modules';
import { ModuleCard } from '@/app/_shared/components/ModuleCard';
import { SessionHeader } from '@/app/_shared/components/SessionHeader';
import { DisclaimerWrapper } from '@/app/_shared/components/DisclaimerWrapper';
import { version } from '@/package.json';

export default function HubPage() {
  const modules = getAllModules();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <DisclaimerWrapper />

      <main style={{ padding: 'clamp(32px, 5vw, 64px)' }}>
        <SessionHeader />

        {/* Module grid — 1 col mobile, 2 tablet, 3 desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: 20,
        }}>
          {modules.map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 16px',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            DermaPro · v{version}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            Projeto de uso próprio, não comercial.
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>·</span>
          <a
            href="https://github.com/reispaulosilva-boop/dermapro"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: 'var(--text-faint)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            github.com/reispaulosilva-boop/dermapro
          </a>
        </footer>
      </main>
    </div>
  );
}

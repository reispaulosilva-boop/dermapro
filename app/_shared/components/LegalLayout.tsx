import Link from 'next/link';

function DermaMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M13 26 Q 24 34, 35 26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
      <circle cx="31" cy="19" r="1.8" fill="currentColor" />
    </svg>
  );
}

function LegalHeader() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      padding: '16px 0',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-strong)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <DermaMark size={28} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ fontWeight: 500 }}>Derma</span>
            <span style={{ fontWeight: 600 }}>Pro</span>
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: 24 }}>
          <Link href="/sobre" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>Sobre</Link>
          <Link href="/privacidade" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacidade</Link>
          <Link href="/termos" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>Termos</Link>
        </nav>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 64,
      padding: '24px 0',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Voltar ao hub
        </Link>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>DermaPro · AGPL-3.0</span>
      </div>
    </footer>
  );
}

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-body)' }}>
      <LegalHeader />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {children}
      </main>
      <LegalFooter />
    </div>
  );
}

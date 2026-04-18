'use client';

export default function MelasmaPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-medium" style={{ color: 'var(--text-strong)' }}>
        Módulo Melasma em desenvolvimento
      </h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Este módulo será implementado em breve. Volte ao hub para explorar os outros.
      </p>
      <a href="/" style={{ color: 'var(--brand-primary-400)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
        Voltar ao hub
      </a>
    </main>
  );
}

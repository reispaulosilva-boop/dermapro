import { LegalLayout } from '@/app/_shared/components/LegalLayout';

export const metadata = {
  title: 'Privacidade — DermaPro',
  description: 'Política de Privacidade do DermaPro — processamento 100% local, sem coleta de dados.',
};

const LAST_UPDATED = '17 de abril de 2026';

export default function PrivacidadePage() {
  return (
    <LegalLayout>
      <article style={{ lineHeight: 1.7 }}>

        <h1 style={{ fontSize: 36, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.02em', marginBottom: 8, marginTop: 0 }}>
          Política de Privacidade
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 0, marginBottom: 40, fontFamily: 'var(--font-mono)' }}>
          Última atualização: {LAST_UPDATED}
        </p>

        <Section title="Natureza do processamento">
          <p>
            O DermaPro processa imagens enviadas pelo usuário <strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>EXCLUSIVAMENTE no navegador do dispositivo local</strong>.
            Nenhuma imagem é transmitida a servidores externos.
          </p>
        </Section>

        <Section title="Dados coletados">
          <p>
            Nenhum dado pessoal é coletado pelo DermaPro. Não há cadastro, login, cookies de
            rastreamento, analytics ou telemetria.
          </p>
        </Section>

        <Section title="Armazenamento">
          <p>
            Nenhum dado é armazenado pelo DermaPro. Fotos enviadas permanecem apenas na memória do
            navegador durante a sessão e são descartadas quando a aba é fechada.
          </p>
        </Section>

        <Section title="Downloads">
          <p>
            Quando o usuário decide baixar uma foto ou PDF, o arquivo é salvo no dispositivo dele,
            sem passar por nenhum servidor do projeto.
          </p>
        </Section>

        <Section title="Terceiros">
          <p>
            O DermaPro usa CDN do Google (MediaPipe) e CDN genéricos (ONNX Runtime) apenas para
            baixar modelos estáticos de ML. Essas requisições não carregam dados do paciente.
          </p>
        </Section>

        <Section title="Base legal">
          <p>
            Por não haver tratamento de dados pessoais, as obrigações da LGPD não se aplicam no uso comum.
          </p>
        </Section>

        <Section title="Contato">
          <p>
            Para dúvidas, contate o responsável pelo repositório{' '}
            <a
              href="https://github.com/reispaulosilva-boop/dermapro"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--brand-primary-400)', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              github.com/reispaulosilva-boop/dermapro
            </a>.
          </p>
        </Section>

      </article>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 20, fontWeight: 500, color: 'var(--text-strong)',
        letterSpacing: '-0.01em', marginBottom: 12, marginTop: 0,
        paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.65 }}>
        {children}
      </div>
    </section>
  );
}

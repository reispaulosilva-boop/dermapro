import { LegalLayout } from '@/app/_shared/components/LegalLayout';

export const metadata = {
  title: 'Termos de Uso — DermaPro',
  description: 'Termos de Uso do DermaPro — ferramenta de apoio visual, não dispositivo médico.',
};

const LAST_UPDATED = '17 de abril de 2026';

export default function TermosPage() {
  return (
    <LegalLayout>
      <article style={{ lineHeight: 1.7 }}>

        <h1 style={{ fontSize: 36, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.02em', marginBottom: 8, marginTop: 0 }}>
          Termos de Uso
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 0, marginBottom: 40, fontFamily: 'var(--font-mono)' }}>
          Última atualização: {LAST_UPDATED}
        </p>

        <Section title="Propósito">
          <p>
            O DermaPro é ferramenta de apoio visual para uso em consulta dermatológica. Não é dispositivo médico.
          </p>
        </Section>

        <Section title="Uso adequado">
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>O DermaPro é ferramenta auxiliar, não substitui avaliação clínica.</li>
            <li>Resultados são estimativas visuais baseadas em algoritmos de processamento de imagem, sujeitas a limitações documentadas em cada módulo.</li>
            <li>A responsabilidade clínica permanece integralmente com o profissional médico.</li>
          </ul>
        </Section>

        <Section title="Limitação de responsabilidade">
          <p>
            O projeto é fornecido "como está", sem garantias. O autor não se responsabiliza por:
          </p>
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Decisões clínicas tomadas com base nos resultados.</li>
            <li>Erros de algoritmo, limitações conhecidas ou imprecisões.</li>
            <li>Problemas técnicos de hardware ou navegador.</li>
          </ul>
        </Section>

        <Section title="Uso não-comercial">
          <p>
            O DermaPro é mantido como projeto não-comercial. Uso comercial ou redistribuição modificada
            deve respeitar a licença AGPL-3.0 e as licenças dos componentes de terceiros (algumas das
            quais são CC BY-NC-SA 4.0, incompatíveis com uso comercial).
          </p>
        </Section>

        <Section title="Alterações">
          <p>
            Estes termos podem ser atualizados. Mudanças significativas serão anunciadas no repositório GitHub.
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

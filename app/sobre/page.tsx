import { LegalLayout } from '@/app/_shared/components/LegalLayout';

export const metadata = {
  title: 'Sobre — DermaPro',
  description: 'O que é o DermaPro, como funciona, privacidade e créditos técnicos.',
};

export default function SobrePage() {
  return (
    <LegalLayout>
      <article style={{ lineHeight: 1.7 }}>

        <h1 style={{ fontSize: 36, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.02em', marginBottom: 8, marginTop: 0 }}>
          Sobre o DermaPro
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 0, marginBottom: 40 }}>
          Ferramenta web de análise visual da pele para uso em consulta dermatológica.
        </p>

        <Section title="O que é">
          <p>
            O DermaPro é uma ferramenta web de análise visual da pele desenvolvida para uso em consulta
            dermatológica. Ele processa fotos faciais e gera estimativas quantitativas sobre características
            cutâneas — acne, melasma, textura (poros e oleosidade) e sinais de expressão — sempre
            apresentadas com linguagem descritiva, nunca prescritiva.
          </p>
        </Section>

        <Section title="Como funciona">
          <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li>Você envia uma foto frontal do paciente (tirada no celular, enviada ao notebook).</li>
            <li>O DermaPro processa a imagem inteiramente no seu dispositivo. A foto <strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>NÃO</strong> é enviada a nenhum servidor.</li>
            <li>Você recebe métricas por região e um overlay visual sobre a própria foto, que pode ser espelhado em Apple TV para conversa com o paciente.</li>
            <li>Todos os resultados podem ser baixados em PDF para o prontuário e a foto anotada pode ser baixada separadamente.</li>
          </ol>
        </Section>

        <Section title="O que NÃO é">
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Não é dispositivo médico registrado na ANVISA.</li>
            <li>Não substitui a avaliação clínica presencial.</li>
            <li>Não prescreve tratamentos.</li>
            <li>Não estabelece diagnósticos.</li>
          </ul>
        </Section>

        <Section title="Privacidade">
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Imagens são processadas 100% no navegador do usuário.</li>
            <li>Nenhuma imagem é enviada a servidores externos.</li>
            <li>Nenhum dado pessoal é coletado ou armazenado.</li>
          </ul>
        </Section>

        <Section title="Propósito">
          <p>
            Este é um projeto de uso próprio, não comercial, desenvolvido por dermatologista para apoiar
            suas próprias consultas. A natureza não-comercial é essencial para a licença de alguns
            componentes de terceiros e deve ser preservada.
          </p>
        </Section>

        <Section title="Módulos disponíveis">
          <p style={{ marginTop: 0 }}>Ativos:</p>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>Análise de Acne</strong> — Detecção e contagem de lesões acneiformes.</li>
            <li><strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>Análise de Melasma</strong> — Avaliação de hiperpigmentação por região facial.</li>
            <li><strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>Análise de Textura</strong> — Poros e oleosidade por região da Zona T.</li>
            <li><strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>Análise de Sinais de Expressão</strong> — Linhas faciais por região anatômica.</li>
          </ul>
          <p style={{ marginTop: 0 }}>Em desenvolvimento:</p>
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>Análise de Rosácea</strong> — Vermelhidão e teleangiectasias.</li>
            <li><strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>Análise de Estrutura Facial</strong> — Proporções e harmonia via MediaPipe FaceMesh.</li>
          </ul>
        </Section>

        <Section title="Créditos técnicos">
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {/* TODO: preencher por módulo à medida que forem implementados */}
            Lista detalhada de papers e bibliotecas utilizadas será adicionada à medida que cada módulo for implementado.
          </p>
        </Section>

        <Section title="Tecnologia">
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Next.js 16+ com App Router.</li>
            <li>TypeScript, Tailwind, shadcn/ui.</li>
            <li>MediaPipe Face Landmarker (Google, Apache 2.0).</li>
            <li>ONNX Runtime Web (Microsoft, MIT).</li>
            <li>Algoritmos clássicos de processamento de imagem (Frangi 1998, Ng 2014, Zuiderveld 1994, Rosenfeld-Pfaltz 1966).</li>
          </ul>
        </Section>

        <Section title="Licença">
          <p>
            Código do projeto: AGPL-3.0 (ver repositório).
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

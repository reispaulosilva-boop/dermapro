/* Design System showcase sections */

function DSSection({ id, title, eyebrow, children }) {
  return (
    <section id={id} style={{ marginBottom: 72, scrollMarginTop: 24 }}>
      {eyebrow && <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)', fontWeight: 500, marginBottom: 10 }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 32, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.02em', margin: 0, marginBottom: 28, lineHeight: 1.15 }}>{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, token, value, fg = 'dark', large, note }) {
  const bg = `var(--${token})`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        background: bg, height: large ? 96 : 64, borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--sh-xs)',
      }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, color: 'var(--text-strong)', fontWeight: 500 }}>{name}</span>
        {note && <span style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)' }}>{note}</span>}
      </div>
      <code style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)' }}>--{token}</code>
    </div>
  );
}

function PaletteRow({ name, scale, prefix }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 12 }}>{name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scale.length}, 1fr)`, gap: 6 }}>
        {scale.map(step => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ background: `var(--${prefix}-${step})`, height: 72, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}/>
            <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)', textAlign: 'center' }}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DSOverview() {
  return (
    <DSSection id="overview" eyebrow="DermaPro · Design System v0.1" title="Sóbrio, não frio. Clínico, não hospitalar.">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, alignItems: 'start' }}>
        <div>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--text-body)', marginTop: 0 }}>
            Este sistema define a linguagem visual do DermaPro — uma ferramenta de análise facial usada em consultório, espelhada em Apple TV para que médico e paciente vejam juntos. As escolhas priorizam <strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>legibilidade a distância</strong>, uma paleta <strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>sem vermelho</strong> para evitar alarme e um tom <strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>acolhedor</strong> em cada sinalização.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 24 }}>
            {[
              ['Sóbrio', 'Azul-petróleo profundo, não saturado.'],
              ['Acolhedor', 'Bege quente, neutros com temperatura.'],
              ['Clínico', 'Tipografia geométrica, ritmo regular.'],
              ['Legível', 'Escala ampliada para TV e laptop.'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', background: 'var(--neutral-0)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 32, borderRadius: 'var(--r-lg)', background: 'var(--brand-primary-900)', color: 'var(--neutral-100)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'oklch(1 0 0 / 0.03)' }}/>
          <DermaProLogo size={36} color="var(--neutral-100)"/>
          <div style={{ fontSize: 13, fontFamily: 'var(--ff-mono)', color: 'var(--neutral-400)', marginTop: 32, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Princípios</div>
          <div style={{ fontSize: 22, lineHeight: 1.35, letterSpacing: '-0.01em', color: 'var(--neutral-100)' }}>
            Toda escolha deve <em style={{ fontStyle: 'normal', color: 'var(--brand-accent-400)' }}>apoiar a conversa</em> entre o médico e o paciente.
          </div>
        </div>
      </div>
    </DSSection>
  );
}

function DSLogo() {
  return (
    <DSSection id="logo" eyebrow="Identidade" title="Logo DermaPro">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--neutral-0)', padding: 48, borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', display: 'grid', placeItems: 'center' }}>
          <DermaProLogo size={40} color="var(--brand-primary-800)"/>
        </div>
        <div style={{ background: 'var(--brand-secondary-200)', padding: 48, borderRadius: 'var(--r-lg)', display: 'grid', placeItems: 'center' }}>
          <DermaProLogo size={40} color="var(--brand-primary-800)"/>
        </div>
        <div style={{ background: 'var(--neutral-1000)', padding: 48, borderRadius: 'var(--r-lg)', display: 'grid', placeItems: 'center' }}>
          <DermaProLogo size={40} color="var(--neutral-100)"/>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          ['Mark isolado', <DermaProLogo size={48} color="var(--brand-primary-800)" showWordmark={false}/>, 'Ícones de app, favicon'],
          ['Horizontal', <DermaProLogo size={28} color="var(--brand-primary-800)"/>, 'Header padrão'],
          ['Empilhado', <DermaProLogo size={32} color="var(--brand-primary-800)" stacked/>, 'Tela de abertura'],
          ['Reverso', <div style={{ background: 'var(--brand-primary-800)', padding: 16, borderRadius: 'var(--r-sm)' }}><DermaProLogo size={28} color="var(--neutral-100)"/></div>, 'Sobre fundo escuro'],
        ].map(([label, el, note], i) => (
          <div key={i} style={{ background: 'var(--neutral-0)', padding: 20, borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ height: 64, display: 'grid', placeItems: 'center', marginBottom: 14 }}>{el}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)' }}>{label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{note}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: 20, background: 'var(--neutral-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--text-body)', fontWeight: 500 }}>Construção:</strong> círculo representando o rosto visto de frente, arco sutil abaixo (análise + sorriso discreto) e um ponto no canto superior direito aludindo ao landmark detectado. Wordmark em DM Sans com “Derma” em Medium (500) e “Pro” em Bold (700).
      </div>
    </DSSection>
  );
}

function DSColors() {
  return (
    <DSSection id="colors" eyebrow="Tokens" title="Paleta">
      <PaletteRow name="Primária — azul-petróleo profundo" prefix="brand-primary" scale={[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}/>
      <PaletteRow name="Secundária — bege quente" prefix="brand-secondary" scale={[100, 200, 300, 400, 500, 600, 700]}/>
      <PaletteRow name="Acento — âmbar suave" prefix="brand-accent" scale={[200, 300, 400, 500, 600, 700]}/>
      <PaletteRow name="Neutros — cinzas com temperatura quente" prefix="neutral" scale={[0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000]}/>

      <div style={{ marginTop: 40, marginBottom: 16, fontSize: 15, fontWeight: 500, color: 'var(--text-strong)' }}>Semânticas — sem vermelho intenso</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          ['Info', 'sem-info', 'Azul neutro'],
          ['Sucesso', 'sem-success', 'Verde oliva'],
          ['Atenção', 'sem-attention', 'Âmbar-laranja'],
          ['Alerta', 'sem-alert', 'Vinho suave'],
        ].map(([n, t, note]) => <Swatch key={t} name={n} token={t} note={note} large/>)}
      </div>

      <div style={{ marginTop: 40, marginBottom: 16, fontSize: 15, fontWeight: 500, color: 'var(--text-strong)' }}>Cores por módulo</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          ['Acne', 'mod-acne', 'Terracotta-rose'],
          ['Melasma', 'mod-melasma', 'Mauve'],
          ['Textura', 'mod-textura', 'Moss'],
          ['Expressão', 'mod-expression', 'Slate-blue'],
        ].map(([n, t, note]) => <Swatch key={t} name={n} token={t} note={note} large/>)}
      </div>

      <div style={{ marginTop: 40, marginBottom: 16, fontSize: 15, fontWeight: 500, color: 'var(--text-strong)' }}>Overlays de análise — semitransparentes</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          ['Lesão acneica', 'overlay-lesion', 'Caixa + contorno'],
          ['Hiperpigmentação', 'overlay-pigment', 'Mancha difusa'],
          ['Brilho (oleosidade)', 'overlay-shine', 'Patches luminosos'],
          ['Linhas detectadas', 'overlay-lines', 'Traços finos'],
        ].map(([n, t, note]) => (
          <div key={t}>
            <div style={{
              height: 96, borderRadius: 'var(--r-md)',
              background: `repeating-linear-gradient(135deg, oklch(0.82 0.02 40), oklch(0.82 0.02 40) 8px, oklch(0.86 0.02 40) 8px, oklch(0.86 0.02 40) 16px)`,
              border: '1px solid var(--border-subtle)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 20, background: `var(--${t})`, borderRadius: 'var(--r-sm)' }}/>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-strong)', fontWeight: 500, marginTop: 8 }}>{n}</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)', marginTop: 2 }}>{note}</div>
          </div>
        ))}
      </div>
    </DSSection>
  );
}

function DSType() {
  const sizes = [
    ['H1', 'var(--fs-h1)', 500, 'Análise finalizada'],
    ['H2', 'var(--fs-h2)', 500, 'Distribuição por região'],
    ['H3', 'var(--fs-h3)', 500, 'Zona T — oleosidade'],
    ['Body (lg)', 'var(--fs-body-lg)', 400, 'Resultado estimado sobre a imagem atual.'],
    ['Body', 'var(--fs-body)', 400, 'Pele mista com concentração central. Recomenda-se...'],
    ['Small', 'var(--fs-small)', 400, 'Atualizado há instantes'],
    ['Caption', 'var(--fs-caption)', 500, 'IMG · 17-04-2026'],
  ];
  return (
    <DSSection id="type" eyebrow="Tokens" title="Tipografia">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Principal</div>
          <div style={{ fontSize: 72, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1 }}>DM Sans</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>Sans-serif geométrica humanista. Regular · Medium · Semibold · Bold.</div>
          <div style={{ fontSize: 22, marginTop: 20, color: 'var(--text-body)', letterSpacing: '-0.005em' }}>aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP<br/>0123456789 &amp; · , . —</div>
        </div>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Mono (métricas, legendas)</div>
          <div style={{ fontSize: 72, fontFamily: 'var(--ff-mono)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-strong)', lineHeight: 1 }}>JetBrains</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>Mono. Usado em IDs de imagem, percentuais e eyebrows.</div>
          <div style={{ fontSize: 22, fontFamily: 'var(--ff-mono)', marginTop: 20, color: 'var(--text-body)' }}>MASI 8.4 · GAGS 11/45<br/>17-04-2026 · #A4821</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
        {sizes.map(([n, s, w, sample]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'baseline', gap: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-strong)' }}>{n}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)', marginTop: 2 }}>{s} · {w}</div>
            </div>
            <div style={{ fontSize: s, fontWeight: w, color: 'var(--text-strong)', letterSpacing: '-0.015em', lineHeight: 1.2 }}>{sample}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 16, background: 'var(--brand-accent-200)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--neutral-800)' }}>
        <strong style={{ fontWeight: 500 }}>Modo TV:</strong> H1 cresce para 64px, Body 22px. Ativado automaticamente quando a sessão detecta espelhamento.
      </div>
    </DSSection>
  );
}

function DSGeometry() {
  return (
    <DSSection id="geometry" eyebrow="Tokens" title="Espaçamento, raios e sombras">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 14 }}>Espaçamento · 4/8</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['s-1', 4], ['s-2', 8], ['s-3', 12], ['s-4', 16], ['s-6', 24], ['s-8', 32], ['s-12', 48], ['s-16', 64]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: v, height: 12, background: 'var(--brand-primary-600)', borderRadius: 2 }}/>
                <span style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)' }}>--{k} · {v}px</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 14 }}>Raios</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[['xs', 4], ['sm', 6], ['md', 10], ['lg', 14], ['xl', 20], ['2xl', 28]].map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ height: 72, background: 'var(--brand-primary-100)', border: '1px solid var(--brand-primary-200)', borderRadius: `var(--r-${k})`, marginBottom: 6 }}/>
                <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)' }}>{k} · {v}px</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 12, background: 'var(--brand-accent-200)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--neutral-800)' }}>
            Padrão: <strong style={{ fontWeight: 500 }}>md · 10px</strong>. Superfícies grandes: lg/xl.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 14 }}>Sombras · blur generoso, opacidade baixa</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['xs', 'Input, fino'], ['sm', 'Card padrão'], ['md', 'Hover'], ['lg', 'Popovers'], ['xl', 'Modal']].map(([k, desc]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 56, height: 40, background: 'var(--neutral-0)', borderRadius: 'var(--r-md)', boxShadow: `var(--sh-${k})`, border: '1px solid var(--border-subtle)' }}/>
                <div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-body)' }}>--sh-{k}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DSSection>
  );
}

function DSComponents() {
  return (
    <DSSection id="components" eyebrow="Componentes" title="Peças-chave">
      {/* Buttons */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 12 }}>Botões</div>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <Button variant="primary" icon={<Icon.Download s={16}/>}>Exportar foto</Button>
          <Button variant="secondary" icon={<Icon.Download s={16}/>}>Exportar foto</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="quiet">Mais opções</Button>
          <Button variant="primary" size="lg" icon={<Icon.Fullscreen s={18}/>}>Modo apresentação</Button>
          <Button variant="primary" size="sm">Aplicar</Button>
          <Button variant="primary" disabled>Desabilitado</Button>
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 12 }}>Badges de classificação</div>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Badge tone="success" size="lg">Severidade: Leve</Badge>
          <Badge tone="attention" size="lg">Severidade: Moderada</Badge>
          <Badge tone="alert" size="lg">Severidade: Acentuada</Badge>
          <Badge tone="brand" size="lg">Perfil: Pele Mista</Badge>
          <Badge tone="success" size="lg">Sinais Suaves</Badge>
          <Badge tone="info" size="lg">Em observação</Badge>
          <Badge tone="acne">Acne</Badge>
          <Badge tone="melasma">Melasma</Badge>
          <Badge tone="textura">Textura</Badge>
          <Badge tone="expression">Expressão</Badge>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 12 }}>Gráfico de distribuição por região</div>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Módulo Acne</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {METRICS.acne.bars.map(([l, v, t], i) => <BarRow key={i} label={l} value={v} color={`var(--mod-${t})`} soft={`var(--mod-${t}-soft)`}/>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Módulo Melasma</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {METRICS.melasma.bars.map(([l, v, t], i) => <BarRow key={i} label={l} value={v} color={`var(--mod-${t})`} soft={`var(--mod-${t}-soft)`}/>)}
            </div>
          </div>
        </div>
      </div>
    </DSSection>
  );
}

function DSVoice() {
  const pairs = [
    ['"Severidade: Leve"', '"Acne grau 1"', 'Tom acolhedor, não clínico.'],
    ['"Sinais Suaves"', '"Rugas superficiais"', 'Linguagem descritiva, não pejorativa.'],
    ['"Perfil: Pele Mista"', '"Problema de oleosidade"', 'Perfil, não patologia.'],
    ['"Os números apoiam a conversa."', '"Diagnóstico automático."', 'Apoio, não substituição.'],
  ];
  return (
    <DSSection id="voice" eyebrow="Tom" title="Voz e linguagem">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {pairs.map(([good, bad, note], i) => (
          <div key={i} style={{ padding: 20, background: 'var(--neutral-0)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon.Check s={16} c="var(--sem-success)"/>
              <span style={{ fontSize: 15, color: 'var(--text-strong)', fontWeight: 500 }}>{good}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: 0.65 }}>
              <Icon.Close s={16} c="var(--sem-alert)"/>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{bad}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>{note}</div>
          </div>
        ))}
      </div>
    </DSSection>
  );
}

function DSIcons() {
  const strokeColors = [
    ['Padrão', 'var(--text-body)', 'var(--neutral-0)'],
    ['Sobre marca', 'var(--neutral-0)', 'var(--brand-primary-700)'],
    ['Sobre fundo escuro', 'var(--neutral-100)', 'var(--neutral-1000)'],
    ['Acento', 'var(--brand-primary-700)', 'var(--brand-primary-100)'],
  ];
  return (
    <DSSection id="icons" eyebrow="Componentes" title="Iconografia — sistema de 24 line-icons">
      <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 720, marginTop: -16, marginBottom: 28, lineHeight: 1.55 }}>
        Grid 24×24 · keyline 20px · stroke 1.6px · linecap e linejoin redondos · cantos 2px. Somente linhas abertas, sem preenchimento. Tamanho padrão 20px; 16px em botões secundários, 24–28px em telas ampliadas (Modo TV / Apresentação).
      </p>

      {/* Construction specimen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontWeight: 500, marginBottom: 14 }}>Construção</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 160, height: 160, background: 'var(--neutral-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)' }}>
              {/* grid lines */}
              <svg width="160" height="160" viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
                <g stroke="oklch(0.70 0.04 210 / 0.35)" strokeWidth="0.05">
                  {Array.from({length: 25}).map((_, i) => (<line key={`v${i}`} x1={i} y1="0" x2={i} y2="24"/>))}
                  {Array.from({length: 25}).map((_, i) => (<line key={`h${i}`} x1="0" y1={i} x2="24" y2={i}/>))}
                </g>
                {/* keyline 20x20 */}
                <rect x="2" y="2" width="20" height="20" fill="none" stroke="oklch(0.70 0.10 30 / 0.6)" strokeWidth="0.12" strokeDasharray="0.4 0.4"/>
                {/* circle keyline */}
                <circle cx="12" cy="12" r="10" fill="none" stroke="oklch(0.70 0.10 30 / 0.3)" strokeWidth="0.1"/>
                {/* example icon (Scan) */}
                <g stroke="var(--brand-primary-800)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h2M16 20h2a2 2 0 0 0 2-2v-2"/>
                  <path d="M3.5 12h17"/>
                </g>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)' }}>
              <div><span style={{ color: 'oklch(0.65 0.10 30)' }}>■</span> viewBox 24×24</div>
              <div><span style={{ color: 'oklch(0.65 0.10 30 / 0.7)' }}>▢</span> keyline 20×20</div>
              <div>stroke 1.6px</div>
              <div>linecap round</div>
              <div>radius 2px</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 28, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontWeight: 500, marginBottom: 14 }}>Escala</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, justifyContent: 'space-around' }}>
            {[[14, '14 · inline'], [16, '16 · botão sm'], [20, '20 · padrão'], [24, '24 · TV'], [28, '28 · Apresent.']].map(([s, l]) => (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', height: 40 }}>
                  <Icon.Scan s={s} c="var(--brand-primary-800)"/>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)', marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full catalog grouped */}
      <div style={{ background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        {ICON_CATALOG.map((g, gi) => (
          <div key={g.group} style={{ borderTop: gi > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ padding: '18px 24px 12px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)' }}>{g.group}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)' }}>{g.items.length} ícone{g.items.length > 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '0 16px 20px' }}>
              {g.items.map(([name, desc]) => {
                const Ico = Icon[name];
                return (
                  <div key={name} style={{ padding: 16, borderRadius: 'var(--r-md)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-sm)',
                      background: 'var(--neutral-100)', display: 'grid', placeItems: 'center',
                      color: 'var(--brand-primary-800)', flexShrink: 0,
                    }}><Ico s={22} c="currentColor"/></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)' }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Color treatments */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 12 }}>Tratamentos de cor</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {strokeColors.map(([label, stroke, bg]) => {
            const isDark = bg === 'var(--neutral-1000)' || bg === 'var(--brand-primary-700)';
            return (
            <div key={label} style={{
              padding: 20, background: bg, borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Icon.Camera s={22} c={stroke}/>
                <Icon.Scan s={22} c={stroke}/>
                <Icon.Chart s={22} c={stroke}/>
                <Icon.Tv s={22} c={stroke}/>
              </div>
              <div style={{ fontSize: 12, color: isDark ? 'var(--neutral-300)' : 'var(--text-muted)' }}>{label}</div>
            </div>
          );})}
        </div>
      </div>

      {/* Usage in context */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 12 }}>Em uso</div>
        <div style={{ padding: 24, background: 'var(--neutral-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button variant="primary" icon={<Icon.Camera s={16} c="currentColor"/>}>Capturar</Button>
          <Button variant="secondary" icon={<Icon.Upload s={16} c="currentColor"/>}>Enviar arquivo</Button>
          <Button variant="secondary" icon={<Icon.Download s={16} c="currentColor"/>}>Exportar foto</Button>
          <Button variant="primary" icon={<Icon.Fullscreen s={16} c="currentColor"/>}>Apresentar</Button>
          <Button variant="ghost" icon={<Icon.Compare s={16} c="currentColor"/>}>Comparar</Button>
          <Button variant="quiet" icon={<Icon.More s={16} c="currentColor"/>}>Mais</Button>
          <Badge tone="success" icon={<Icon.Tv s={13} c="currentColor"/>}>Apple TV conectada</Badge>
          <Badge tone="info" icon={<Icon.Calendar s={13} c="currentColor"/>}>Segunda consulta</Badge>
          <Badge tone="brand" icon={<Icon.FaceLandmark s={13} c="currentColor"/>}>Detecção ativa</Badge>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 16, background: 'var(--neutral-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--text-body)', fontWeight: 500 }}>Regras de uso:</strong> ícones nunca carregam informação crítica sozinhos — sempre acompanhados de texto. Não inflar stroke &gt; 2px. Não usar cor de módulo como cor do ícone (reservada para a identidade dos cards). Em fundo escuro, usar neutral-100; em fundo de marca, neutral-0.
      </div>
    </DSSection>
  );
}

function DSDark() {
  return (
    <DSSection id="dark" eyebrow="Componentes" title="Variantes escuras — Modo Apresentação">
      <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 720, marginTop: -16, marginBottom: 28, lineHeight: 1.55 }}>
        Sobre fundo <code style={{ fontFamily: 'var(--ff-mono)' }}>neutral-1000</code>: superfícies feitas com brancos de baixa opacidade (0.04 – 0.08) em vez de sombras. O botão primário migra para âmbar sobre texto escuro — lido à distância em TV sem gritar. Todos os pares mantêm WCAG AA+.
      </p>

      <div style={{
        padding: 32, background: 'var(--neutral-1000)', borderRadius: 'var(--r-lg)',
        color: 'var(--neutral-100)',
      }}>
        {/* Buttons */}
        <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neutral-400)', fontWeight: 500, marginBottom: 12 }}>Botões</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
          <DarkButton variant="primary" icon={<Icon.Fullscreen s={16} c="currentColor"/>}>Apresentar</DarkButton>
          <DarkButton variant="secondary" icon={<Icon.Download s={16} c="currentColor"/>}>Exportar foto</DarkButton>
          <DarkButton variant="ghost">Ocultar overlays</DarkButton>
          <DarkButton variant="quiet" icon={<Icon.Compare s={16} c="currentColor"/>}>Comparar</DarkButton>
          <DarkButton variant="primary" size="lg" icon={<Icon.Play s={16} c="currentColor"/>}>Reanalisar</DarkButton>
          <DarkButton variant="secondary" size="sm">Sair</DarkButton>
          <DarkButton variant="primary" disabled>Desabilitado</DarkButton>
        </div>

        {/* Badges */}
        <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neutral-400)', fontWeight: 500, marginBottom: 12 }}>Badges de classificação</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
          <DarkBadge tone="success" size="lg">Severidade: Leve</DarkBadge>
          <DarkBadge tone="attention" size="lg">Severidade: Moderada</DarkBadge>
          <DarkBadge tone="alert" size="lg">Severidade: Acentuada</DarkBadge>
          <DarkBadge tone="brand" size="lg">Perfil: Pele Mista</DarkBadge>
          <DarkBadge tone="success" size="lg">Sinais Suaves</DarkBadge>
          <DarkBadge tone="info" size="lg">Em observação</DarkBadge>
          <DarkBadge tone="acne">Acne</DarkBadge>
          <DarkBadge tone="melasma">Melasma</DarkBadge>
          <DarkBadge tone="textura">Textura</DarkBadge>
          <DarkBadge tone="expression">Expressão</DarkBadge>
        </div>

        {/* Cards + bars + panel */}
        <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neutral-400)', fontWeight: 500, marginBottom: 12 }}>Superfícies & gráficos</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <DarkCard emphasis="default" padding={24}>
            <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Classificação geral</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <DarkBadge tone="success" size="lg">Leve</DarkBadge>
              <span style={{ fontSize: 14, color: 'var(--neutral-300)' }}>Severidade geral</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DarkBarRow label="Zona T (testa/nariz)" value={62} color="var(--mod-acne)"/>
              <DarkBarRow label="Bochecha direita" value={28} color="var(--mod-acne)"/>
              <DarkBarRow label="Bochecha esquerda" value={34} color="var(--mod-acne)"/>
            </div>
          </DarkCard>

          <DarkCard emphasis="raised" padding={24}>
            <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              {[['Lesões ativas', '7'], ['Pós-inflamatórias', '3'], ['Índice GAGS', '11/45']].map(([k, v], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--neutral-400)', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--neutral-0)', letterSpacing: '-0.02em' }}>{v}</div>
                </div>
              ))}
            </div>
            <DarkInfoPanel>
              Os números apoiam a conversa — não substituem a avaliação clínica.
            </DarkInfoPanel>
          </DarkCard>
        </div>

        {/* Amplified (TV-scale) sample */}
        <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neutral-400)', fontWeight: 500, marginBottom: 12 }}>Tipografia amplificada (apresentação)</div>
        <DarkCard emphasis="inset" padding={32}>
          <div style={{ fontSize: 14, fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-400)', marginBottom: 12 }}>Resultado da análise</div>
          <div style={{ fontSize: 72, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--neutral-0)', marginBottom: 10 }}>Sinais Suaves</div>
          <div style={{ fontSize: 22, color: 'var(--neutral-300)', marginBottom: 28, maxWidth: 640, lineHeight: 1.35 }}>Padrão esperado para a faixa etária; concentração sutil na região periorbital.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <DarkBarRow amplified label="Fronte (horizontais)" value={42} color="var(--mod-expression)"/>
            <DarkBarRow amplified label="Glabela (vertical)" value={28} color="var(--mod-expression)"/>
            <DarkBarRow amplified label="Periorbital" value={55} color="var(--mod-expression)"/>
          </div>
        </DarkCard>
      </div>

      <div style={{ marginTop: 16, padding: 16, background: 'var(--neutral-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--text-body)', fontWeight: 500 }}>Regras do modo escuro:</strong> nada de sombras — profundidade por opacidade. Primary migra para âmbar (contraste alto sobre neutral-1000). Separadores são <code style={{ fontFamily: 'var(--ff-mono)' }}>oklch(1 0 0 / 0.08)</code>. Cores de módulo são reusadas tal qual — são calibradas para funcionar nos dois temas.
      </div>
    </DSSection>
  );
}

Object.assign(window, { DSSection, DSOverview, DSLogo, DSColors, DSType, DSGeometry, DSComponents, DSVoice, DSIcons, DSDark, Swatch, PaletteRow });

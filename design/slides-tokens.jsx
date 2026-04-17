// ============================================================
// DermaPro — Slides de Tokens (paleta, type, geometria, logo)
// ============================================================

// ── Slide helpers ────────────────────────────────────────────
const SlideShell = ({ eyebrow, title, sub, children, contentStyle }) => (
  <div className="slide-pad">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>}
        <h1 className="slide-h1">{title}</h1>
        {sub && <p className="sub" style={{ marginTop: 16, maxWidth: 780 }}>{sub}</p>}
      </div>
      <DermaWordmark size={18} color="var(--ink-8)" markSize={26} />
    </div>
    <div style={{ flex: 1, minHeight: 0, ...contentStyle }}>
      {children}
    </div>
  </div>
);

// ── Slide 01: Capa ───────────────────────────────────────────
const SlideCover = () => (
  <div className="slide" style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(60% 60% at 30% 30%, rgba(31,89,98,0.22), transparent 60%), radial-gradient(55% 55% at 80% 75%, rgba(210,165,86,0.10), transparent 65%)'
    }} />
    <div className="slide-pad" style={{ position: 'relative', justifyContent: 'space-between' }}>
      <DermaWordmark size={22} color="var(--ink-9)" markSize={32} />
      <div>
        <div className="eyebrow" style={{ marginBottom: 24 }}>Design System · v0.1</div>
        <h1 className="display" style={{ fontSize: 120, lineHeight: 0.95, letterSpacing: '-0.03em' }}>
          Derma<span style={{ color: 'var(--primary-300)' }}>Pro</span>
        </h1>
        <p className="sub" style={{ fontSize: 26, marginTop: 32, maxWidth: 920 }}>
          Análise visual da pele, feita no consultório.<br/>
          Sóbria, clínica, acolhedora — sem ser hospitalar.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span className="chip"><span className="chip-dot" style={{ background: 'var(--mod-acne)' }} />Acne</span>
        <span className="chip"><span className="chip-dot" style={{ background: 'var(--mod-melasma)' }} />Melasma</span>
        <span className="chip"><span className="chip-dot" style={{ background: 'var(--mod-texture)' }} />Textura</span>
        <span className="chip"><span className="chip-dot" style={{ background: 'var(--mod-signs)' }} />Sinais de Expressão</span>
        <span className="chip" style={{ opacity: 0.55 }}><span className="chip-dot" style={{ background: 'var(--mod-rosacea)' }} />Rosácea <span style={{ color: 'var(--ink-7)' }}>· em breve</span></span>
        <span className="chip" style={{ opacity: 0.55 }}><span className="chip-dot" style={{ background: 'var(--mod-struct)' }} />Estrutura <span style={{ color: 'var(--ink-7)' }}>· em breve</span></span>
      </div>
    </div>
  </div>
);

// ── Slide 02: Princípios ─────────────────────────────────────
const SlidePrinciples = () => {
  const items = [
    { k: 'Sóbrio', not: 'não frio', d: 'Paleta profunda e quente. Nunca azul-hospitalar.' },
    { k: 'Clínico', not: 'não hospitalar', d: 'Tipografia, dados e hierarquia precisos. Zero ruído decorativo.' },
    { k: 'Moderno', not: 'não tech-bro', d: 'Sem gradientes agressivos, sem neon, sem emoji.' },
    { k: 'Acolhedor', not: 'não infantilizado', d: 'Curvas suaves, densidade generosa, tom humano.' },
  ];
  return (
    <div className="slide">
      <SlideShell eyebrow="Tom" title="Princípios" sub="Quatro eixos que orientam toda decisão visual do produto.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {items.map((it) => (
            <div key={it.k} className="card card-pad" style={{ padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--ink-11)' }}>{it.k}</span>
                <span style={{ fontSize: 16, color: 'var(--ink-7)' }}>· {it.not}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--ink-8)', fontSize: 17, lineHeight: 1.5 }}>{it.d}</p>
            </div>
          ))}
        </div>
      </SlideShell>
    </div>
  );
};

// ── Slide 03: Paleta ─────────────────────────────────────────
const Swatch = ({ name, token, hex, dark, big, note }) => (
  <div style={{
    background: hex,
    borderRadius: 12,
    padding: big ? '24px 20px' : '16px 14px',
    color: dark ? 'var(--ink-11)' : 'rgba(11,13,16,0.85)',
    minHeight: big ? 140 : 88,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(255,255,255,0.05)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, opacity: 0.75 }}>
      <span>{name}</span>
      {note && <span>{note}</span>}
    </div>
    <div>
      <div style={{ fontSize: big ? 17 : 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{token}</div>
      <div className="mono" style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{hex}</div>
    </div>
  </div>
);

const SlidePaletteCore = () => (
  <div className="slide">
    <SlideShell eyebrow="01 Cores" title="Paleta essencial" sub="Azul petróleo profundo, bege quente, âmbar. Um trio com temperatura — distante de clínicas frias, próximo de ateliês como Aesop.">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24, height: '100%' }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12, color: 'var(--ink-7)' }}>Primária · Azul Petróleo</div>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', gap: 8, height: 'calc(100% - 28px)' }}>
            <Swatch name="50"  token="primary-50"  hex="#e6f0f2" />
            <Swatch name="200" token="primary-200" hex="#8dbac2" />
            <Swatch name="300" token="primary-300" hex="#5a97a2" dark />
            <Swatch name="500" token="primary-500" hex="#1f5962" dark note="base" />
            <Swatch name="600" token="primary-600" hex="#17464d" dark />
            <Swatch name="800" token="primary-800" hex="#0b2528" dark />
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12, color: 'var(--ink-7)' }}>Secundária · Bege Quente</div>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gap: 8, height: 'calc(100% - 28px)' }}>
            <Swatch name="50"  token="warm-50"  hex="#f4ede2" />
            <Swatch name="200" token="warm-200" hex="#d5c3a3" />
            <Swatch name="300" token="warm-300" hex="#b8a27e" />
            <Swatch name="500" token="warm-500" hex="#7d6a49" dark />
            <Swatch name="600" token="warm-600" hex="#5d4e34" dark />
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12, color: 'var(--ink-7)' }}>Accent · Âmbar</div>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: 8, height: 'calc(100% - 28px)' }}>
            <Swatch name="200" token="amber-200" hex="#f1d9a3" />
            <Swatch name="300" token="amber-300" hex="#e3c07a" />
            <Swatch name="400" token="amber-400" hex="#d2a556" note="base" />
            <Swatch name="500" token="amber-500" hex="#b68a3f" dark />
          </div>
        </div>
      </div>
    </SlideShell>
  </div>
);

const SlidePaletteSemantic = () => {
  const sems = [
    { k: 'Info', v: '#5a8fa8', use: 'Neutra / informativa. Ex: \u201cFoto enviada\u201d, dicas.' },
    { k: 'Sucesso', v: '#7a9661', use: 'Verde oliva, nada saturado. Ex: análise concluída.' },
    { k: 'Atenção', v: '#d2a556', use: 'Âmbar. Requer revisão do médico — nunca urgência.' },
    { k: 'Alerta', v: '#a65a5a', use: 'Vinho suave. Substitui o vermelho intenso (proibido).' },
  ];
  const mods = [
    { k: 'Acne', v: 'var(--mod-acne)' },
    { k: 'Melasma', v: 'var(--mod-melasma)' },
    { k: 'Textura', v: 'var(--mod-texture)' },
    { k: 'Sinais', v: 'var(--mod-signs)' },
    { k: 'Rosácea', v: 'var(--mod-rosacea)', soon: true },
    { k: 'Estrutura', v: 'var(--mod-struct)', soon: true },
  ];
  const overlays = [
    { k: 'Lesão acneica', v: 'var(--overlay-lesion)', desc: 'Bounding box' },
    { k: 'Hiperpigmentação', v: 'var(--overlay-pigment)', desc: 'Mask fill' },
    { k: 'Brilho', v: 'var(--overlay-shine)', desc: 'Heat blur' },
    { k: 'Linhas', v: 'var(--overlay-lines)', desc: 'Stroke' },
  ];
  return (
    <div className="slide">
      <SlideShell eyebrow="02 Cores" title="Semânticas, módulos e overlays" sub="Zero vermelho intenso. Alerta é vinho; atenção é âmbar. Os quatro tons de módulo são distintos, mas vizinhos na roda.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, height: '100%' }}>

          {/* Left column: Semantics + Overlays */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12, color: 'var(--ink-7)' }}>Semânticas</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {sems.map(s => (
                  <div key={s.k} className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: s.v, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-11)' }}>{s.k}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-8)', marginTop: 2, lineHeight: 1.35 }}>{s.use}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12, color: 'var(--ink-7)' }}>Overlays de análise · semitransparentes</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {overlays.map(o => (
                  <div key={o.k} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                      height: 72,
                      background: 'linear-gradient(135deg, #2a2f3a 0%, #191d25 100%)',
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', inset: '14px 20px', background: o.v, borderRadius: 6 }} />
                    </div>
                    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--ink-4)' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-10)' }}>{o.k}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-7)' }}>{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Modules */}
          <div>
            <div className="eyebrow" style={{ fontSize: 11, marginBottom: 12, color: 'var(--ink-7)' }}>Identidade dos módulos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {mods.map(m => (
                <div key={m.k} className="card" style={{
                  padding: 20,
                  display: 'flex', flexDirection: 'column', gap: 10,
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: m.soon ? 0.55 : 1,
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: m.v, opacity: 0.08 }} />
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: m.v, position: 'relative' }} />
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-11)', position: 'relative' }}>
                    {m.k} {m.soon && <span style={{ fontSize: 11, color: 'var(--ink-7)', fontWeight: 400 }}>· em breve</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'var(--ink-2)', border: '1px solid var(--ink-4)', fontSize: 13, color: 'var(--ink-8)', lineHeight: 1.5 }}>
              Os tons são usados como wash no card (≈10% opacidade, <span className="mono" style={{ color: 'var(--ink-9)' }}>--mod-intensity</span>) + ícone em cor plena. Permite hierarquia sem competir com a UI.
            </div>
          </div>
        </div>
      </SlideShell>
    </div>
  );
};

// ── Slide 04: Tipografia ─────────────────────────────────────
const SlideTypography = () => {
  const rows = [
    { k: 'Display', size: '64 / 72px', weight: 'Semibold', spec: 'DM Sans · -0.03em · 1.05', sample: 'Análise em tempo real.' },
    { k: 'H1',      size: '40 / 52px', weight: 'Semibold', spec: '-0.02em · 1.08',            sample: 'Pele Mista' },
    { k: 'H2',      size: '28 / 32px', weight: 'Semibold', spec: '-0.01em · 1.2',             sample: 'Distribuição por região' },
    { k: 'H3',      size: '20px',      weight: 'Medium',   spec: '0 · 1.3',                   sample: 'Resultado da análise' },
    { k: 'Body',    size: '16px',      weight: 'Regular',  spec: '0 · 1.5',                   sample: 'Foram detectadas 12 lesões ativas, predominantemente na região perioral.' },
    { k: 'Small',   size: '14px',      weight: 'Regular',  spec: '0 · 1.45',                  sample: 'Última análise: há 2 dias' },
    { k: 'Caption', size: '12px',      weight: 'Medium',   spec: '0.08em · 1.3 · UPPERCASE',  sample: 'SEVERIDADE' },
  ];
  return (
    <div className="slide">
      <SlideShell eyebrow="03 Type" title="DM Sans · geométrica humanista" sub="Três pesos (Regular, Medium, Semibold). Legibilidade em laptop e a 2–3 m no Modo Apresentação.">
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
          {rows.map((r, i) => (
            <div key={r.k} style={{
              display: 'grid',
              gridTemplateColumns: '110px 120px 110px 1fr',
              gap: 24,
              padding: '18px 28px',
              alignItems: 'baseline',
              borderBottom: i < rows.length - 1 ? '1px solid var(--ink-4)' : 'none',
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-7)' }}>{r.k}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-8)' }}>{r.size}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-8)' }}>{r.weight}</div>
              <div style={{
                fontSize: r.k === 'Display' ? 40 : r.k === 'H1' ? 32 : r.k === 'H2' ? 26 : r.k === 'H3' ? 20 : r.k === 'Body' ? 16 : r.k === 'Small' ? 14 : 12,
                fontWeight: r.weight === 'Semibold' ? 600 : r.weight === 'Medium' ? 500 : 400,
                letterSpacing: r.k === 'Display' ? '-0.03em' : r.k === 'H1' ? '-0.02em' : r.k === 'H2' ? '-0.01em' : r.k === 'Caption' ? '0.08em' : 0,
                textTransform: r.k === 'Caption' ? 'uppercase' : 'none',
                color: 'var(--ink-11)',
                lineHeight: 1.2,
              }}>
                {r.sample}
              </div>
            </div>
          ))}
        </div>
      </SlideShell>
    </div>
  );
};

// ── Slide 05: Geometria ──────────────────────────────────────
const SlideGeometry = () => (
  <div className="slide">
    <SlideShell eyebrow="04 Geometria" title="Espaçamento, raio, sombras" sub="Escala 4/8 compatível com Tailwind. Raios sutis (8–14px). Sombras com blur generoso.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, height: '100%' }}>

        {/* Spacing */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)' }}>Spacing · 4 / 8</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{k:'1',v:4},{k:'2',v:8},{k:'3',v:12},{k:'4',v:16},{k:'6',v:24},{k:'8',v:32},{k:'12',v:48},{k:'16',v:64}].map(s => (
              <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink-8)', width: 42 }}>--s-{s.k}</div>
                <div style={{ width: s.v, height: 8, background: 'var(--primary-400)', borderRadius: 2 }} />
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink-9)' }}>{s.v}px</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radii */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)' }}>Radii</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { k: 'sm', v: 6 }, { k: 'md (padrão)', v: 10 },
              { k: 'lg', v: 14 }, { k: 'xl', v: 20 },
            ].map(r => (
              <div key={r.k} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  width: '100%', aspectRatio: '1.6 / 1',
                  background: 'color-mix(in oklab, var(--primary-500) 35%, var(--ink-2))',
                  border: '1px solid var(--primary-400)',
                  borderRadius: r.v,
                }} />
                <div style={{ fontSize: 13, color: 'var(--ink-9)', fontWeight: 500 }}>{r.k}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-7)' }}>{r.v}px</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shadows */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)' }}>Elevation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { k: 'shadow-1', v: 'var(--shadow-1)', desc: 'listas, chips' },
              { k: 'shadow-2', v: 'var(--shadow-2)', desc: 'cards elevados' },
              { k: 'shadow-3', v: 'var(--shadow-3)', desc: 'modal, popover' },
              { k: 'shadow-glow', v: 'var(--shadow-glow)', desc: 'foco / ativo' },
            ].map(sh => (
              <div key={sh.k} style={{
                background: 'var(--ink-1)', padding: 18, borderRadius: 10,
                boxShadow: sh.v,
                border: '1px solid var(--ink-4)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink-9)' }}>{sh.k}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-7)' }}>{sh.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  </div>
);

// ── Slide 06: Logo ───────────────────────────────────────────
const SlideLogo = () => (
  <div className="slide">
    <SlideShell eyebrow="05 Marca" title="Logo DermaPro" sub="Círculo (rosto visto de frente) + curva sutil (análise / sorriso discreto) + ponto (landmark MediaPipe). Monocromático.">
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, height: '100%' }}>

        {/* Hero */}
        <div className="card" style={{
          padding: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(80% 80% at 50% 45%, rgba(31,89,98,0.18), transparent 70%), var(--ink-2)',
        }}>
          <DermaWordmark size={92} color="var(--ink-11)" markSize={140} gap={28} />
        </div>

        {/* Variants */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
            <div style={{ background: 'var(--ink-0)', borderRadius: 10, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DermaMark size={80} color="var(--ink-11)" />
            </div>
            <div style={{ background: '#f4f6f9', borderRadius: 10, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DermaMark size={80} color="#11141a" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-8)', gridColumn: '1 / -1' }}>Funciona em fundo escuro e claro (WCAG AA+).</div>
          </div>
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)' }}>Escalas mínimas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <DermaMark size={72} color="var(--ink-11)" />
              <DermaMark size={48} color="var(--ink-11)" />
              <DermaMark size={32} color="var(--ink-11)" />
              <DermaMark size={20} color="var(--ink-11)" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-8)', marginTop: 4 }}>
              Mínimo de <span className="mono" style={{ color: 'var(--ink-10)' }}>20px</span> para o símbolo; <span className="mono" style={{ color: 'var(--ink-10)' }}>14px</span> para a wordmark.
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  </div>
);

Object.assign(window, {
  SlideShell, SlideCover, SlidePrinciples,
  SlidePaletteCore, SlidePaletteSemantic,
  SlideTypography, SlideGeometry, SlideLogo,
});

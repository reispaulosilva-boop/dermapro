// ============================================================
// DermaPro — App mockup: Hub + Análise + Modo Apresentação
// ============================================================

const MODULES = [
  { id: 'acne',    name: 'Acne',             desc: 'Contagem e distribuição de lesões ativas por região.', color: 'var(--mod-acne)',    Icon: IconAcne,    count: '12 análises' },
  { id: 'melasma', name: 'Melasma',          desc: 'Mapeamento de hiperpigmentação por intensidade.',       color: 'var(--mod-melasma)', Icon: IconMelasma, count: '7 análises' },
  { id: 'texture', name: 'Textura',          desc: 'Poros dilatados, áreas de oleosidade e brilho.',        color: 'var(--mod-texture)', Icon: IconTexture, count: '9 análises' },
  { id: 'signs',   name: 'Sinais de Expressão', desc: 'Linhas dinâmicas e profundidade por região.',       color: 'var(--mod-signs)',   Icon: IconSigns,   count: '4 análises' },
  { id: 'rosacea', name: 'Rosácea',          desc: 'Detecção de eritema e padrões vasculares.',             color: 'var(--mod-rosacea)', Icon: IconRosacea, soon: true },
  { id: 'struct',  name: 'Estrutura Facial', desc: 'Landmarks e proporções de harmonização.',               color: 'var(--mod-struct)',  Icon: IconStructure, soon: true },
];

const Sidebar = ({ active = 'home' }) => (
  <aside className="app-sidebar">
    <div style={{ padding: '4px 8px 20px' }}>
      <DermaWordmark size={15} color="var(--ink-10)" markSize={22} />
    </div>
    <div className="side-item" data-active={active === 'home' ? '' : undefined}>
      <span className="side-icon"><IconHome size={18} /></span>Hub
    </div>
    <div className="side-item" data-active={active === 'patients' ? '' : undefined}>
      <span className="side-icon"><IconFolder size={18} /></span>Pacientes
    </div>
    <div className="side-item" data-active={active === 'history' ? '' : undefined}>
      <span className="side-icon"><IconHistory size={18} /></span>Histórico
    </div>
    <div style={{ flex: 1 }} />
    <div className="side-item"><span className="side-icon"><IconPresent size={18} /></span>Modo apresentação</div>
    <div className="side-item"><span className="side-icon"><IconSettings size={18} /></span>Ajustes</div>
    <div style={{
      marginTop: 8, padding: '10px 12px', borderRadius: 10,
      background: 'var(--ink-2)', border: '1px solid var(--ink-4)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--warm-300)', color: 'var(--ink-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>CM</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-10)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dra. Clara Mota</div>
        <div style={{ fontSize: 11, color: 'var(--ink-7)' }}>CRM 143.228</div>
      </div>
    </div>
  </aside>
);

// ── Hub ──────────────────────────────────────────────────────
const SlideHub = () => (
  <div className="slide">
    <div className="app-frame">
      <Sidebar active="home" />
      <main className="app-main">
        <div className="app-main-head">
          <div>
            <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)', marginBottom: 8 }}>Hub · Consulta em andamento</div>
            <h1>Paciente: M. Andrade <span style={{ color: 'var(--ink-7)', fontWeight: 400, fontSize: 20 }}>· 34 anos</span></h1>
            <div className="lede">Escolha um módulo para iniciar a análise. Os resultados serão adicionados ao prontuário da sessão.</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="segmented">
              <button data-active>Laptop</button>
              <button>Apresentação</button>
            </div>
            <button className="btn btn-secondary"><IconPresent size={16} />Espelhar TV</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {MODULES.map(m => (
            <div
              key={m.id}
              className={`mod-card ${m.soon ? 'disabled' : ''}`}
              style={{ '--mod-color': m.color }}
            >
              <div className="m-head">
                <div className="mod-icon"><m.Icon size={22} /></div>
                {m.soon
                  ? <span className="badge badge-soft">Em breve</span>
                  : <span className="badge" style={{
                      background: 'color-mix(in oklab, ' + m.color + ' 18%, var(--ink-3))',
                      color: m.color,
                    }}><span className="dot" />Ativo</span>
                }
              </div>
              <div>
                <h3>{m.name}</h3>
                <div className="desc">{m.desc}</div>
              </div>
              <div className="m-foot">
                <span><span className="count">{m.count || '—'}</span>{m.count ? ' neste paciente' : 'disponível em breve'}</span>
                {!m.soon && <div className="arrow"><IconArrowRight size={14} /></div>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  </div>
);

// ── Análise ──────────────────────────────────────────────────
const FacePlaceholder = ({ showOverlays = false, module = 'acne' }) => {
  // Simple neutral silhouette + overlays
  return (
    <div className="face-ph" style={{ width: '100%', height: '100%', borderRadius: 10 }}>
      <svg viewBox="0 0 400 500" style={{ width: '80%', height: '90%' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#3a424f" />
            <stop offset="100%" stopColor="#1a1e26" />
          </radialGradient>
        </defs>
        {/* Face silhouette */}
        <ellipse cx="200" cy="240" rx="135" ry="175" fill="url(#faceGrad)" />
        {/* subtle features */}
        <ellipse cx="155" cy="215" rx="14" ry="6" fill="#0d1014" opacity="0.55" />
        <ellipse cx="245" cy="215" rx="14" ry="6" fill="#0d1014" opacity="0.55" />
        <path d="M175 325 Q 200 338, 225 325" stroke="#0d1014" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M198 258 Q 195 275, 200 282" stroke="#0d1014" strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round" />

        {showOverlays && module === 'acne' && (
          <>
            {/* bounding boxes */}
            {[
              [145, 290, 20, 20], [170, 305, 16, 16], [225, 295, 22, 18],
              [205, 330, 18, 14], [185, 345, 14, 14], [165, 275, 14, 14],
              [240, 270, 16, 14], [150, 325, 13, 13], [190, 310, 12, 12],
              [220, 340, 16, 14], [135, 255, 14, 14], [255, 310, 14, 14],
            ].map(([x,y,w,h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="3"
                    stroke="rgba(226,138,123,0.9)" strokeWidth="1.5"
                    fill="rgba(226,138,123,0.25)" />
            ))}
          </>
        )}
        {showOverlays && module === 'melasma' && (
          <>
            <ellipse cx="160" cy="210" rx="35" ry="22" fill="rgba(188,140,92,0.45)" />
            <ellipse cx="245" cy="208" rx="32" ry="20" fill="rgba(188,140,92,0.40)" />
            <ellipse cx="200" cy="180" rx="28" ry="12" fill="rgba(188,140,92,0.30)" />
          </>
        )}
        {showOverlays && module === 'texture' && (
          <>
            <ellipse cx="200" cy="195" rx="30" ry="18" fill="rgba(238,213,140,0.40)" />
            <ellipse cx="155" cy="240" rx="22" ry="14" fill="rgba(238,213,140,0.32)" />
            <ellipse cx="245" cy="240" rx="22" ry="14" fill="rgba(238,213,140,0.32)" />
          </>
        )}
        {showOverlays && module === 'signs' && (
          <>
            <path d="M130 195 Q 150 190, 170 195" stroke="rgba(172,150,194,0.85)" strokeWidth="2" fill="none" />
            <path d="M128 205 Q 148 201, 168 207" stroke="rgba(172,150,194,0.6)" strokeWidth="1.5" fill="none" />
            <path d="M230 195 Q 250 190, 270 195" stroke="rgba(172,150,194,0.85)" strokeWidth="2" fill="none" />
            <path d="M232 205 Q 252 201, 272 207" stroke="rgba(172,150,194,0.6)" strokeWidth="1.5" fill="none" />
            <path d="M178 160 Q 200 155, 222 160" stroke="rgba(172,150,194,0.7)" strokeWidth="2" fill="none" />
            <path d="M178 172 Q 200 168, 222 172" stroke="rgba(172,150,194,0.5)" strokeWidth="1.5" fill="none" />
          </>
        )}
      </svg>
    </div>
  );
};

const SlideAnalysis = () => {
  const [state, setState] = React.useState('upload'); // upload | analyzing | result
  const [module] = React.useState('acne');
  const modColor = 'var(--mod-acne)';

  React.useEffect(() => {
    let t;
    if (state === 'analyzing') {
      t = setTimeout(() => setState('result'), 2400);
    }
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div className="slide">
      <div className="app-frame">
        <Sidebar active="home" />
        <main className="app-main">
          <div className="app-main-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: '0 10px 0 8px' }}>
                <IconChevron size={14} style={{ transform: 'rotate(180deg)' }} />Hub
              </button>
              <div>
                <div className="eyebrow" style={{ fontSize: 11, color: modColor, marginBottom: 6 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: modColor, marginRight: 8, verticalAlign: 'middle' }} />
                  Módulo Acne
                </div>
                <h1>Análise de lesões ativas</h1>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {state === 'result' && (
                <>
                  <button className="btn btn-secondary"><IconDownload size={16} />Baixar foto</button>
                  <button className="btn btn-primary"><IconPresent size={16} />Modo Apresentação</button>
                </>
              )}
              {state === 'upload' && (
                <button className="btn btn-secondary" onClick={() => setState('result')}>
                  Usar foto demo
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, flex: 1, minHeight: 0 }}>
            {/* Left: image/upload area */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: 520 }}>
              {state === 'upload' && (
                <div className="dropzone" style={{ flex: 1 }} onClick={() => setState('analyzing')}>
                  <div className="icon-wrap"><IconUpload size={26} /></div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-11)' }}>Arraste uma foto ou clique para enviar</div>
                  <div style={{ fontSize: 14, color: 'var(--ink-8)', maxWidth: 360 }}>
                    Frontal, iluminação neutra, sem maquiagem. Recomendado: 1080p ou superior.
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setState('analyzing'); }}>
                      <IconUpload size={16} />Enviar foto
                    </button>
                    <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setState('analyzing'); }}>
                      Usar webcam
                    </button>
                  </div>
                </div>
              )}
              {(state === 'analyzing' || state === 'result') && (
                <div style={{ position: 'relative', flex: 1, minHeight: 440, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <FacePlaceholder showOverlays={state === 'result'} module={module} />
                    {state === 'analyzing' && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: 14,
                        background: 'rgba(11,13,16,0.35)',
                        borderRadius: 10,
                      }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%',
                          border: '2.5px solid var(--ink-4)',
                          borderTopColor: 'var(--primary-300)',
                          animation: 'spin 900ms linear infinite',
                        }} />
                        <div style={{ fontSize: 15, color: 'var(--ink-10)', fontWeight: 500 }}>Analisando…</div>
                        <div style={{ fontSize: 13, color: 'var(--ink-8)' }}>Detectando lesões e distribuição por região</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-soft"><span className="dot" style={{ background: 'rgba(226,138,123,0.9)' }} />Lesões</span>
                      <span className="badge badge-soft"><span className="dot" style={{ background: 'var(--ink-7)' }} />Landmarks</span>
                      <span className="badge badge-soft"><span className="dot" style={{ background: 'var(--ink-7)' }} />Regiões</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setState('upload')}>Enviar outra foto</button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
              <div className="card card-pad" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-11)' }}>Resumo</div>
                  {state === 'result'
                    ? <ClassBadge label="Severidade" value="Leve" color={modColor} />
                    : <span className="badge badge-soft">{state === 'analyzing' ? 'Calculando…' : 'Aguardando foto'}</span>
                  }
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div className="stat">
                    <span className="k">Lesões</span>
                    <span className="v">{state === 'result' ? '66' : '—'}</span>
                  </div>
                  <div className="stat">
                    <span className="k">Densidade</span>
                    <span className="v" style={{ fontSize: 24 }}>{state === 'result' ? '2.3/cm²' : '—'}</span>
                  </div>
                  <div className="stat">
                    <span className="k">vs. último</span>
                    <span className="v" style={{ color: state === 'result' ? '#b0c99a' : 'var(--ink-9)' }}>
                      {state === 'result' ? '−14%' : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card card-pad" style={{ padding: 24, flex: 1, minHeight: 0 }}>
                <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)', marginBottom: 8 }}>Distribuição por região</div>
                <BarChart
                  color={modColor}
                  data={[
                    { label: 'Fronte',    value: state === 'result' ? 8 : 0 },
                    { label: 'Malar E',   value: state === 'result' ? 14 : 0 },
                    { label: 'Malar D',   value: state === 'result' ? 12 : 0 },
                    { label: 'Nasal',     value: state === 'result' ? 6 : 0 },
                    { label: 'Perioral',  value: state === 'result' ? 22 : 0 },
                    { label: 'Mento',     value: state === 'result' ? 4 : 0 },
                  ]}
                  max={30}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ── Modo Apresentação (fullscreen) ───────────────────────────
const SlidePresentation = () => (
  <div className="slide" style={{ background: 'var(--ink-0)', position: 'relative' }}>
    <div style={{ padding: '56px 80px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chrome minimal para modo TV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
        <DermaWordmark size={24} color="var(--ink-9)" markSize={36} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="badge" style={{ fontSize: 14, padding: '8px 14px', background: 'color-mix(in oklab, var(--mod-acne) 18%, var(--ink-3))', color: 'var(--mod-acne)' }}>
            <span className="dot" />Módulo Acne
          </span>
          <div style={{ fontSize: 14, color: 'var(--ink-7)' }}>Sessão · 17 abr 2026</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 56, flex: 1, minHeight: 0 }}>
        {/* Image */}
        <div style={{ background: 'var(--ink-1)', borderRadius: 20, border: '1px solid var(--ink-4)', padding: 28, display: 'flex' }}>
          <FacePlaceholder showOverlays module="acne" />
        </div>

        {/* Big numbers */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary-300)', marginBottom: 16 }}>
              Resultado da análise
            </div>
            <div style={{ fontSize: 88, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--ink-11)' }}>
              Severidade <span style={{ color: 'var(--mod-acne)' }}>Leve</span>
            </div>
            <div style={{ fontSize: 26, color: 'var(--ink-8)', marginTop: 20, lineHeight: 1.4, textWrap: 'pretty', maxWidth: 720 }}>
              66 lesões ativas, predominantemente na região perioral.
              Redução de 14% em relação à última consulta.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { k: 'Total', v: '66', s: 'lesões' },
              { k: 'Densidade', v: '2.3', s: '/cm²' },
              { k: 'Evolução', v: '−14%', s: 'vs. último', good: true },
            ].map(x => (
              <div key={x.k} style={{ padding: '24px 28px', borderRadius: 16, background: 'var(--ink-2)', border: '1px solid var(--ink-4)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-7)', marginBottom: 12 }}>{x.k}</div>
                <div style={{ fontSize: 52, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, color: x.good ? '#b0c99a' : 'var(--ink-11)' }}>{x.v}</div>
                <div style={{ fontSize: 16, color: 'var(--ink-8)', marginTop: 8 }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, color: 'var(--ink-7)' }}>
          DermaPro é ferramenta de apoio — diagnóstico final é sempre do profissional responsável.
        </div>
        <div style={{ fontSize: 15, color: 'var(--ink-7)' }}>Espelhado · Apple TV</div>
      </div>
    </div>
  </div>
);

Object.assign(window, { MODULES, Sidebar, FacePlaceholder, SlideHub, SlideAnalysis, SlidePresentation });

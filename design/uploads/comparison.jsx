/* Timeline / Comparison view — consulta anterior × atual */

function ComparisonScreen({ moduleId = 'melasma' }) {
  const color = `var(--mod-${moduleId})`;
  const soft  = `var(--mod-${moduleId}-soft)`;
  const [slider, setSlider] = useState(50);
  const [mode, setMode] = useState('split'); // 'split' | 'slider'
  const visits = COMPARISON_DATA[moduleId];

  return (
    <div style={{ padding: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Paciente Mariana S. · Módulo {MODULES.find(m=>m.id===moduleId)?.name}</div>
          <h2 style={{ fontSize: 28, fontWeight: 500, color: 'var(--text-strong)', margin: 0, letterSpacing: '-0.015em', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 8, height: 28, background: color, borderRadius: 4, display: 'inline-block' }}/>
            Evolução da análise
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: 4, background: 'var(--neutral-150)', borderRadius: 'var(--r-pill)' }}>
          {[['split','Lado a lado'],['slider','Sobreposto']].map(([id, l]) => (
            <button key={id} onClick={() => setMode(id)} style={{
              padding: '6px 14px', border: 'none', borderRadius: 'var(--r-pill)', cursor: 'pointer',
              background: mode === id ? 'var(--neutral-0)' : 'transparent',
              color: mode === id ? 'var(--text-strong)' : 'var(--text-muted)',
              fontWeight: 500, fontSize: 13, fontFamily: 'var(--ff-sans)',
              boxShadow: mode === id ? 'var(--sh-xs)' : 'none',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Timeline rail */}
      <TimelineRail visits={visits} color={color}/>

      {/* Comparison visual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginTop: 24 }}>
        {mode === 'split' ? <SplitCompare visits={visits} moduleId={moduleId}/> : <SliderCompare visits={visits} moduleId={moduleId} value={slider} onChange={setSlider}/>}
        <DeltaPanel visits={visits} color={color} soft={soft}/>
      </div>
    </div>
  );
}

function TimelineRail({ visits, color }) {
  return (
    <div style={{
      padding: '18px 24px', background: 'var(--neutral-0)',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', left: 24, right: 24, top: '50%', height: 2, background: 'var(--neutral-200)' }}/>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {visits.map((v, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{v.date}</div>
            <div style={{
              width: v.current ? 16 : 12, height: v.current ? 16 : 12, borderRadius: 999,
              background: v.current ? color : 'var(--neutral-0)',
              border: v.current ? `3px solid ${color}` : `2px solid var(--neutral-400)`,
              boxShadow: v.current ? `0 0 0 5px ${color}22` : 'none',
            }}/>
            <div style={{ fontSize: 12, color: v.current ? 'var(--text-strong)' : 'var(--text-muted)', fontWeight: v.current ? 500 : 400 }}>
              {v.label}
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)' }}>MASI {v.masi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitCompare({ visits, moduleId }) {
  const prev = visits[visits.length - 2];
  const curr = visits[visits.length - 1];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {[['Anterior', prev], ['Atual', curr]].map(([label, v], i) => (
        <Card key={i} padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--neutral-150)' }}>
            <FacePlaceholder/>
            <OverlayLayer moduleId={moduleId}/>
            <div style={{
              position: 'absolute', top: 14, left: 14,
              padding: '6px 12px', borderRadius: 'var(--r-pill)',
              background: 'oklch(0.20 0.008 60 / 0.82)', color: 'white',
              fontSize: 12, fontWeight: 500, backdropFilter: 'blur(8px)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: i === 1 ? `var(--mod-${moduleId})` : 'var(--neutral-400)' }}/>
              {label} · {v.date}
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Badge tone={v.tone}>{v.severity}</Badge>
            <span style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)' }}>MASI {v.masi}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SliderCompare({ visits, moduleId, value, onChange }) {
  const prev = visits[visits.length - 2];
  const curr = visits[visits.length - 1];
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--neutral-150)', userSelect: 'none' }}>
        <FacePlaceholder/>
        {/* anterior: no overlay (clean) */}
        <div style={{ position: 'absolute', inset: 0, width: `${value}%`, overflow: 'hidden' }}>
          <div style={{ width: `${10000/value}%`, height: '100%', position: 'relative' }}>
            <FacePlaceholder/>
            <OverlayLayer moduleId={moduleId}/>
          </div>
        </div>
        {/* divider */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${value}%`, width: 2, background: 'oklch(1 0 0 / 0.9)', transform: 'translateX(-1px)', pointerEvents: 'none' }}/>
        <div style={{
          position: 'absolute', top: '50%', left: `${value}%`, transform: 'translate(-50%, -50%)',
          width: 40, height: 40, borderRadius: 999, background: 'var(--neutral-0)',
          boxShadow: 'var(--sh-md)', display: 'grid', placeItems: 'center', pointerEvents: 'none',
          border: '1px solid var(--border-subtle)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary-700)" strokeWidth="2" strokeLinecap="round"><path d="M9 6 3 12l6 6M15 6l6 6-6 6"/></svg>
        </div>
        {/* labels */}
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'oklch(0.20 0.008 60 / 0.82)', color: 'white', fontSize: 12, fontWeight: 500, backdropFilter: 'blur(8px)' }}>Atual · {curr.date}</div>
        <div style={{ position: 'absolute', top: 14, right: 14, padding: '6px 12px', borderRadius: 'var(--r-pill)', background: 'oklch(0.20 0.008 60 / 0.82)', color: 'white', fontSize: 12, fontWeight: 500, backdropFilter: 'blur(8px)' }}>Anterior · {prev.date}</div>
        {/* slider input */}
        <input type="range" min="0" max="100" value={value} onChange={e => onChange(+e.target.value)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize' }}/>
      </div>
      <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        <span>Arraste para comparar</span>
        <span style={{ fontFamily: 'var(--ff-mono)' }}>{value}% atual · {100 - value}% anterior</span>
      </div>
    </Card>
  );
}

function DeltaPanel({ visits, color, soft }) {
  const prev = visits[visits.length - 2];
  const curr = visits[visits.length - 1];
  const delta = curr.masi - prev.masi;
  const trend = delta < -0.3 ? 'improve' : delta > 0.3 ? 'worsen' : 'stable';
  const trendMeta = {
    improve: { tone: 'success', label: 'Melhora', arrow: '↓', desc: 'Redução significativa em relação à consulta anterior.' },
    stable:  { tone: 'info',    label: 'Estável', arrow: '→', desc: 'Variação dentro da margem de erro do modelo.' },
    worsen:  { tone: 'attention', label: 'Piora',  arrow: '↑', desc: 'Aumento em relação à consulta anterior.' },
  }[trend];

  return (
    <Card padding={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)', fontWeight: 500, marginBottom: 12 }}>Δ Variação geral</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 44, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {trendMeta.arrow} {Math.abs(delta).toFixed(1)}
          </div>
          <Badge tone={trendMeta.tone} size="lg">{trendMeta.label}</Badge>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{trendMeta.desc}</div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)', fontWeight: 500, marginBottom: 14 }}>Por região</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {curr.regions.map((r, i) => (
            <RegionDelta key={i} region={r} prev={prev.regions[i]} color={color} soft={soft}/>
          ))}
        </div>
      </div>

      <div style={{ padding: 22, background: 'var(--neutral-50)', borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong style={{ fontWeight: 500, color: 'var(--text-body)' }}>Nota:</strong> variações &lt; 5% podem ser artefato de iluminação ou ângulo. Comparar sempre com fotos em condições semelhantes.
      </div>
    </Card>
  );
}

function RegionDelta({ region, prev, color, soft }) {
  const [label, curVal] = region;
  const pVal = prev[1];
  const d = curVal - pVal;
  const dColor = d < 0 ? 'var(--sem-success)' : d > 0 ? 'var(--sem-attention)' : 'var(--text-muted)';
  const dSign  = d > 0 ? '+' : '';
  const max = Math.max(curVal, pVal, 1);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-body)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', color: dColor, fontWeight: 500 }}>{dSign}{d.toFixed(0)}%</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: soft, borderRadius: 999 }}>
        {/* previous — ghost */}
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(pVal/max)*100}%`, background: 'var(--neutral-300)', borderRadius: 999 }}/>
        {/* current — solid color, on top */}
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(curVal/max)*100}%`, background: color, borderRadius: 999 }}/>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)' }}>Anterior {pVal}%</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)', fontWeight: 500 }}>Atual {curVal}%</span>
      </div>
    </div>
  );
}

const COMPARISON_DATA = {
  melasma: [
    { date: '08-nov-2025', label: '1ª consulta', masi: 9.8,  severity: 'Moderado', tone: 'attention', current: false, regions: [['Região malar', 82], ['Testa', 54], ['Buço', 38], ['Mento', 12]] },
    { date: '15-jan-2026', label: '2ª consulta', masi: 8.9,  severity: 'Moderado', tone: 'attention', current: false, regions: [['Região malar', 78], ['Testa', 50], ['Buço', 34], ['Mento', 10]] },
    { date: '17-abr-2026', label: '3ª consulta', masi: 7.6,  severity: 'Moderado',   tone: 'attention', current: true,  regions: [['Região malar', 68], ['Testa', 42], ['Buço', 28], ['Mento', 8]] },
  ],
  acne: [
    { date: '10-dez-2025', label: '1ª consulta', masi: 14, severity: 'Moderada', tone: 'attention', current: false, regions: [['Zona T', 74], ['Bochecha D', 42], ['Bochecha E', 48], ['Mento', 30]] },
    { date: '17-abr-2026', label: '2ª consulta', masi: 11, severity: 'Leve',    tone: 'success',   current: true,  regions: [['Zona T', 62], ['Bochecha D', 28], ['Bochecha E', 34], ['Mento', 18]] },
  ],
  textura: [
    { date: '05-fev-2026', label: '1ª consulta', masi: 66, severity: 'Pele Mista', tone: 'brand', current: false, regions: [['Zona T — oleo.', 84], ['Zona U — oleo.', 30], ['Poros — nariz', 72], ['Poros — bochecha', 44]] },
    { date: '17-abr-2026', label: '2ª consulta', masi: 58, severity: 'Pele Mista', tone: 'brand', current: true,  regions: [['Zona T — oleo.', 78], ['Zona U — oleo.', 24], ['Poros — nariz', 66], ['Poros — bochecha', 38]] },
  ],
  expression: [
    { date: '17-abr-2026', label: '1ª consulta', masi: 42, severity: 'Sinais Suaves', tone: 'success', current: true,  regions: [['Fronte', 42], ['Glabela', 28], ['Periorbital', 55], ['Nasolabial', 22]] },
    { date: '17-abr-2026', label: 'Atual',       masi: 42, severity: 'Sinais Suaves', tone: 'success', current: false, regions: [['Fronte', 42], ['Glabela', 28], ['Periorbital', 55], ['Nasolabial', 22]] },
  ].reverse(),
};

function DSComparison() {
  const [mod, setMod] = useState('melasma');
  return (
    <DSSection id="comparison" eyebrow="Telas-chave" title="Comparação de consultas — timeline">
      <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 720, marginTop: -16, marginBottom: 16, lineHeight: 1.55 }}>
        Timeline horizontal com todos os atendimentos do paciente naquele módulo. A consulta atual fica destacada. Dois modos de comparação: lado a lado (duas fotos) ou sobreposto com cortina deslizante. Painel Δ à direita mostra variação geral e por região (barra fantasma do anterior + barra colorida do atual).
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        {['melasma', 'acne', 'textura'].map(id => (
          <button key={id} onClick={() => setMod(id)} style={{
            border: '1px solid var(--border-subtle)', background: mod === id ? `var(--mod-${id}-soft)` : 'var(--neutral-0)',
            color: mod === id ? `var(--mod-${id})` : 'var(--text-body)', fontWeight: mod === id ? 500 : 400,
            padding: '6px 14px', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: 13,
            fontFamily: 'var(--ff-sans)', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: `var(--mod-${id})` }}/>
            {MODULES.find(m => m.id === id).name}
          </button>
        ))}
      </div>
      <div style={{
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xl)', overflow: 'hidden',
        background: 'var(--bg-app)', boxShadow: 'var(--sh-md)',
      }}>
        <div style={{ padding: '10px 16px', background: 'var(--neutral-50)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--ff-mono)', alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'oklch(0.78 0.09 30)' }}/>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'oklch(0.85 0.10 90)' }}/>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'oklch(0.75 0.08 140)' }}/>
          <span style={{ marginLeft: 8 }}>/comparar/{mod} · 1440×980</span>
        </div>
        <ComparisonScreen moduleId={mod}/>
      </div>
    </DSSection>
  );
}

Object.assign(window, { ComparisonScreen, DSComparison, COMPARISON_DATA });

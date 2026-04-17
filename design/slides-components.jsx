// ============================================================
// DermaPro — Components showcase slides
// ============================================================

// Classification badge — used in results
const ClassBadge = ({ label, value, color = 'var(--primary-300)' }) => (
  <div className="class-badge">
    <span className="swatch" style={{ background: color }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  </div>
);

// Horizontal bar chart
const BarChart = ({ data, color = 'var(--primary-400)', max = 100 }) => (
  <div>
    {data.map((d) => (
      <div key={d.label} className="bar-row">
        <div className="bar-label">{d.label}</div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
        </div>
        <div className="bar-val">{d.value}{d.unit || ''}</div>
      </div>
    ))}
  </div>
);

// Disclaimer modal (static preview)
const DisclaimerModal = ({ onClose }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'color-mix(in oklab, var(--primary-500) 25%, var(--ink-2))',
          color: 'var(--primary-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconShield size={22} />
        </div>
        <h3>Antes de começar</h3>
      </div>
      <p>
        DermaPro é uma ferramenta de <strong style={{ color: 'var(--ink-10)', fontWeight: 600 }}>apoio à consulta dermatológica</strong>.
        As métricas geradas são orientativas — o diagnóstico final é sempre do profissional responsável.
      </p>
      <p>
        As imagens capturadas ficam no dispositivo até o fim da sessão. Você pode exportar ou descartar a qualquer momento.
      </p>
      <label className="check" style={{ marginTop: 8, marginBottom: 24 }}>
        <input type="checkbox" defaultChecked />
        <span className="box"><IconCheck size={12} className="check-mark" /></span>
        <span>Não mostrar novamente neste dispositivo</span>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="btn btn-secondary" onClick={onClose}>Revisar depois</button>
        <button className="btn btn-primary" onClick={onClose}>Concordar e continuar</button>
      </div>
    </div>
  </div>
);

// Slide showcasing small components
const SlideComponents = () => (
  <div className="slide">
    <SlideShell eyebrow="06 Components" title="Átomos" sub="Botões, badges, classificação, chart de distribuição. Tudo construído com os tokens — nada de cor hard-coded.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: '100%' }}>

        {/* Buttons */}
        <div className="card card-pad" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ fontSize: 11, marginBottom: 16, color: 'var(--ink-7)' }}>Botões</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn-primary"><IconDownload size={16} />Baixar foto</button>
              <button className="btn btn-secondary"><IconDownload size={16} />Baixar foto</button>
              <button className="btn btn-ghost">Cancelar</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary">Default</button>
              <button className="btn btn-primary btn-lg">Large</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="segmented">
                <button data-active>Laptop</button>
                <button>Apresentação</button>
              </div>
              <input className="input" placeholder="Nome do paciente" style={{ width: 220 }} />
            </div>
          </div>

          <div className="hr" style={{ margin: '24px 0' }} />
          <div className="eyebrow" style={{ fontSize: 11, marginBottom: 16, color: 'var(--ink-7)' }}>Badges</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-soft"><span className="dot" />Rascunho</span>
            <span className="badge badge-info"><span className="dot" />Foto enviada</span>
            <span className="badge badge-success"><span className="dot" />Análise concluída</span>
            <span className="badge badge-attention"><span className="dot" />Revisar</span>
            <span className="badge badge-alert"><span className="dot" />Requer atenção</span>
          </div>

          <div className="hr" style={{ margin: '24px 0' }} />
          <div className="eyebrow" style={{ fontSize: 11, marginBottom: 16, color: 'var(--ink-7)' }}>Classificação</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <ClassBadge label="Severidade" value="Leve" color="var(--mod-acne)" />
            <ClassBadge label="Perfil" value="Pele Mista" color="var(--mod-texture)" />
            <ClassBadge label="Sinais" value="Suaves" color="var(--mod-signs)" />
          </div>
        </div>

        {/* Chart */}
        <div className="card card-pad" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 11, color: 'var(--ink-7)', marginBottom: 6 }}>Distribuição por região</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-11)' }}>Módulo: Acne</div>
            </div>
            <ClassBadge label="Severidade" value="Leve" color="var(--mod-acne)" />
          </div>
          <BarChart
            color="var(--mod-acne)"
            data={[
              { label: 'Fronte', value: 8 },
              { label: 'Malar E', value: 14 },
              { label: 'Malar D', value: 12 },
              { label: 'Nasal', value: 6 },
              { label: 'Perioral', value: 22 },
              { label: 'Mento', value: 4 },
            ]}
            max={30}
          />

          <div className="hr" style={{ margin: '20px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <div className="stat">
              <span className="k">Total</span>
              <span className="v">66</span>
              <span className="delta">lesões ativas</span>
            </div>
            <div className="stat">
              <span className="k">Densidade</span>
              <span className="v">2.3<span style={{ fontSize: 14, color: 'var(--ink-8)', marginLeft: 4 }}>/cm²</span></span>
              <span className="delta">concentração perioral</span>
            </div>
            <div className="stat">
              <span className="k">vs. último</span>
              <span className="v" style={{ color: '#b0c99a' }}>−14%</span>
              <span className="delta">há 3 semanas</span>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  </div>
);

// Disclaimer modal slide (preview)
const SlideDisclaimer = () => (
  <div className="slide" style={{ position: 'relative' }}>
    {/* faux app underneath */}
    <div style={{ position: 'absolute', inset: 0, filter: 'blur(2px) saturate(0.7)', opacity: 0.6 }}>
      <div className="slide-pad" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <DermaWordmark size={18} color="var(--ink-8)" markSize={26} />
        <h1 className="slide-h1" style={{ opacity: 0.5 }}>Hub de análises</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, flex: 1 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card" style={{ minHeight: 200 }} />
          ))}
        </div>
      </div>
    </div>
    <DisclaimerModal onClose={() => {}} />
  </div>
);

Object.assign(window, { ClassBadge, BarChart, DisclaimerModal, SlideComponents, SlideDisclaimer });

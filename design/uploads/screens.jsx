/* DermaPro — Hub, Module Analysis, Modal, Presentation screens */

const MODULES = [
  { id: 'acne',       name: 'Acne',                subtitle: 'Detecção e severidade de lesões',          tone: 'acne',       active: true,  count: '12 métricas' },
  { id: 'melasma',    name: 'Melasma',             subtitle: 'Hiperpigmentação e distribuição',          tone: 'melasma',    active: true,  count: '8 métricas' },
  { id: 'textura',    name: 'Textura',             subtitle: 'Poros visíveis e oleosidade',              tone: 'textura',    active: true,  count: '10 métricas' },
  { id: 'expression', name: 'Sinais de Expressão', subtitle: 'Linhas finas, vincos dinâmicos',           tone: 'expression', active: true,  count: '6 métricas' },
  { id: 'rosacea',    name: 'Rosácea',             subtitle: 'Eritema difuso e telangiectasias',         tone: 'neutral',    active: false },
  { id: 'estrutura',  name: 'Estrutura Facial',    subtitle: 'Proporções e simetria estimada',           tone: 'neutral',    active: false },
];

/* ---------- HUB ---------- */
function HubScreen({ onOpenModule, tvMode }) {
  return (
    <div style={{ padding: tvMode ? 64 : 48, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tvMode ? 48 : 40 }}>
        <div>
          <div style={{
            fontSize: tvMode ? 16 : 13, fontFamily: 'var(--ff-mono)',
            color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 12,
          }}>Consulta · 17 Abr 2026 · 14:20</div>
          <h1 style={{
            fontSize: tvMode ? 'var(--tv-h1)' : 'var(--fs-h1)',
            fontWeight: 500, color: 'var(--text-strong)',
            margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>Boa tarde, Dra. Helena.</h1>
          <p style={{
            fontSize: tvMode ? 24 : 18, color: 'var(--text-muted)',
            marginTop: 12, marginBottom: 0, maxWidth: 640, lineHeight: 1.4,
          }}>Paciente <span style={{ color: 'var(--text-body)', fontWeight: 500 }}>Mariana S.</span> · 34 anos · Pele Fototipo III · Segunda consulta</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Badge tone="success" icon={<Icon.Tv s={14} />}>Apple TV conectada</Badge>
          <Button variant="ghost" size="sm" icon={<Icon.Settings s={16} />}>Ajustes</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {MODULES.map((m, i) => (
          <ModuleCard key={m.id} module={m} tvMode={tvMode} onClick={() => m.active && onOpenModule(m.id)} />
        ))}
      </div>

      <div style={{
        marginTop: 40, padding: 20, borderRadius: 'var(--r-lg)',
        background: 'var(--brand-primary-50)', border: '1px solid var(--brand-primary-200)',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--brand-primary-200)', color: 'var(--brand-primary-700)', display: 'grid', placeItems: 'center' }}>
          <Icon.Info s={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: 'var(--text-strong)', marginBottom: 2 }}>Modo apresentação ativo</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>A tela está sendo espelhada. Resultados sensíveis são exibidos com linguagem acolhedora.</div>
        </div>
        <Button variant="secondary" size="sm">Encerrar sessão</Button>
      </div>
    </div>
  );
}

function ModuleCard({ module: m, onClick, tvMode }) {
  const [hover, setHover] = useState(false);
  const color = m.active ? `var(--mod-${m.id})` : 'var(--neutral-400)';
  const soft = m.active ? `var(--mod-${m.id}-soft)` : 'var(--neutral-150)';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        padding: tvMode ? 28 : 24,
        cursor: m.active ? 'pointer' : 'not-allowed',
        opacity: m.active ? 1 : 0.55,
        boxShadow: hover && m.active ? 'var(--sh-md)' : 'var(--sh-sm)',
        transform: hover && m.active ? 'translateY(-2px)' : 'none',
        transition: 'all var(--dur-2) var(--ease)',
        overflow: 'hidden',
      }}
    >
      {/* corner accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
        background: color,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <ModuleGlyph id={m.id} color={color} soft={soft} />
        {!m.active && <Badge tone="neutral" icon={<Icon.Lock s={12} />}>Em breve</Badge>}
        {m.active && <span style={{
          fontSize: 12, fontFamily: 'var(--ff-mono)', color: 'var(--text-faint)',
        }}>{m.count}</span>}
      </div>
      <div style={{
        fontSize: tvMode ? 26 : 22, fontWeight: 500, color: 'var(--text-strong)',
        letterSpacing: '-0.015em', marginBottom: 6, lineHeight: 1.2,
      }}>{m.name}</div>
      <div style={{ fontSize: tvMode ? 17 : 15, color: 'var(--text-muted)', lineHeight: 1.45 }}>
        {m.subtitle}
      </div>
      {m.active && (
        <div style={{
          marginTop: 32, display: 'flex', alignItems: 'center', gap: 8,
          color: color, fontSize: 14, fontWeight: 500,
        }}>
          Iniciar análise <Icon.Arrow s={16} c={color} />
        </div>
      )}
    </div>
  );
}

function ModuleGlyph({ id, color, soft, size = 56 }) {
  // Abstract per-module iconography (not illustrative — geometric marks)
  const marks = {
    acne: (
      <g>
        <circle cx="20" cy="22" r="3" fill={color} opacity="0.9"/>
        <circle cx="34" cy="18" r="2" fill={color} opacity="0.6"/>
        <circle cx="28" cy="32" r="2.5" fill={color} opacity="0.8"/>
        <circle cx="14" cy="32" r="1.6" fill={color} opacity="0.5"/>
      </g>
    ),
    melasma: (
      <g>
        <path d="M10 22 Q18 14 26 22 Q34 30 40 22" stroke={color} strokeWidth="2.2" fill="none" opacity="0.5"/>
        <path d="M12 30 Q20 24 28 30 Q36 36 40 30" stroke={color} strokeWidth="2.2" fill="none" opacity="0.9"/>
      </g>
    ),
    textura: (
      <g>
        {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => (
          <circle key={`${r}-${c}`} cx={12 + c*6} cy={14 + r*5} r="1" fill={color} opacity={0.3 + ((r+c)%3)*0.25}/>
        )))}
      </g>
    ),
    expression: (
      <g>
        <path d="M10 16 Q25 12 40 16" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
        <path d="M10 24 Q25 20 40 24" stroke={color} strokeWidth="2" fill="none" opacity="0.9"/>
        <path d="M14 34 Q25 31 36 34" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
      </g>
    ),
    rosacea: (
      <g>
        <circle cx="25" cy="25" r="12" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <circle cx="25" cy="25" r="6" fill={color} opacity="0.3"/>
      </g>
    ),
    estrutura: (
      <g>
        <path d="M25 10 L38 20 L33 38 L17 38 L12 20 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.8"/>
        <circle cx="25" cy="24" r="1.5" fill={color}/>
      </g>
    ),
  }[id];
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--r-md)',
      background: soft, display: 'grid', placeItems: 'center',
    }}>
      <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 50 50">{marks}</svg>
    </div>
  );
}

/* ---------- MODULE ANALYSIS SCREEN ---------- */
function AnalysisScreen({ moduleId, onBack, onPresent, tvMode, hasResult = true }) {
  const mod = MODULES.find(m => m.id === moduleId) || MODULES[0];
  const color = `var(--mod-${mod.id})`;
  const soft = `var(--mod-${mod.id}-soft)`;

  return (
    <div style={{ padding: tvMode ? 48 : 40, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onBack} style={{
            background: 'var(--neutral-0)', border: '1px solid var(--border-subtle)',
            width: 40, height: 40, borderRadius: 'var(--r-md)', cursor: 'pointer',
            display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-xs)',
          }}><Icon.Back s={18}/></button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>
              <span>Hub</span><span>›</span><span style={{ color: 'var(--text-muted)' }}>Análise</span>
            </div>
            <h2 style={{ fontSize: tvMode ? 36 : 28, fontWeight: 500, color: 'var(--text-strong)', margin: 0, letterSpacing: '-0.015em', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 8, height: 28, background: color, borderRadius: 4, display: 'inline-block' }} />
              {mod.name}
            </h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="md" icon={<Icon.Download s={16}/>}>Exportar foto</Button>
          <Button variant="primary" size="md" icon={<Icon.Fullscreen s={16}/>} onClick={onPresent}>Modo apresentação</Button>
        </div>
      </div>

      {hasResult ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <AnalysisImage moduleId={mod.id} />
          <MetricsPanel moduleId={mod.id} color={color} soft={soft} />
        </div>
      ) : (
        <UploadArea moduleId={mod.id} color={color} soft={soft} />
      )}
    </div>
  );
}

function UploadArea({ color, soft }) {
  return (
    <div style={{
      border: `2px dashed ${soft}`, borderRadius: 'var(--r-lg)',
      padding: 80, textAlign: 'center', background: 'var(--neutral-50)',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 'var(--r-lg)',
        background: soft, color, margin: '0 auto 20px',
        display: 'grid', placeItems: 'center',
      }}><Icon.Camera s={32} c={color} /></div>
      <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 6 }}>Capture ou envie uma foto do paciente</div>
      <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
        Recomendado: luz difusa frontal, sem maquiagem, rosto centralizado. JPG ou PNG até 20 MB.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button variant="primary" icon={<Icon.Camera s={16}/>}>Capturar agora</Button>
        <Button variant="secondary" icon={<Icon.Upload s={16}/>}>Enviar arquivo</Button>
      </div>
    </div>
  );
}

/* ---------- Analysis Image with overlays ---------- */
function AnalysisImage({ moduleId }) {
  const [showOverlay, setShowOverlay] = useState(true);
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{
        position: 'relative', aspectRatio: '4/5', background: 'var(--neutral-150)',
      }}>
        <FacePlaceholder />
        {showOverlay && <OverlayLayer moduleId={moduleId} />}
        {/* toolbar overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'oklch(0.20 0.008 60 / 0.75)', color: 'white',
            padding: '6px 12px', borderRadius: 'var(--r-pill)', fontSize: 12,
            fontFamily: 'var(--ff-mono)', letterSpacing: '0.04em', backdropFilter: 'blur(8px)',
          }}>IMG · 17-04-2026 · #A4821</div>
          <button onClick={() => setShowOverlay(v => !v)} style={{
            background: 'oklch(0.20 0.008 60 / 0.75)', color: 'white', border: 'none',
            padding: '6px 14px', borderRadius: 'var(--r-pill)', fontSize: 12,
            cursor: 'pointer', pointerEvents: 'auto', backdropFilter: 'blur(8px)',
            fontFamily: 'var(--ff-sans)', fontWeight: 500,
          }}>{showOverlay ? 'Ocultar análise' : 'Mostrar análise'}</button>
        </div>
        {/* bottom scale */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          display: 'flex', gap: 8, fontSize: 11, fontFamily: 'var(--ff-mono)',
          color: 'white',
        }}>
          <OverlayLegend moduleId={moduleId} />
        </div>
      </div>
    </Card>
  );
}

function FacePlaceholder() {
  // Subtle neutral placeholder — striped with monospace label
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(135deg, oklch(0.82 0.02 40) 0%, oklch(0.88 0.02 55) 100%)`,
      display: 'grid', placeItems: 'center', overflow: 'hidden',
    }}>
      {/* diagonal stripes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(135deg, transparent 0 16px, oklch(0 0 0 / 0.03) 16px 17px)`,
      }}/>
      {/* face silhouette */}
      <svg viewBox="0 0 400 500" width="70%" height="70%" style={{ opacity: 0.4 }}>
        <ellipse cx="200" cy="230" rx="120" ry="150" fill="none" stroke="oklch(0.5 0.02 40)" strokeWidth="1.5" strokeDasharray="4 6"/>
        <ellipse cx="200" cy="230" rx="140" ry="175" fill="none" stroke="oklch(0.5 0.02 40)" strokeWidth="1" strokeDasharray="2 8"/>
        <circle cx="165" cy="210" r="3" fill="oklch(0.5 0.02 40)"/>
        <circle cx="235" cy="210" r="3" fill="oklch(0.5 0.02 40)"/>
        <path d="M165 260 Q200 275 235 260" stroke="oklch(0.5 0.02 40)" strokeWidth="1.5" fill="none"/>
      </svg>
      <div style={{
        position: 'absolute', bottom: 40, fontFamily: 'var(--ff-mono)',
        fontSize: 11, color: 'oklch(0.45 0.02 40)', letterSpacing: '0.1em',
      }}>[ PATIENT_PHOTO · FRONTAL · FLATLIGHT ]</div>
    </div>
  );
}

function OverlayLayer({ moduleId }) {
  const layers = {
    acne: (
      <>
        {[
          [25, 28, 4],[32, 25, 3],[58, 35, 5],[62, 48, 3.5],[48, 60, 4],[38, 45, 2.5],[70, 30, 3],
        ].map(([x,y,r], i) => (
          <g key={i}>
            <rect x={`${x-r}%`} y={`${y-r}%`} width={`${r*2}%`} height={`${r*2}%`}
              fill="var(--overlay-lesion)" stroke="var(--overlay-lesion-stroke)" strokeWidth="1.2" rx="2"/>
          </g>
        ))}
      </>
    ),
    melasma: (
      <>
        <ellipse cx="32%" cy="32%" rx="10%" ry="7%" fill="var(--overlay-pigment)" stroke="var(--overlay-pigment-stroke)" strokeWidth="1"/>
        <ellipse cx="62%" cy="32%" rx="11%" ry="6%" fill="var(--overlay-pigment)" stroke="var(--overlay-pigment-stroke)" strokeWidth="1"/>
        <ellipse cx="48%" cy="24%" rx="13%" ry="4%" fill="var(--overlay-pigment)" stroke="var(--overlay-pigment-stroke)" strokeWidth="1" opacity="0.7"/>
      </>
    ),
    textura: (
      <>
        {/* shine patches */}
        <ellipse cx="48%" cy="38%" rx="8%" ry="12%" fill="var(--overlay-shine)" stroke="var(--overlay-shine-stroke)" strokeWidth="1"/>
        <ellipse cx="28%" cy="42%" rx="6%" ry="7%" fill="var(--overlay-shine)" stroke="var(--overlay-shine-stroke)" strokeWidth="0.8" opacity="0.8"/>
        <ellipse cx="68%" cy="42%" rx="6%" ry="7%" fill="var(--overlay-shine)" stroke="var(--overlay-shine-stroke)" strokeWidth="0.8" opacity="0.8"/>
        {/* pore dots */}
        {Array.from({length: 40}).map((_, i) => {
          const x = 25 + (i % 8) * 6 + (i%3)*1.2;
          const y = 30 + Math.floor(i/8) * 5 + (i%2)*1.1;
          return <circle key={i} cx={`${x}%`} cy={`${y}%`} r="1.5" fill="oklch(0.55 0.06 150 / 0.55)"/>;
        })}
      </>
    ),
    expression: (
      <>
        <path d="M 32% 28% Q 40% 26% 48% 28%" stroke="var(--overlay-lines)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 52% 28% Q 60% 26% 68% 28%" stroke="var(--overlay-lines)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 42% 23% Q 50% 21% 58% 23%" stroke="var(--overlay-lines)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
        <path d="M 22% 38% Q 28% 41% 26% 46%" stroke="var(--overlay-lines)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
        <path d="M 78% 38% Q 72% 41% 74% 46%" stroke="var(--overlay-lines)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      </>
    ),
  }[moduleId] || null;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {layers}
    </svg>
  );
}

function OverlayLegend({ moduleId }) {
  const items = {
    acne: [['var(--overlay-lesion-stroke)', 'Lesão detectada']],
    melasma: [['var(--overlay-pigment-stroke)', 'Hiperpigmentação']],
    textura: [['var(--overlay-shine-stroke)', 'Brilho'], ['oklch(0.55 0.06 150)', 'Poro']],
    expression: [['var(--overlay-lines)', 'Linhas detectadas']],
  }[moduleId] || [];
  return (
    <>{items.map(([c, l], i) => (
      <span key={i} style={{
        background: 'oklch(0.20 0.008 60 / 0.75)', padding: '4px 10px', borderRadius: 'var(--r-pill)',
        display: 'inline-flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)',
      }}><span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }}/>{l}</span>
    ))}</>
  );
}

/* ---------- METRICS PANEL ---------- */
const METRICS = {
  acne: {
    severity: { tone: 'success', label: 'Leve', sublabel: 'Severidade geral' },
    bars: [
      ['Zona T (testa/nariz)', 62, 'acne'],
      ['Bochecha direita', 28, 'acne'],
      ['Bochecha esquerda', 34, 'acne'],
      ['Mento', 18, 'acne'],
    ],
    stats: [['Lesões ativas', '7'], ['Pós-inflamatórias', '3'], ['Índice GAGS', '11/45']],
  },
  melasma: {
    severity: { tone: 'attention', label: 'Moderado', sublabel: 'Distribuição centro-facial' },
    bars: [
      ['Região malar', 74, 'melasma'],
      ['Testa', 48, 'melasma'],
      ['Buço', 32, 'melasma'],
      ['Mento', 10, 'melasma'],
    ],
    stats: [['Área afetada', '14.2%'], ['Índice MASI', '8.4'], ['Fototipo', 'III']],
  },
  textura: {
    severity: { tone: 'brand', label: 'Pele Mista', sublabel: 'Perfil predominante' },
    bars: [
      ['Zona T — oleosidade', 78, 'textura'],
      ['Zona U — oleosidade', 24, 'textura'],
      ['Poros visíveis — nariz', 66, 'textura'],
      ['Poros visíveis — bochecha', 38, 'textura'],
    ],
    stats: [['Brilho (luz refletida)', '42 un'], ['Poros/cm²', '94'], ['Hidratação est.', '58%']],
  },
  expression: {
    severity: { tone: 'success', label: 'Sinais Suaves', sublabel: 'Padrão para idade' },
    bars: [
      ['Fronte (horizontais)', 42, 'expression'],
      ['Glabela (vertical)', 28, 'expression'],
      ['Periorbital', 55, 'expression'],
      ['Nasolabial', 22, 'expression'],
    ],
    stats: [['Linhas estáticas', '6'], ['Linhas dinâmicas', '11'], ['Profundidade méd.', '0.4 mm']],
  },
};

function MetricsPanel({ moduleId, color, soft }) {
  const m = METRICS[moduleId];
  if (!m) return null;
  return (
    <Card padding={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontWeight: 500, marginBottom: 12 }}>Classificação geral</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Badge tone={m.severity.tone} size="lg">{m.severity.label}</Badge>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{m.severity.sublabel}</span>
        </div>
      </div>

      <div style={{ padding: 24, flex: 1 }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontWeight: 500, marginBottom: 16 }}>Distribuição por região</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {m.bars.map(([label, val, tone], i) => (
            <BarRow key={i} label={label} value={val} color={`var(--mod-${tone})`} soft={`var(--mod-${tone}-soft)`}/>
          ))}
        </div>
      </div>

      <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', background: 'var(--neutral-50)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {m.stats.map(([k, v], i) => (
            <div key={i}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--ff-sans)', letterSpacing: '-0.02em' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function BarRow({ label, value, color, soft, amplified }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
        <span style={{ fontSize: amplified ? 18 : 14, color: 'var(--text-body)' }}>{label}</span>
        <span style={{ fontSize: amplified ? 16 : 13, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)', fontWeight: 500 }}>{value}%</span>
      </div>
      <div style={{ height: amplified ? 10 : 8, background: soft, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999, transition: 'width var(--dur-3) var(--ease)' }}/>
      </div>
    </div>
  );
}

/* ---------- DISCLAIMER MODAL ---------- */
function DisclaimerModal({ onAccept, onClose, embedded }) {
  return (
    <div style={{
      position: embedded ? 'absolute' : 'fixed', inset: 0, background: 'oklch(0.14 0.008 60 / 0.5)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 24,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-surface)', maxWidth: 560, width: '100%',
        borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-xl)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '28px 32px 20px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)', display: 'grid', placeItems: 'center' }}>
            <Icon.Info s={22}/>
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 2 }}>Primeiro uso</div>
            <h3 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: 'var(--text-strong)', letterSpacing: '-0.01em' }}>Como o DermaPro deve ser usado</h3>
          </div>
        </div>
        <div style={{ padding: '24px 32px', fontSize: 15, lineHeight: 1.55, color: 'var(--text-body)' }}>
          <p style={{ marginTop: 0 }}>O DermaPro é uma <strong style={{ color: 'var(--text-strong)', fontWeight: 500 }}>ferramenta de apoio à consulta</strong>, não um substituto do julgamento clínico. Os resultados são estimativas computacionais sobre a imagem e devem ser interpretados pelo profissional.</p>
          <ul style={{ paddingLeft: 18, margin: '12px 0' }}>
            <li style={{ marginBottom: 8 }}>A tela pode estar espelhada em Apple TV — fale diretamente com o paciente.</li>
            <li style={{ marginBottom: 8 }}>Classificações usam linguagem acolhedora (ex: “Sinais Suaves”, “Moderado”).</li>
            <li>Fotos ficam armazenadas apenas localmente durante a sessão.</li>
          </ul>
        </div>
        <div style={{ padding: '20px 32px 28px', background: 'var(--neutral-50)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
          <label style={{ marginRight: 'auto', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-primary-700)' }}/>
            Não mostrar novamente neste dispositivo
          </label>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button variant="primary" onClick={onAccept} icon={<Icon.Check s={16}/>}>Entendi, começar</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- PRESENTATION MODE ---------- */
function PresentationMode({ moduleId, onExit, embedded }) {
  const mod = MODULES.find(m => m.id === moduleId) || MODULES[0];
  const color = `var(--mod-${mod.id})`;
  const soft = `var(--mod-${mod.id}-soft)`;
  const m = METRICS[mod.id];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--neutral-1000)',
      color: 'var(--neutral-100)', display: 'flex', flexDirection: 'column',
      zIndex: 50, overflow: 'hidden', minHeight: embedded ? '100%' : 'auto',
    }}>
      {/* Top bar */}
      <div style={{ padding: '32px 48px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <DermaProLogo size={28} color="var(--neutral-200)"/>
          <div style={{ width: 1, height: 24, background: 'var(--neutral-700)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }}/>
            <span style={{ fontSize: 18, color: 'var(--neutral-200)', fontWeight: 500 }}>{mod.name}</span>
          </div>
        </div>
        <button onClick={onExit} style={{
          background: 'oklch(1 0 0 / 0.08)', border: '1px solid oklch(1 0 0 / 0.12)', color: 'var(--neutral-100)',
          padding: '8px 16px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
          fontSize: 13, display: 'inline-flex', gap: 8, alignItems: 'center',
        }}><Icon.Close s={14} c="currentColor"/>Sair da apresentação</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px 48px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <FacePlaceholder/>
          <OverlayLayer moduleId={mod.id}/>
        </div>
        <div>
          <div style={{ fontSize: 14, fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-400)', marginBottom: 16 }}>
            Resultado da análise
          </div>
          <div style={{
            fontSize: 84, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1,
            color: 'var(--neutral-0)', marginBottom: 16,
          }}>{m.severity.label}</div>
          <div style={{ fontSize: 24, color: 'var(--neutral-300)', marginBottom: 40, maxWidth: 520, lineHeight: 1.35 }}>
            {m.severity.sublabel}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560 }}>
            {m.bars.slice(0, 3).map(([label, val, tone], i) => (
              <BarRowDark key={i} label={label} value={val} color={`var(--mod-${tone})`}/>
            ))}
          </div>

          <div style={{
            marginTop: 40, padding: 20, borderRadius: 'var(--r-lg)',
            background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)',
            display: 'flex', gap: 14, alignItems: 'flex-start', maxWidth: 560,
          }}>
            <Icon.Info s={20} c="var(--neutral-300)"/>
            <div style={{ fontSize: 16, color: 'var(--neutral-200)', lineHeight: 1.5 }}>
              Os números são estimativas sobre a foto e apoiam a conversa — não substituem a avaliação clínica.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarRowDark({ label, value, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 20, color: 'var(--neutral-100)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 20, fontFamily: 'var(--ff-mono)', color: 'var(--neutral-300)' }}>{value}%</span>
      </div>
      <div style={{ height: 12, background: 'oklch(1 0 0 / 0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999 }}/>
      </div>
    </div>
  );
}

Object.assign(window, {
  MODULES, METRICS,
  HubScreen, AnalysisScreen, DisclaimerModal, PresentationMode,
  ModuleCard, ModuleGlyph, AnalysisImage, MetricsPanel, BarRow, BarRowDark,
  FacePlaceholder, OverlayLayer, OverlayLegend, UploadArea,
});

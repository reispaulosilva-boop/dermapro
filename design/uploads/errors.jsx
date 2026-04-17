/* Capture Error States for DermaPro */

const CAPTURE_ERRORS = {
  blur: {
    id: 'blur',
    title: 'A foto está desfocada',
    subtitle: 'Score de nitidez: 0.34 / 1.0',
    guidance: 'Tente novamente mantendo a câmera estável e pedindo ao paciente para olhar fixamente em um ponto por 1 segundo.',
    tone: 'attention',
    metric: ['Nitidez estimada', '34%', 'Mínimo recomendado: 70%'],
    hint: 'Luz difusa frontal ajuda o autofoco.',
  },
  partial: {
    id: 'partial',
    title: 'Rosto parcialmente fora do enquadramento',
    subtitle: '3 de 68 landmarks ausentes · lado esquerdo',
    guidance: 'Reposicione a câmera para que o rosto inteiro fique visível, com margem mínima nas bordas.',
    tone: 'attention',
    metric: ['Cobertura facial', '82%', 'Mínimo: 95%'],
    hint: 'Use o guia elíptico como referência.',
  },
  light: {
    id: 'light',
    title: 'Iluminação muito desigual',
    subtitle: 'Diferença de brilho entre lados: 42%',
    guidance: 'Evite fontes laterais fortes. Luz difusa frontal (painel de LED ou luz de janela fosca) dá o melhor resultado.',
    tone: 'attention',
    metric: ['Uniformidade', '58%', 'Mínimo: 80%'],
    hint: 'Sombras alteram a detecção de pigmentação.',
  },
  nodetect: {
    id: 'nodetect',
    title: 'Nenhum rosto detectado',
    subtitle: 'O detector não encontrou um rosto na imagem',
    guidance: 'Verifique se o paciente está de frente para a câmera e sem óculos escuros, máscara ou objetos cobrindo o rosto.',
    tone: 'alert',
    metric: ['Confiança', '—', 'Requer rosto frontal'],
    hint: 'A imagem não será analisada até que um rosto seja detectado.',
  },
};

function ErrorFrame({ variant, onRetry, onUse }) {
  const err = CAPTURE_ERRORS[variant];
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--neutral-150)' }}>
        <ErrorImagePlaceholder variant={variant}/>
        {/* diagnostic overlay */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <DiagnosticOverlay variant={variant}/>
        </div>
        {/* top-left status chip */}
        <div style={{
          position: 'absolute', top: 16, left: 16,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 'var(--r-pill)',
          background: 'oklch(0.20 0.008 60 / 0.82)',
          color: 'white', fontSize: 12, fontWeight: 500,
          backdropFilter: 'blur(8px)',
          border: '1px solid oklch(1 0 0 / 0.1)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999,
            background: err.tone === 'alert' ? 'var(--sem-alert)' : 'var(--sem-attention)',
          }}/>
          {err.tone === 'alert' ? 'Captura bloqueada' : 'Captura com baixa qualidade'}
        </div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.01em', marginBottom: 4 }}>{err.title}</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--ff-mono)', color: 'var(--text-muted)' }}>{err.subtitle}</div>
          </div>
          <Badge tone={err.tone}>{err.tone === 'alert' ? 'Refazer obrigatório' : 'Recomendado refazer'}</Badge>
        </div>
        <div style={{
          padding: 14, background: 'var(--neutral-50)', borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-subtle)', fontSize: 14, color: 'var(--text-body)',
          lineHeight: 1.5, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icon.Info s={18} c="var(--brand-primary-700)"/>
          <span>{err.guidance}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--neutral-50)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)', fontWeight: 500, marginBottom: 4 }}>{err.metric[0]}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-strong)', letterSpacing: '-0.015em' }}>{err.metric[1]}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{err.metric[2]}</div>
          </div>
          <div style={{ padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--brand-accent-200)', border: '1px solid var(--brand-accent-300)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Icon.Info s={16} c="var(--brand-accent-700)"/>
            <div style={{ fontSize: 12, color: 'var(--neutral-800)', lineHeight: 1.4 }}>
              <div style={{ fontWeight: 500, color: 'var(--neutral-900)', marginBottom: 2 }}>Dica</div>
              {err.hint}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" icon={<Icon.Camera s={16}/>} onClick={onRetry}>Capturar novamente</Button>
          {err.tone !== 'alert' && (
            <Button variant="ghost" onClick={onUse}>Analisar mesmo assim</Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ErrorImagePlaceholder({ variant }) {
  // Base placeholder — then modulated by variant
  const commonFace = (
    <g opacity="0.4">
      <ellipse cx="200" cy="230" rx="120" ry="150" fill="none" stroke="oklch(0.5 0.02 40)" strokeWidth="1.5" strokeDasharray="4 6"/>
      <circle cx="165" cy="210" r="3" fill="oklch(0.5 0.02 40)"/>
      <circle cx="235" cy="210" r="3" fill="oklch(0.5 0.02 40)"/>
      <path d="M165 260 Q200 275 235 260" stroke="oklch(0.5 0.02 40)" strokeWidth="1.5" fill="none"/>
    </g>
  );
  if (variant === 'blur') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, oklch(0.82 0.02 40), oklch(0.86 0.02 55))',
        filter: 'blur(4px)',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        <svg viewBox="0 0 400 500" width="70%" height="70%">{commonFace}</svg>
      </div>
    );
  }
  if (variant === 'partial') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, oklch(0.82 0.02 40), oklch(0.86 0.02 55))',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {/* face pushed to right — left side cut off */}
        <svg viewBox="0 0 400 500" width="95%" height="95%" style={{ transform: 'translateX(22%)' }}>{commonFace}</svg>
      </div>
    );
  }
  if (variant === 'light') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          linear-gradient(90deg, oklch(0.35 0.01 40) 0%, oklch(0.65 0.02 45) 55%, oklch(0.92 0.02 55) 100%)
        `,
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        <svg viewBox="0 0 400 500" width="70%" height="70%">{commonFace}</svg>
      </div>
    );
  }
  if (variant === 'nodetect') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, oklch(0.72 0.02 40), oklch(0.78 0.02 55))',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {/* no face — generic scene */}
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'oklch(0.45 0.02 40)', letterSpacing: '0.1em' }}>
          [ IMG · NO_FACE_FOUND ]
        </div>
      </div>
    );
  }
}

function DiagnosticOverlay({ variant }) {
  if (variant === 'blur') {
    return (
      <svg style={{ width: '100%', height: '100%' }}>
        {/* highlight blur zones */}
        <rect x="30%" y="28%" width="40%" height="38%" rx="6"
          fill="var(--sem-attention-bg)" fillOpacity="0.0" stroke="var(--sem-attention)" strokeWidth="2" strokeDasharray="6 4"/>
        <g transform="translate(60, 50)">
          <rect width="120" height="28" rx="14" fill="oklch(0.20 0.008 60 / 0.82)"/>
          <text x="60" y="18" textAnchor="middle" fill="white" fontSize="12" fontFamily="var(--ff-sans)" fontWeight="500">Blur detectado</text>
        </g>
      </svg>
    );
  }
  if (variant === 'partial') {
    return (
      <svg style={{ width: '100%', height: '100%' }}>
        <rect x="10%" y="10%" width="80%" height="80%" rx="12" fill="none" stroke="oklch(1 0 0 / 0.6)" strokeWidth="1.5" strokeDasharray="4 4"/>
        <rect x="0%" y="15%" width="22%" height="70%" fill="var(--sem-attention)" fillOpacity="0.22" stroke="var(--sem-attention)" strokeWidth="2" strokeDasharray="6 4"/>
        <g transform="translate(12, 220)">
          <rect width="118" height="28" rx="14" fill="oklch(0.20 0.008 60 / 0.82)"/>
          <text x="59" y="18" textAnchor="middle" fill="white" fontSize="12" fontFamily="var(--ff-sans)" fontWeight="500">Área faltando</text>
        </g>
        {[[65,40],[72,50],[70,60],[66,68]].map(([x,y], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r="3" fill="var(--brand-primary-500)" stroke="white" strokeWidth="1.5"/>
        ))}
      </svg>
    );
  }
  if (variant === 'light') {
    return (
      <svg style={{ width: '100%', height: '100%' }}>
        <rect x="0%" y="0%" width="42%" height="100%" fill="var(--sem-attention)" fillOpacity="0.10" stroke="var(--sem-attention)" strokeWidth="1.5" strokeDasharray="4 4"/>
        <g transform="translate(14, 16)">
          <rect width="128" height="28" rx="14" fill="oklch(0.20 0.008 60 / 0.82)"/>
          <text x="64" y="18" textAnchor="middle" fill="white" fontSize="12" fontFamily="var(--ff-sans)" fontWeight="500">Sombra · -42%</text>
        </g>
        <g transform="translate(240, 16)">
          <rect width="128" height="28" rx="14" fill="oklch(0.20 0.008 60 / 0.82)"/>
          <text x="64" y="18" textAnchor="middle" fill="white" fontSize="12" fontFamily="var(--ff-sans)" fontWeight="500">Brilho · +18%</text>
        </g>
      </svg>
    );
  }
  if (variant === 'nodetect') {
    return (
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: 24, borderRadius: 'var(--r-lg)',
          background: 'oklch(0.20 0.008 60 / 0.82)', color: 'white',
          backdropFilter: 'blur(8px)', border: '1px solid oklch(1 0 0 / 0.1)',
        }}>
          <Icon.FaceLandmark s={40} c="var(--sem-alert)"/>
          <div style={{ fontWeight: 500, fontSize: 15 }}>Nenhum rosto detectado</div>
        </div>
      </div>
    );
  }
  return null;
}

/* Capture tips banner (shown permanently below upload area) */
function CaptureTipsRow() {
  const tips = [
    ['Luz difusa frontal', 'Evita sombras laterais'],
    ['Rosto centralizado', 'Margem nas 4 bordas'],
    ['Sem maquiagem', 'Interfere na leitura de poros'],
    ['Olhar fixo, 1 seg', 'Reduz borrão de movimento'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {tips.map(([t, s], i) => (
        <div key={i} style={{
          padding: 14, borderRadius: 'var(--r-md)',
          background: 'var(--neutral-0)', border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon.Check s={14} c="var(--sem-success)"/>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)' }}>{t}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 22 }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

function DSCaptureErrors() {
  const [variant, setVariant] = useState('blur');
  return (
    <DSSection id="capture-errors" eyebrow="Estados" title="Erros de captura">
      <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 720, marginTop: -16, marginBottom: 24, lineHeight: 1.55 }}>
        Quatro estados de falha na captura. Os três primeiros são "aviso" (paciente pode prosseguir se insistir); "rosto não detectado" bloqueia a análise. Linguagem sempre descritiva, nunca culpa o paciente.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.values(CAPTURE_ERRORS).map(e => (
          <button key={e.id} onClick={() => setVariant(e.id)} style={{
            border: '1px solid var(--border-subtle)',
            background: variant === e.id ? 'var(--brand-primary-100)' : 'var(--neutral-0)',
            color: variant === e.id ? 'var(--brand-primary-800)' : 'var(--text-body)',
            fontWeight: variant === e.id ? 500 : 400,
            padding: '6px 14px', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontSize: 13,
            fontFamily: 'var(--ff-sans)',
          }}>{e.title.split(' ').slice(0, 3).join(' ')}…</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <ErrorFrame variant={variant} onRetry={() => {}} onUse={() => {}}/>
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', fontWeight: 500, marginBottom: 12 }}>Anatomia</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Chip de status superior', 'Sempre visível; cor semântica do erro.'],
              ['Overlay diagnóstico', 'Marca a região do problema na própria foto — ajuda o paciente a entender.'],
              ['Header: título + subtítulo técnico', 'Métrica em mono; o clínico confia em números.'],
              ['Badge de severidade da falha', '"Refazer obrigatório" × "Recomendado refazer".'],
              ['Guidance em linguagem simples', 'O que fazer, não o que deu errado.'],
              ['Dica contextual (âmbar)', 'Micro-aprendizado para melhorar a próxima captura.'],
              ['Ações', 'Primary = refazer · Ghost = prosseguir (se não bloqueado).'],
            ].map(([t, d], i) => (
              <div key={i} style={{ padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)', background: 'var(--neutral-0)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-faint)' }}>{String(i+1).padStart(2, '0')}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)' }}>{t}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', marginBottom: 10 }}>Dicas permanentes de captura</div>
        <CaptureTipsRow/>
      </div>

      <div style={{ marginTop: 16, padding: 16, background: 'var(--neutral-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--text-body)', fontWeight: 500 }}>Regras de escrita:</strong> "A foto está desfocada" (descritivo), não "Você tirou uma foto ruim". Subtítulo sempre objetivo com número. Nenhum vermelho intenso — usamos vinho-suave (<code style={{ fontFamily: 'var(--ff-mono)' }}>--sem-alert</code>) apenas quando há bloqueio total.
      </div>
    </DSSection>
  );
}

Object.assign(window, { CAPTURE_ERRORS, ErrorFrame, ErrorImagePlaceholder, DiagnosticOverlay, CaptureTipsRow, DSCaptureErrors });

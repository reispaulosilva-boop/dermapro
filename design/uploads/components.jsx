/* DermaPro — shared components */

const { useState, useEffect, useRef, useMemo } = React;

/* ---------- LOGO ---------- */
function DermaProLogo({ size = 28, color = 'currentColor', showWordmark = true, stacked = false }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="DermaPro">
      {/* face circle */}
      <circle cx="20" cy="20" r="15" stroke={color} strokeWidth="2" fill="none" />
      {/* subtle analysis arc / smile */}
      <path d="M11 23 Q20 29 29 23" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
      {/* landmark dot */}
      <circle cx="27.5" cy="15" r="1.9" fill={color} />
    </svg>
  );
  if (!showWordmark) return mark;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: stacked ? 6 : 10, flexDirection: stacked ? 'column' : 'row' }}>
      {mark}
      <span style={{
        fontFamily: 'var(--ff-sans)',
        fontSize: size * 0.78,
        letterSpacing: '-0.01em',
        color,
        lineHeight: 1,
      }}>
        <span style={{ fontWeight: 500 }}>Derma</span><span style={{ fontWeight: 700 }}>Pro</span>
      </span>
    </div>
  );
}

/* ---------- BUTTON ---------- */
function Button({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, disabled, fullWidth }) {
  const pad = size === 'lg' ? '14px 22px' : size === 'sm' ? '6px 12px' : '10px 18px';
  const fs = size === 'lg' ? 16 : size === 'sm' ? 13 : 15;
  const styles = {
    primary: { bg: 'var(--brand-primary-700)', fg: 'var(--neutral-0)', border: 'transparent', hover: 'var(--brand-primary-800)' },
    secondary: { bg: 'var(--neutral-0)', fg: 'var(--brand-primary-700)', border: 'var(--brand-primary-200)', hover: 'var(--brand-primary-100)' },
    ghost: { bg: 'transparent', fg: 'var(--text-body)', border: 'transparent', hover: 'var(--neutral-150)' },
    quiet: { bg: 'var(--neutral-150)', fg: 'var(--text-strong)', border: 'transparent', hover: 'var(--neutral-200)' },
  }[variant];
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--ff-sans)',
        fontWeight: 500,
        fontSize: fs,
        padding: pad,
        borderRadius: 'var(--r-md)',
        background: hover && !disabled ? styles.hover : styles.bg,
        color: styles.fg,
        border: `1px solid ${styles.border}`,
        boxShadow: variant === 'primary' ? 'var(--sh-sm)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        transition: 'background var(--dur-1) var(--ease), transform var(--dur-1) var(--ease)',
        letterSpacing: '-0.005em',
      }}
    >
      {icon}{children}{iconRight}
    </button>
  );
}

/* ----------------------------------------------------------------
   ICON SYSTEM — 24 icons · line-icons · 24×24 viewBox
   Grid: 24px, keyline 20px, corner radius 2px, stroke 1.6px
   Stroke-linecap/linejoin: round. Open terminals, no filled shapes.
   Categories: Navigation (4) · Action (6) · Capture & Media (4)
               Analysis (5) · Clinical (3) · Status (2)
---------------------------------------------------------------- */
const ICON_STROKE = 1.6;
function _svg(children, s, c) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={ICON_STROKE} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
const Icon = {
  /* --- Navigation (4) --- */
  Home:       ({s=20, c='currentColor'}) => _svg(<><path d="M4 11 12 4l8 7"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></>, s, c),
  Back:       ({s=20, c='currentColor'}) => _svg(<path d="M19 12H5m0 0 5 5m-5-5 5-5"/>, s, c),
  Arrow:      ({s=20, c='currentColor'}) => _svg(<path d="M5 12h14m0 0-5-5m5 5-5 5"/>, s, c),
  Close:      ({s=20, c='currentColor'}) => _svg(<path d="M6 6l12 12M18 6 6 18"/>, s, c),

  /* --- Action (6) --- */
  Upload:     ({s=20, c='currentColor'}) => _svg(<><path d="M12 15V4m0 0-4 4m4-4 4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></>, s, c),
  Download:   ({s=20, c='currentColor'}) => _svg(<><path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></>, s, c),
  Share:      ({s=20, c='currentColor'}) => _svg(<><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.1 11 15.9 7.2M8.1 13l7.8 3.8"/></>, s, c),
  Play:       ({s=20, c='currentColor'}) => _svg(<path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/>, s, c),
  Settings:   ({s=20, c='currentColor'}) => _svg(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>, s, c),
  More:       ({s=20, c='currentColor'}) => _svg(<><circle cx="5.5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="18.5" cy="12" r="1.1"/></>, s, c),

  /* --- Capture & Media (4) --- */
  Camera:     ({s=20, c='currentColor'}) => _svg(<><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="4"/></>, s, c),
  Tv:         ({s=20, c='currentColor'}) => _svg(<><rect x="2.5" y="4.5" width="19" height="13" rx="2"/><path d="M8 21h8M12 17.5v3.5"/></>, s, c),
  Fullscreen: ({s=20, c='currentColor'}) => _svg(<path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/>, s, c),
  Image:      ({s=20, c='currentColor'}) => _svg(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m3.5 17 4.5-4.5 4 4 3-3L21 18"/></>, s, c),

  /* --- Analysis (5) --- */
  Scan:       ({s=20, c='currentColor'}) => _svg(<><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h2M16 20h2a2 2 0 0 0 2-2v-2"/><path d="M3.5 12h17"/></>, s, c),
  FaceLandmark: ({s=20, c='currentColor'}) => _svg(<><circle cx="12" cy="12" r="8"/><circle cx="9.5" cy="10" r="0.8" fill={c}/><circle cx="14.5" cy="10" r="0.8" fill={c}/><path d="M9.5 14.5Q12 16.3 14.5 14.5"/></>, s, c),
  Overlay:    ({s=20, c='currentColor'}) => _svg(<><rect x="3.5" y="3.5" width="12" height="12" rx="1.5"/><rect x="8.5" y="8.5" width="12" height="12" rx="1.5"/></>, s, c),
  Chart:      ({s=20, c='currentColor'}) => _svg(<><path d="M4 20h16"/><rect x="6" y="12" width="3" height="6" rx="0.5"/><rect x="11" y="8" width="3" height="10" rx="0.5"/><rect x="16" y="14" width="3" height="4" rx="0.5"/></>, s, c),
  Compare:    ({s=20, c='currentColor'}) => _svg(<><path d="M12 3v18"/><path d="M4 7h6M4 11h6M4 15h6"/><path d="M14 9h6M14 13h6M14 17h6"/></>, s, c),

  /* --- Clinical (3) --- */
  Patient:    ({s=20, c='currentColor'}) => _svg(<><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>, s, c),
  Chart2:     ({s=20, c='currentColor'}) => _svg(<><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8 3.5v2h8v-2"/><path d="M8 10h8M8 13.5h8M8 17h5"/></>, s, c),
  Calendar:   ({s=20, c='currentColor'}) => _svg(<><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></>, s, c),

  /* --- Status (2) --- */
  Info:       ({s=20, c='currentColor'}) => _svg(<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/></>, s, c),
  Check:      ({s=20, c='currentColor'}) => _svg(<path d="M5 12.5 10 17l9-10"/>, s, c),

  /* --- Misc (still needed by existing screens) --- */
  Lock:       ({s=20, c='currentColor'}) => _svg(<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>, s, c),
  User:       ({s=20, c='currentColor'}) => _svg(<><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>, s, c),
  Dot:        ({s=8, c='currentColor'}) => <svg width={s} height={s} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill={c}/></svg>,
};

/* Ordered catalog for the docs page — 24 library icons, grouped. */
const ICON_CATALOG = [
  { group: 'Navegação',        items: [
    ['Home', 'Voltar ao Hub'],
    ['Back', 'Voltar'],
    ['Arrow', 'Avançar / continuar'],
    ['Close', 'Fechar, cancelar'],
  ]},
  { group: 'Ações',            items: [
    ['Upload', 'Enviar arquivo'],
    ['Download', 'Exportar foto ou laudo'],
    ['Share', 'Compartilhar com paciente'],
    ['Play', 'Iniciar análise'],
    ['Settings', 'Ajustes'],
    ['More', 'Ações extras'],
  ]},
  { group: 'Captura & mídia',  items: [
    ['Camera', 'Capturar foto agora'],
    ['Tv', 'Espelhamento Apple TV'],
    ['Fullscreen', 'Modo apresentação'],
    ['Image', 'Foto do paciente'],
  ]},
  { group: 'Análise',          items: [
    ['Scan', 'Analisar imagem'],
    ['FaceLandmark', 'Detecção facial'],
    ['Overlay', 'Ligar/desligar overlay'],
    ['Chart', 'Distribuição por região'],
    ['Compare', 'Comparar com consulta anterior'],
  ]},
  { group: 'Clínico',          items: [
    ['Patient', 'Paciente'],
    ['Chart2', 'Prontuário'],
    ['Calendar', 'Data da consulta'],
  ]},
  { group: 'Status',           items: [
    ['Info', 'Informação, disclaimer'],
    ['Check', 'Confirmado, concluído'],
  ]},
];

/* ---------- BADGE ---------- */
function Badge({ children, tone = 'neutral', size = 'md', icon }) {
  const tones = {
    neutral:   { bg: 'var(--neutral-150)', fg: 'var(--neutral-800)', dot: 'var(--neutral-500)' },
    info:      { bg: 'var(--sem-info-bg)', fg: 'var(--sem-info)', dot: 'var(--sem-info)' },
    success:   { bg: 'var(--sem-success-bg)', fg: 'var(--sem-success)', dot: 'var(--sem-success)' },
    attention: { bg: 'var(--sem-attention-bg)', fg: 'var(--sem-attention)', dot: 'var(--sem-attention)' },
    alert:     { bg: 'var(--sem-alert-bg)', fg: 'var(--sem-alert)', dot: 'var(--sem-alert)' },
    brand:     { bg: 'var(--brand-primary-100)', fg: 'var(--brand-primary-700)', dot: 'var(--brand-primary-600)' },
    acne:      { bg: 'var(--mod-acne-soft)', fg: 'var(--mod-acne)', dot: 'var(--mod-acne)' },
    melasma:   { bg: 'var(--mod-melasma-soft)', fg: 'var(--mod-melasma)', dot: 'var(--mod-melasma)' },
    textura:   { bg: 'var(--mod-textura-soft)', fg: 'var(--mod-textura)', dot: 'var(--mod-textura)' },
    expression:{ bg: 'var(--mod-expression-soft)', fg: 'var(--mod-expression)', dot: 'var(--mod-expression)' },
  }[tone] || {};
  const pad = size === 'lg' ? '6px 14px' : '3px 10px';
  const fs = size === 'lg' ? 14 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, fontSize: fs, fontWeight: 500,
      background: tones.bg, color: tones.fg,
      borderRadius: 'var(--r-pill)',
      letterSpacing: '0.005em',
      lineHeight: 1.4,
    }}>
      {icon || <span style={{ width: 6, height: 6, borderRadius: 999, background: tones.dot, display: 'inline-block' }} />}
      {children}
    </span>
  );
}

/* ---------- CARD ---------- */
function Card({ children, padding = 20, style, onClick, hover }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        padding,
        boxShadow: hover && h ? 'var(--sh-md)' : 'var(--sh-sm)',
        transition: 'box-shadow var(--dur-2) var(--ease), transform var(--dur-2) var(--ease)',
        cursor: onClick ? 'pointer' : 'default',
        transform: hover && h ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >{children}</div>
  );
}

Object.assign(window, { DermaProLogo, Button, Badge, Card, Icon, ICON_CATALOG });

/* ---------- DARK VARIANTS for Modo Apresentação ---------- */
/* Surface: neutral-1000. Text: neutral-100 (strong), neutral-300 (muted).
   Strokes/hairlines: oklch(1 0 0 / 0.08–0.12). Shadows are disabled — depth comes from low-opacity surfaces. */

function DarkButton({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, disabled }) {
  const pad = size === 'lg' ? '14px 22px' : size === 'sm' ? '6px 12px' : '10px 18px';
  const fs = size === 'lg' ? 17 : size === 'sm' ? 13 : 15;
  const styles = {
    primary:   { bg: 'var(--brand-accent-500)', fg: 'var(--neutral-1000)', border: 'transparent', hover: 'var(--brand-accent-400)' },
    secondary: { bg: 'oklch(1 0 0 / 0.08)', fg: 'var(--neutral-100)', border: 'oklch(1 0 0 / 0.12)', hover: 'oklch(1 0 0 / 0.12)' },
    ghost:     { bg: 'transparent', fg: 'var(--neutral-200)', border: 'transparent', hover: 'oklch(1 0 0 / 0.06)' },
    quiet:     { bg: 'oklch(1 0 0 / 0.04)', fg: 'var(--neutral-100)', border: 'transparent', hover: 'oklch(1 0 0 / 0.08)' },
  }[variant];
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: 'var(--ff-sans)', fontWeight: 500, fontSize: fs, padding: pad,
        borderRadius: 'var(--r-md)',
        background: h && !disabled ? styles.hover : styles.bg,
        color: styles.fg, border: `1px solid ${styles.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
        transition: 'background var(--dur-1) var(--ease)',
        letterSpacing: '-0.005em',
      }}>
      {icon}{children}{iconRight}
    </button>
  );
}

function DarkBadge({ children, tone = 'neutral', size = 'md', icon }) {
  const tones = {
    neutral:   { bg: 'oklch(1 0 0 / 0.06)',           fg: 'var(--neutral-200)',           dot: 'var(--neutral-400)' },
    info:      { bg: 'oklch(0.58 0.08 230 / 0.15)',   fg: 'oklch(0.80 0.08 230)',         dot: 'oklch(0.80 0.08 230)' },
    success:   { bg: 'oklch(0.56 0.08 135 / 0.15)',   fg: 'oklch(0.82 0.10 135)',         dot: 'oklch(0.82 0.10 135)' },
    attention: { bg: 'oklch(0.68 0.12 65 / 0.15)',    fg: 'oklch(0.88 0.12 75)',          dot: 'oklch(0.88 0.12 75)' },
    alert:     { bg: 'oklch(0.48 0.09 20 / 0.18)',    fg: 'oklch(0.82 0.09 20)',          dot: 'oklch(0.82 0.09 20)' },
    brand:     { bg: 'oklch(1 0 0 / 0.08)',           fg: 'var(--brand-accent-400)',      dot: 'var(--brand-accent-500)' },
    acne:      { bg: 'oklch(0.62 0.09 30 / 0.18)',    fg: 'oklch(0.85 0.09 30)',          dot: 'oklch(0.75 0.10 30)' },
    melasma:   { bg: 'oklch(0.55 0.07 330 / 0.18)',   fg: 'oklch(0.82 0.07 330)',         dot: 'oklch(0.72 0.08 330)' },
    textura:   { bg: 'oklch(0.55 0.06 150 / 0.18)',   fg: 'oklch(0.82 0.08 150)',         dot: 'oklch(0.72 0.08 150)' },
    expression:{ bg: 'oklch(0.52 0.06 255 / 0.20)',   fg: 'oklch(0.82 0.08 255)',         dot: 'oklch(0.72 0.08 255)' },
  }[tone];
  const pad = size === 'lg' ? '8px 16px' : '4px 12px';
  const fs = size === 'lg' ? 15 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, fontSize: fs, fontWeight: 500,
      background: tones.bg, color: tones.fg,
      borderRadius: 'var(--r-pill)', lineHeight: 1.4,
    }}>
      {icon || <span style={{ width: 6, height: 6, borderRadius: 999, background: tones.dot, display: 'inline-block' }} />}
      {children}
    </span>
  );
}

function DarkCard({ children, padding = 20, style, emphasis = 'default' }) {
  const surfaces = {
    default: { bg: 'oklch(1 0 0 / 0.04)', border: 'oklch(1 0 0 / 0.08)' },
    raised:  { bg: 'oklch(1 0 0 / 0.06)', border: 'oklch(1 0 0 / 0.10)' },
    inset:   { bg: 'oklch(0 0 0 / 0.25)', border: 'oklch(1 0 0 / 0.06)' },
  }[emphasis];
  return (
    <div style={{
      background: surfaces.bg, border: `1px solid ${surfaces.border}`,
      borderRadius: 'var(--r-lg)', padding, color: 'var(--neutral-100)',
      ...style,
    }}>{children}</div>
  );
}

function DarkBarRow({ label, value, color, amplified }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
        <span style={{ fontSize: amplified ? 20 : 15, color: 'var(--neutral-100)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: amplified ? 18 : 13, fontFamily: 'var(--ff-mono)', color: 'var(--neutral-300)' }}>{value}%</span>
      </div>
      <div style={{ height: amplified ? 12 : 8, background: 'oklch(1 0 0 / 0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999 }}/>
      </div>
    </div>
  );
}

function DarkInfoPanel({ children, icon }) {
  return (
    <div style={{
      padding: 18, borderRadius: 'var(--r-lg)',
      background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)',
      display: 'flex', gap: 14, alignItems: 'flex-start', color: 'var(--neutral-200)',
      fontSize: 15, lineHeight: 1.5,
    }}>
      {icon || <Icon.Info s={20} c="var(--neutral-300)"/>}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

Object.assign(window, { DarkButton, DarkBadge, DarkCard, DarkBarRow, DarkInfoPanel });

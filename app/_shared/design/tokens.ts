/**
 * DermaPro — Design Tokens (TypeScript mirror)
 *
 * HIERARQUIA:
 *   design/tokens.css  → primitivas CSS cruas (source of truth — não editar)
 *   app/globals.css    → importa tokens.css + define aliases semânticos CSS
 *   este arquivo       → espelho TypeScript para uso programático
 *                        (Canvas rendering, estilos dinâmicos em JS, testes)
 *
 * SYNC: qualquer mudança em design/tokens.css deve ser refletida aqui.
 * Busque por "// SYNC" para encontrar os pontos de atualização.
 */

// ─── PRIMITIVAS — NEUTROS (escala ink, dark-first) ──────────────────────────
// SYNC: primitives.ink reflete --ink-* de tokens.css

/** Escala de neutros com temperatura quente. ink-0 = mais escuro, ink-11 = mais claro. */
export const ink = {
  0:  '#0b0d10',
  1:  '#11141a',
  2:  '#161a21',
  3:  '#1d222b',
  4:  '#262c37',
  5:  '#313846',
  6:  '#4b5364',
  7:  '#6c7585',
  8:  '#9ba3b2',
  9:  '#c8cdd6',
  10: '#e7eaef',
  11: '#f4f6f9',
} as const;

// ─── PRIMITIVAS — COR PRIMÁRIA (azul-petróleo profundo) ──────────────────────

/** Azul-petróleo — cor primária da marca. 500 = base de botão. */
export const primary = {
  50:  '#e6f0f2',
  100: '#c8dde1',
  200: '#8dbac2',
  300: '#5a97a2',
  400: '#35767f',  // hover de botão (mais claro em dark mode)
  500: '#1f5962',  // base de botão primário
  600: '#17464d',  // pressed
  700: '#103538',
  800: '#0b2528',
} as const;

// ─── PRIMITIVAS — SECUNDÁRIA (bege quente) ────────────────────────────────────

/** Bege quente — tom de acolhimento. */
export const warm = {
  50:  '#f4ede2',
  100: '#e8dcc7',
  200: '#d5c3a3',
  300: '#b8a27e',
  400: '#9b855f',
  500: '#7d6a49',
  600: '#5d4e34',
} as const;

// ─── PRIMITIVAS — ACENTO (âmbar suave) ───────────────────────────────────────

/** Âmbar suave — acento para destaques. 400 = base. */
export const amber = {
  200: '#f1d9a3',
  300: '#e3c07a',  // hover (mais claro)
  400: '#d2a556',  // base
  500: '#b68a3f',  // pressed
} as const;

// ─── PRIMITIVAS — SEMÂNTICAS ─────────────────────────────────────────────────

/** Cores semânticas. Sem vermelho intenso — vermelho=vinho suave. */
export const semantic = {
  info:          '#5a8fa8',
  success:       '#7a9661',
  attention:     '#d2a556',
  alert:         '#a65a5a',  // vinho suave, não vermelho intenso
  infoBg:        'rgba(90, 143, 168, 0.12)',
  successBg:     'rgba(122, 150, 97, 0.12)',
  attentionBg:   'rgba(210, 165, 86, 0.14)',
  alertBg:       'rgba(166, 90, 90, 0.14)',
} as const;

// ─── PRIMITIVAS — MÓDULOS ────────────────────────────────────────────────────

/**
 * Cada módulo tem uma cor de identidade e uma versão "soft" (overlay leve).
 * "soft" = rgba com 15% de opacidade sobre dark surface — usado em ícones e barras.
 * Nota de naming: CSS usa --mod-textura e --mod-expression (nomes dos mockups);
 * aqui exportamos por id do módulo conforme config/modules.ts.
 */
export const modules = {
  /** Módulo Acne (id: 'acne') — terracota suave.
   *  hayashi: 4 níveis de severidade derivados da cor base (I=sutil → IV=vinho).
   *  CSS vars correspondentes: --mod-acne-level-{i|ii|iii|iv} em globals.css.
   *  Usar as CSS vars em componentes; estes valores JS são para Canvas e jsPDF. */
  acne: {
    base:    '#c97d6a',
    soft:    'rgba(201, 125, 106, 0.15)',
    hayashi: {
      i:   'var(--mod-acne-level-i)',    // Leve — terracota muito sutil
      ii:  'var(--mod-acne-level-ii)',   // Moderado
      iii: 'var(--mod-acne-level-iii)',  // Marcante — terracota pleno
      iv:  'var(--mod-acne-level-iv)',   // Intenso — vinho suave
    },
  },
  /** Módulo Melasma (id: 'melasma') — âmbar-caramelo */
  melasma:    { base: '#b78a5a', soft: 'rgba(183, 138, 90, 0.15)' },
  /** Módulo Textura (id: 'textura') — verde-azulado */
  textura:    { base: '#6e9a8e', soft: 'rgba(110, 154, 142, 0.15)' },
  /** Módulo Sinais de Expressão (id: 'linhas') — lilás fumê */
  linhas:     { base: '#8a7ba8', soft: 'rgba(138, 123, 168, 0.15)' },
  /** Módulo Rosácea (id: 'rosacea') — rosê vinho (desativado) */
  rosacea:    { base: '#a87780', soft: 'rgba(168, 119, 128, 0.15)' },
  /** Módulo Estrutura Facial (id: 'estrutura-facial') — azul-ardósia (desativado) */
  estrutura:  { base: '#7a8aa0', soft: 'rgba(122, 138, 160, 0.15)' },
} as const;

// ─── PRIMITIVAS — OVERLAYS DE ANÁLISE ────────────────────────────────────────

/**
 * Overlays semitransparentes sobre a foto analisada.
 * fill = preenchimento da máscara/bbox. stroke = borda do shape.
 */
export const overlays = {
  /** Bounding box de lesão acneica */
  lesion:    { fill: 'rgba(226, 138, 123, 0.55)', stroke: 'rgba(226, 138, 123, 0.85)' },
  /** Área de hiperpigmentação (melasma) */
  pigment:   { fill: 'rgba(188, 140, 92, 0.40)',  stroke: 'rgba(188, 140, 92, 0.70)' },
  /** Área de brilho/oleosidade (textura) */
  shine:     { fill: 'rgba(238, 213, 140, 0.45)', stroke: 'rgba(238, 213, 140, 0.70)' },
  /** Linhas detectadas (sinais de expressão) */
  lines:     { fill: 'rgba(172, 150, 194, 0.55)', stroke: 'rgba(172, 150, 194, 0.85)' },
} as const;

// ─── ALIASES SEMÂNTICOS (espelho dos CSS vars em globals.css) ─────────────────
// Úteis quando componentes precisam de cores em JS (ex: Canvas, Recharts, jsPDF).

/**
 * Aliases de superfície para o dark mode.
 * Referência canônica: variáveis CSS `--bg-*` em globals.css.
 */
export const surface = {
  /** Fundo da página (#11141a = ink-1) */
  canvas:        ink[1],
  /** Fundo de cards e painéis (#161a21 = ink-2) */
  card:          ink[2],
  /** Fundo em estado hover/elevado (#1d222b = ink-3) */
  elevated:      ink[3],
  /** Cor de bordas sutis (#262c37 = ink-4) */
  border:        ink[4],
} as const;

/**
 * Aliases de texto para o dark mode.
 * Referência canônica: variáveis CSS `--text-*` em globals.css.
 */
export const text = {
  /** Texto forte: títulos (#f4f6f9 = ink-11) */
  strong:  ink[11],
  /** Texto principal (#e7eaef = ink-10) */
  body:    ink[10],
  /** Texto secundário/muted (#9ba3b2 = ink-8) */
  muted:   ink[8],
  /** Texto muito sutil/disabled (#4b5364 = ink-6) */
  faint:   ink[6],
} as const;

// ─── TIPOGRAFIA ───────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  },
  fontSize: {
    caption: '12px',
    small:   '14px',
    base:    '16px',
    h3:      '20px',
    h2:      '28px',
    h1:      '40px',
    display: '64px',
  },
  fontWeight: {
    regular:  400,
    medium:   500,
    semibold: 600,
  },
  lineHeight: {
    tight:  1.15,
    snug:   1.3,
    normal: 1.5,
  },
} as const;

// ─── ESPAÇAMENTO ──────────────────────────────────────────────────────────────

/** Escala 4px/8px compatível com Tailwind. */
export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

// ─── RAIOS ────────────────────────────────────────────────────────────────────

export const radius = {
  sm:   '6px',
  md:   '10px',   // padrão
  lg:   '14px',
  xl:   '20px',
  full: '999px',  // pill / círculo
} as const;

// ─── SOMBRAS ──────────────────────────────────────────────────────────────────

export const shadow = {
  sm:   '0 1px 2px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.18)',
  md:   '0 4px 16px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.20)',
  lg:   '0 12px 40px rgba(0,0,0,0.40), 0 2px 6px rgba(0,0,0,0.24)',
  glow: '0 0 0 1px rgba(141, 186, 194, 0.18), 0 10px 32px rgba(31, 89, 98, 0.25)',
} as const;

// ─── MODO APRESENTAÇÃO ────────────────────────────────────────────────────────

/**
 * Multiplicadores para o Modo Apresentação (Apple TV).
 * Aplicados via classe CSS `.presentation-mode` no document.body.
 */
export const presentationMode = {
  /** Amplia tipografia em 20% */
  fontSizeMultiplier: 1.2,
  /** Boost de contraste nos overlays */
  contrastBoost: 1.15,
} as const;

// ─── MOTION ───────────────────────────────────────────────────────────────────

export const motion = {
  easing: {
    out:   'cubic-bezier(0.2, 0.8, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '140ms',
    base: '220ms',
    slow: '380ms',
  },
} as const;

// ─── EXPORT CONSOLIDADO ───────────────────────────────────────────────────────

/** Objeto raiz com todos os tokens — use para iteração ou serialização. */
export const tokens = {
  ink,
  primary,
  warm,
  amber,
  semantic,
  modules,
  overlays,
  surface,
  text,
  typography,
  spacing,
  radius,
  shadow,
  presentationMode,
  motion,
} as const;

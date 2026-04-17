// ============================================================
// DermaPro — Logo
// Conceito: círculo (rosto de frente) + curva sutil (análise/sorriso)
// + ponto (landmark MediaPipe). Monocromático.
// ============================================================

const DermaMark = ({ size = 48, color = 'currentColor' }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-label="DermaPro"
  >
    {/* círculo principal (rosto) */}
    <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="1.8" fill="none" />
    {/* curva sutil — linha de análise / sorriso discreto */}
    <path
      d="M13 26 Q 24 34, 35 26"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
      opacity="0.75"
    />
    {/* landmark: ponto pequeno (MediaPipe) */}
    <circle cx="31" cy="19" r="1.8" fill={color} />
  </svg>
);

const DermaWordmark = ({ size = 28, color = 'currentColor', markSize, gap = 10 }) => {
  const mSize = markSize ?? Math.round(size * 1.3);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap, color }}>
      <DermaMark size={mSize} color={color} />
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: size,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color,
        }}
      >
        <span style={{ fontWeight: 500 }}>Derma</span>
        <span style={{ fontWeight: 600 }}>Pro</span>
      </span>
    </div>
  );
};

Object.assign(window, { DermaMark, DermaWordmark });

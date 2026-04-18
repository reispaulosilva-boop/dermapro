import { describe, it, expect } from 'vitest';
import {
  ink, primary, amber, semantic, modules, overlays,
  surface, text, typography, spacing, radius, shadow, presentationMode, motion,
  tokens,
} from './tokens';

describe('tokens — primitivas', () => {
  it('ink scale tem 12 entradas (0..11)', () => {
    expect(Object.keys(ink)).toHaveLength(12);
    expect(ink[0]).toBe('#0b0d10');
    expect(ink[11]).toBe('#f4f6f9');
  });

  it('primary scale tem 9 entradas (50..800)', () => {
    expect(Object.keys(primary)).toHaveLength(9);
    expect(primary[500]).toBe('#1f5962');  // base do botão primário
  });

  it('amber scale — base é amber-400', () => {
    expect(amber[400]).toBe('#d2a556');
    expect(amber[300]).toBe('#e3c07a');    // hover (mais claro)
  });

  it('semantic — sem vermelho intenso (alert é vinho suave)', () => {
    // #a65a5a é vinho suave, não vermelho puro (#ff0000)
    expect(semantic.alert).toBe('#a65a5a');
    expect(semantic.alert).not.toBe('#ff0000');
    expect(semantic.alert).not.toBe('#ff3333');
  });
});

describe('tokens — módulos', () => {
  it('todos os 6 módulos têm base e soft', () => {
    const ids = ['acne', 'melasma', 'textura', 'linhas', 'rosacea', 'estrutura'] as const;
    for (const id of ids) {
      expect(modules[id]).toHaveProperty('base');
      expect(modules[id]).toHaveProperty('soft');
      expect(modules[id].base).toMatch(/^#[0-9a-f]{6}$/i);
      expect(modules[id].soft).toMatch(/^rgba/);
    }
  });
});

describe('tokens — overlays', () => {
  it('cada overlay tem fill e stroke', () => {
    for (const [, val] of Object.entries(overlays)) {
      expect(val).toHaveProperty('fill');
      expect(val).toHaveProperty('stroke');
    }
  });

  it('stroke é mais opaco que fill (overlay maior contraste)', () => {
    // Extrai o alpha de uma string rgba
    const getAlpha = (rgba: string) => {
      const m = rgba.match(/rgba\([^)]+,\s*([\d.]+)\)/);
      return m ? parseFloat(m[1]) : 0;
    };
    expect(getAlpha(overlays.lesion.stroke)).toBeGreaterThan(getAlpha(overlays.lesion.fill));
    expect(getAlpha(overlays.pigment.stroke)).toBeGreaterThan(getAlpha(overlays.pigment.fill));
  });
});

describe('tokens — aliases semânticos', () => {
  it('surface aponta para valores hex do ink scale', () => {
    expect(surface.canvas).toBe(ink[1]);
    expect(surface.card).toBe(ink[2]);
    expect(surface.elevated).toBe(ink[3]);
    expect(surface.border).toBe(ink[4]);
  });

  it('text aponta para valores hex do ink scale', () => {
    expect(text.strong).toBe(ink[11]);
    expect(text.body).toBe(ink[10]);
    expect(text.muted).toBe(ink[8]);
    expect(text.faint).toBe(ink[6]);
  });
});

describe('tokens — tipografia', () => {
  it('fontFamily inclui DM Sans', () => {
    expect(typography.fontFamily.sans).toContain('DM Sans');
  });

  it('fontFamily inclui JetBrains Mono', () => {
    expect(typography.fontFamily.mono).toContain('JetBrains Mono');
  });

  it('pesos usados são apenas 400, 500, 600', () => {
    const weights = Object.values(typography.fontWeight);
    expect(weights).toEqual(expect.arrayContaining([400, 500, 600]));
    expect(weights).not.toContain(300);
    expect(weights).not.toContain(700);
  });
});

describe('tokens — presentationMode', () => {
  it('fontSizeMultiplier é 1.2', () => {
    expect(presentationMode.fontSizeMultiplier).toBe(1.2);
  });

  it('contrastBoost é > 1', () => {
    expect(presentationMode.contrastBoost).toBeGreaterThan(1);
  });
});

describe('tokens — export consolidado', () => {
  it('objeto tokens inclui todos os grupos', () => {
    const expectedGroups = ['ink', 'primary', 'amber', 'semantic', 'modules', 'overlays',
      'surface', 'text', 'typography', 'spacing', 'radius', 'shadow', 'presentationMode', 'motion'];
    for (const group of expectedGroups) {
      expect(tokens).toHaveProperty(group);
    }
  });
});

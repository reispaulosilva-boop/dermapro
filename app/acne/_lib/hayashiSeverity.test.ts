import { describe, it, expect } from 'vitest';
import { hayashiSeverity } from './hayashiSeverity';

describe('hayashiSeverity', () => {
  // ─── Classificação por nível ───────────────────────────────────────────────

  it('0 lesões → Nível I (Leve)', () => {
    const r = hayashiSeverity(0);
    expect(r.level).toBe('I');
    expect(r.label).toBe('Leve');
  });

  it('5 lesões (limite superior I) → Nível I (Leve)', () => {
    const r = hayashiSeverity(5);
    expect(r.level).toBe('I');
    expect(r.label).toBe('Leve');
  });

  it('6 lesões (início do II) → Nível II (Moderado)', () => {
    const r = hayashiSeverity(6);
    expect(r.level).toBe('II');
    expect(r.label).toBe('Moderado');
  });

  it('20 lesões (limite superior II) → Nível II (Moderado)', () => {
    const r = hayashiSeverity(20);
    expect(r.level).toBe('II');
    expect(r.label).toBe('Moderado');
  });

  it('21 lesões (início do III) → Nível III (Marcante)', () => {
    const r = hayashiSeverity(21);
    expect(r.level).toBe('III');
    expect(r.label).toBe('Marcante');
  });

  it('50 lesões (limite superior III) → Nível III (Marcante)', () => {
    const r = hayashiSeverity(50);
    expect(r.level).toBe('III');
    expect(r.label).toBe('Marcante');
  });

  it('51 lesões (início do IV) → Nível IV (Intenso)', () => {
    const r = hayashiSeverity(51);
    expect(r.level).toBe('IV');
    expect(r.label).toBe('Intenso');
  });

  it('100 lesões → Nível IV (Intenso)', () => {
    const r = hayashiSeverity(100);
    expect(r.level).toBe('IV');
    expect(r.label).toBe('Intenso');
  });

  // ─── Restrições de nomenclatura (MASTER §4.4) ─────────────────────────────

  it('label nunca contém "grave"', () => {
    for (const n of [0, 5, 20, 50, 100]) {
      expect(hayashiSeverity(n).label.toLowerCase()).not.toContain('grave');
    }
  });

  it('label nunca contém "severo"', () => {
    for (const n of [0, 5, 20, 50, 100]) {
      expect(hayashiSeverity(n).label.toLowerCase()).not.toContain('severo');
    }
  });

  // ─── Propriedades do resultado ─────────────────────────────────────────────

  it('color referencia CSS custom property do design system', () => {
    for (const n of [0, 10, 30, 60]) {
      expect(hayashiSeverity(n).color).toMatch(/^var\(--mod-acne-level-/);
    }
  });

  it('description inclui a contagem de lesões', () => {
    expect(hayashiSeverity(3).description).toContain('3');
    expect(hayashiSeverity(15).description).toContain('15');
  });

  it('nível I singular: 1 lesão usa forma singular', () => {
    const r = hayashiSeverity(1);
    expect(r.description).toContain('1');
    expect(r.description).toMatch(/lesão/);
  });
});

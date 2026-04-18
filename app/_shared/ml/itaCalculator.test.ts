import { describe, it, expect } from 'vitest';
import { calculateITA, calculateITAFromPixels } from './itaCalculator';
import type { LabColor } from './colorSpace';

describe('calculateITA — valores conhecidos', () => {
  it('(L=70, b=10) → angle ≈ 63.4°, category=very_light', () => {
    const result = calculateITA(70, 10);
    expect(result.angle).toBeCloseTo(63.4, 0);
    expect(result.category).toBe('very_light');
  });

  it('(L=30, b=5) → category=dark (angle ≈ -76°)', () => {
    const result = calculateITA(30, 5);
    expect(result.angle).toBeCloseTo(-76, 0);
    expect(result.category).toBe('dark');
  });

  it('(L=50, b=10) → angle=0°, category=brown', () => {
    const result = calculateITA(50, 10);
    expect(result.angle).toBeCloseTo(0, 1);
    expect(result.category).toBe('brown');
  });

  it('avgL e avgB são retornados no resultado', () => {
    const result = calculateITA(65, 8);
    expect(result.avgL).toBe(65);
    expect(result.avgB).toBe(8);
  });
});

describe('calculateITA — limites de categoria', () => {
  // Cada threshold é verificado ±0.5° ao redor do limite

  it('angle=55.1° → very_light', () => {
    expect(calculateITA(55 + 5 * Math.tan(55.1 * Math.PI / 180) + 50, 5).category).toBe('very_light');
  });

  it('angle exatamente >55 → very_light', () => {
    // atan2(20, 10) ≈ 63.4° > 55 → very_light
    expect(calculateITA(70, 10).category).toBe('very_light');
  });

  it('angle entre 41 e 55 → light', () => {
    // atan2(L-50, b) = 48°: ajusta L e b para isso
    // atan2(10, 8.7) ≈ 49°
    expect(calculateITA(60, 8.7).category).toBe('light');
  });

  it('angle entre 28 e 41 → intermediate', () => {
    // atan2(7, 10) ≈ 35°
    expect(calculateITA(57, 10).category).toBe('intermediate');
  });

  it('angle entre 10 e 28 → tan', () => {
    // atan2(3, 10) ≈ 16.7°
    expect(calculateITA(53, 10).category).toBe('tan');
  });

  it('angle entre -30 e 10 → brown', () => {
    // atan2(0, 10) = 0°
    expect(calculateITA(50, 10).category).toBe('brown');
  });

  it('angle < -30 → dark', () => {
    // atan2(-15, 10) ≈ -56.3° < -30 → dark
    expect(calculateITA(35, 10).category).toBe('dark');
  });
});

describe('calculateITAFromPixels', () => {
  it('array vazio retorna resultado neutro sem lançar erro', () => {
    const result = calculateITAFromPixels([]);
    expect(result).toHaveProperty('angle');
    expect(result).toHaveProperty('category');
  });

  it('pixels uniformes retornam ITA correto', () => {
    const pixels: LabColor[] = Array.from({ length: 50 }, () => ({ L: 70, a: 5, b: 10 }));
    const result = calculateITAFromPixels(pixels);
    expect(result.avgL).toBeCloseTo(70, 1);
    expect(result.avgB).toBeCloseTo(10, 1);
    expect(result.category).toBe('very_light');
  });

  it('removeOutliers=true não lança erro', () => {
    const pixels: LabColor[] = [
      { L: 70, a: 5, b: 10 },
      { L: 72, a: 5, b: 11 },
      { L: 5, a: 0, b: 0 },   // outlier
      { L: 68, a: 5, b: 9 },
      { L: 71, a: 5, b: 10 },
    ];
    expect(() => calculateITAFromPixels(pixels, true)).not.toThrow();
  });
});

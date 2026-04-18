import { describe, it, expect } from 'vitest';
import { MODULES, getAllModules, getEnabledModules, getModuleById } from './modules';

describe('modules — getAllModules', () => {
  it('retorna exatamente 6 módulos', () => {
    expect(getAllModules()).toHaveLength(6);
  });

  it('retorna módulos em ordem crescente de order', () => {
    const all = getAllModules();
    for (let i = 1; i < all.length; i++) {
      expect(all[i]!.order).toBeGreaterThan(all[i - 1]!.order);
    }
  });
});

describe('modules — getEnabledModules', () => {
  it('retorna exatamente 4 módulos habilitados', () => {
    expect(getEnabledModules()).toHaveLength(4);
  });

  it('todos os módulos retornados têm enabled: true', () => {
    for (const m of getEnabledModules()) {
      expect(m.enabled).toBe(true);
    }
  });

  it('módulos ativos são acne, melasma, textura, linhas', () => {
    const ids = getEnabledModules().map(m => m.id);
    expect(ids).toContain('acne');
    expect(ids).toContain('melasma');
    expect(ids).toContain('textura');
    expect(ids).toContain('linhas');
  });

  it('módulos desativados são rosacea e estrutura-facial', () => {
    const disabledIds = MODULES.filter(m => !m.enabled).map(m => m.id);
    expect(disabledIds).toContain('rosacea');
    expect(disabledIds).toContain('estrutura-facial');
  });
});

describe('modules — integridade dos dados', () => {
  it('todos os módulos têm campos obrigatórios preenchidos', () => {
    for (const m of MODULES) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(m.href).toBeTruthy();
      expect(m.icon).toBeTruthy();
      expect(typeof m.order).toBe('number');
      expect(typeof m.enabled).toBe('boolean');
    }
  });

  it('IDs são únicos', () => {
    const ids = MODULES.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('orders são únicas', () => {
    const orders = MODULES.map(m => m.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('hrefs começam com "/"', () => {
    for (const m of MODULES) {
      expect(m.href).toMatch(/^\//);
    }
  });

  it('badge dos módulos ativos é "beta"', () => {
    for (const m of getEnabledModules()) {
      expect(m.badge).toBe('beta');
    }
  });

  it('badge dos módulos desativados é "em-breve"', () => {
    for (const m of MODULES.filter(m => !m.enabled)) {
      expect(m.badge).toBe('em-breve');
    }
  });
});

describe('modules — getModuleById', () => {
  it('encontra módulo por id existente', () => {
    const mod = getModuleById('acne');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('acne');
  });

  it('retorna undefined para id inexistente', () => {
    expect(getModuleById('inexistente')).toBeUndefined();
  });
});

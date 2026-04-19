import { describe, it, expect } from 'vitest';
import { getModelConfig, MODELS, USE_STUB_DETECTOR } from './models';

describe('getModelConfig', () => {
  it('retorna config correta para id válido', () => {
    const config = getModelConfig('acne-yolov8m');
    expect(config.id).toBe('acne-yolov8m');
    expect(config.classNames).toContain('lesao_acneiforme');
  });

  it('lança erro para id inválido', () => {
    expect(() => getModelConfig('modelo-inexistente')).toThrow(
      'não registrado em MODELS'
    );
  });
});

describe('acne-yolov8m config', () => {
  const config = MODELS['acne-yolov8m'];

  it('URL é HTTPS', () => {
    expect(config.url).toMatch(/^https:\/\//);
  });

  it('classNames não é vazio', () => {
    expect(config.classNames.length).toBeGreaterThan(0);
  });

  it('inputSize é positivo', () => {
    expect(config.inputSize).toBeGreaterThan(0);
  });

  it('expectedSize reflete modelo YOLOv8m (~99 MB)', () => {
    const mb = config.expectedSize / (1024 * 1024);
    expect(mb).toBeGreaterThan(50);
    expect(mb).toBeLessThan(200);
  });

  it('URL aponta para release do acne-yolov8m', () => {
    expect(config.url).toContain('acne-yolov8m.onnx');
    expect(config.url).toContain('v0.2.0-acne-model');
  });

  it('licença é Apache 2.0', () => {
    expect(config.license).toBe('Apache 2.0');
  });

  it('atribuição menciona autores originais', () => {
    expect(config.attribution).toContain('Nathaniel Handan');
    expect(config.attribution).toContain('Amina Shiga');
  });
});

describe('USE_STUB_DETECTOR', () => {
  it('é um booleano', () => {
    expect(typeof USE_STUB_DETECTOR).toBe('boolean');
  });
});

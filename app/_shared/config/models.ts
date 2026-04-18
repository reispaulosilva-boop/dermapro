export interface ModelConfig {
  id: string;
  /** URL pública do arquivo .onnx (GitHub Releases) */
  url: string;
  /** Tamanho esperado em bytes — usado para validar download e exibir progresso */
  expectedSize: number;
  classNames: string[];
  inputSize: number;
  license: string;
  attribution: string;
}

export const MODELS: Record<string, ModelConfig> = {
  'acne-yolov8m': {
    id: 'acne-yolov8m',
    url: 'https://github.com/reispaulosilva-boop/dermapro/releases/download/v0.2.0-acne-model/acne-yolov8m.onnx',
    expectedSize: 99 * 1024 * 1024,  // ~99 MB (modelo YOLOv8m medium)
    classNames: ['lesao_acneiforme'],
    inputSize: 640,
    license: 'Apache 2.0',
    attribution: 'Derivado de Tinny-Robot/acne — Nathaniel Handan + Amina Shiga',
  },
};

/** Mudar para true se modelo real não estiver disponível — ativa detector simulado no Bloco 5 */
export const USE_STUB_DETECTOR = false;

export function getModelConfig(id: string): ModelConfig {
  const config = MODELS[id];
  if (!config) throw new Error(`Modelo "${id}" não registrado em MODELS`);
  return config;
}

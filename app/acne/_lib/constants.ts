export const MODULE_ID = 'acne' as const;
export const MODEL_ID = 'acne-yolov8m' as const;
export const MODEL_INPUT_SIZE = 640;
export const DETECTION_CONF_THRESHOLD = 0.25;
export const NMS_IOU_THRESHOLD = 0.45;
export const MIN_UPLOAD_WIDTH = 480;
export const MIN_UPLOAD_HEIGHT = 640;

export const HAYASHI_THRESHOLDS = {
  MILD: 5,       // I: ≤ 5 lesões
  MODERATE: 20,  // II: 6–20
  SEVERE: 50,    // III: 21–50
                 // IV: > 50
} as const;

export const REGION_LABELS_PT = {
  forehead:    'Testa',
  leftCheek:   'Bochecha esquerda',
  rightCheek:  'Bochecha direita',
  chin:        'Mento',
  nose:        'Nariz',
} as const;

export const INSTRUCTIONS_UPLOAD = [
  'Foto frontal, rosto desocluído (retire óculos, afaste o cabelo).',
  'Iluminação difusa e uniforme. Evite flash direto ou sombras fortes.',
  'Sem maquiagem facial para melhor resultado.',
  `Resolução mínima: ${MIN_UPLOAD_WIDTH}×${MIN_UPLOAD_HEIGHT} pixels.`,
];

export const DISCLAIMER_ACNE_PT = {
  title: 'Sobre a análise de acne',
  body:  'Esta ferramenta estima o número de lesões acneiformes visíveis em uma foto. É um apoio à conversa clínica, não substitui avaliação presencial, não fornece diagnóstico e não prescreve tratamentos. Resultados podem variar conforme iluminação, pose e tipo de pele.',
};

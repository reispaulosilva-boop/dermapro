'use client';

// TODO (Bloco 7): implementar estilos de overlay das bounding boxes

export interface OverlayStyle {
  strokeColor: string;
  fillColor: string;
  lineWidth: number;
  cornerRadius: number;
  labelFontSize: number;
}

/** Retorna o estilo de overlay para bboxes de acne.
 *  Em modo apresentação (presentationMode=true), lineWidth e labelFontSize são amplificados. */
export function getAcneOverlayStyle(presentationMode: boolean): OverlayStyle {
  // TODO (Bloco 7): implementar usando tokens --overlay-lesion-stroke e --mod-acne
  return {
    strokeColor:    'var(--overlay-lesion-stroke)',
    fillColor:      'var(--overlay-lesion)',
    lineWidth:      presentationMode ? 3 : 2,
    cornerRadius:   4,
    labelFontSize:  presentationMode ? 13 : 11,
  };
}

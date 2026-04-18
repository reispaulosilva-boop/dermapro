'use client';

// TODO (Bloco 6): implementar countByRegion completo

import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';
import { REGION_LABELS_PT } from './constants';

export interface RegionCount {
  region: keyof typeof REGION_LABELS_PT;
  count: number;
  percentage: number;
}

export function countByRegion(_detections: Detection[], _rois: SkinROI[]): RegionCount[] {
  // TODO (Bloco 6): atribuir cada Detection à ROI que contém seu centro
  throw new Error('countByRegion: não implementado ainda (Bloco 6)');
}

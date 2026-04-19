import type { SkinROI } from '@/app/_shared/ml/roiExtractor';
import { isPointInROI } from '@/app/_shared/ml/roiExtractor';
import type { Detection } from '@/app/_shared/ml/yolo';
import { REGION_LABELS_PT } from './constants';

export interface RegionCount {
  region: keyof typeof REGION_LABELS_PT;
  label: string;
  count: number;
  /** Percentual em relação ao total de detecções (pode somar > 100% se ROIs se sobrepõem) */
  percentage: number;
}

/**
 * Filtra detecções cujo centro do bbox está dentro de uma ROI.
 * Usa o centro (cx, cy) como ponto de atribuição — convencional para lesões.
 */
export function filterDetectionsByROI(detections: Detection[], roi: SkinROI): Detection[] {
  return detections.filter(det => {
    const cx = (det.bbox[0] + det.bbox[2]) / 2;
    const cy = (det.bbox[1] + det.bbox[3]) / 2;
    return isPointInROI({ x: cx, y: cy }, roi);
  });
}

/**
 * Para cada ROI, conta quantas detecções têm centro dentro dela.
 * Retorna apenas as ROIs presentes em REGION_LABELS_PT (as 5 do módulo de acne).
 */
export function countByRegion(detections: Detection[], rois: SkinROI[]): RegionCount[] {
  const total = detections.length;
  return rois
    .filter(roi => roi.name in REGION_LABELS_PT)
    .map(roi => {
      const count = filterDetectionsByROI(detections, roi).length;
      return {
        region: roi.name as keyof typeof REGION_LABELS_PT,
        label:  REGION_LABELS_PT[roi.name as keyof typeof REGION_LABELS_PT],
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
}

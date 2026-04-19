import { describe, it, expect, vi } from 'vitest';
import { drawBboxesOnCanvas, getAcneOverlayStyle } from './acneOverlay';
import type { Detection } from '@/app/_shared/ml/yolo';

function makeCtx(): CanvasRenderingContext2D {
  return {
    beginPath:    vi.fn(),
    arc:          vi.fn(),
    fill:         vi.fn(),
    stroke:       vi.fn(),
    fillText:     vi.fn(),
    fillStyle:    '',
    strokeStyle:  '',
    lineWidth:    0,
    font:         '',
    textAlign:    'start',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;
}

function makeDet(x1: number, y1: number, x2: number, y2: number, score = 0.8): Detection {
  return { bbox: [x1, y1, x2, y2], score, classId: 0, className: 'lesao_acneiforme' };
}

// ─── drawBboxesOnCanvas ───────────────────────────────────────────────────────

describe('drawBboxesOnCanvas — círculos', () => {
  it('chama arc exatamente uma vez por detecção (3 detecções → 3 arcs)', () => {
    const ctx = makeCtx();
    const dets: Detection[] = [
      makeDet(10, 10, 30, 30),
      makeDet(50, 50, 80, 80),
      makeDet(100, 100, 120, 140),
    ];
    drawBboxesOnCanvas(ctx, dets, getAcneOverlayStyle(false), true);
    expect(ctx.arc).toHaveBeenCalledTimes(3);
  });

  it('não chama arc quando lista está vazia', () => {
    const ctx = makeCtx();
    drawBboxesOnCanvas(ctx, [], getAcneOverlayStyle(false), true);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('centro do arco está no centro da bbox', () => {
    const ctx = makeCtx();
    drawBboxesOnCanvas(ctx, [makeDet(20, 40, 60, 100)], getAcneOverlayStyle(false), true);
    const [cx, cy] = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls[0] as number[];
    expect(cx).toBe(40);  // (20 + 60) / 2
    expect(cy).toBe(70);  // (40 + 100) / 2
  });
});

describe('drawBboxesOnCanvas — labels', () => {
  it('não exibe "?" para score >= 0.30', () => {
    const ctx = makeCtx();
    drawBboxesOnCanvas(ctx, [makeDet(10, 10, 30, 30, 0.75)], getAcneOverlayStyle(false), true);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('exibe "?" para score < 0.30 quando showLabels true', () => {
    const ctx = makeCtx();
    drawBboxesOnCanvas(ctx, [makeDet(10, 10, 30, 30, 0.22)], getAcneOverlayStyle(false), true);
    expect(ctx.fillText).toHaveBeenCalledWith('?', expect.any(Number), expect.any(Number));
  });

  it('não exibe "?" quando showLabels false mesmo com score baixo', () => {
    const ctx = makeCtx();
    drawBboxesOnCanvas(ctx, [makeDet(10, 10, 30, 30, 0.20)], getAcneOverlayStyle(false), false);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});

// ─── getAcneOverlayStyle ──────────────────────────────────────────────────────

describe('getAcneOverlayStyle', () => {
  it('presentation mode → lineWidth 3', () => {
    expect(getAcneOverlayStyle(true).lineWidth).toBe(3);
  });

  it('normal mode → lineWidth 2', () => {
    expect(getAcneOverlayStyle(false).lineWidth).toBe(2);
  });

  it('presentation mode → fillColor com alpha 0.20', () => {
    expect(getAcneOverlayStyle(true).fillColor).toContain('0.20');
  });

  it('normal mode → fillColor com alpha 0.15', () => {
    expect(getAcneOverlayStyle(false).fillColor).toContain('0.15');
  });
});

'use client';

import type { SeverityResult } from './hayashiSeverity';
import type { RegionCount } from './countByRegion';

export interface AcnePdfInput {
  annotatedCanvas: HTMLCanvasElement | null;
  severity: SeverityResult;
  regionCounts: RegionCount[];
  qaWarnings?: string[];
}

// RGB aproximado de cada nível (derivado de #c97d6a com variações de luminosidade)
const LEVEL_COLORS: Record<string, [number, number, number]> = {
  I:   [220, 205, 201],
  II:  [193, 163, 154],
  III: [201, 125, 106],
  IV:  [120,  62,  55],
};

const MARGIN = 15;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 282;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export async function exportAcnePdf(input: AcnePdfInput): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const now = new Date();
  let y = MARGIN;

  // ─── Cabeçalho ────────────────────────────────────────────────────────────

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('DermaPro', MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Análise de Acne — Relatório de apoio clínico', MARGIN, y + 5.5);

  doc.setFontSize(9);
  doc.text(formatDate(now), PAGE_W - MARGIN, y + 2, { align: 'right' });

  y += 11;
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  // ─── Foto anotada ─────────────────────────────────────────────────────────

  if (input.annotatedCanvas) {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = input.annotatedCanvas.width / dpr;
    exportCanvas.height = input.annotatedCanvas.height / dpr;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      exportCtx.drawImage(input.annotatedCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    }
    const imgData = exportCanvas.toDataURL('image/jpeg', 0.85);
    const natW = exportCanvas.width;
    const natH = exportCanvas.height;
    const aspectRatio = natH / natW;
    const maxImgW = CONTENT_W;
    const maxImgH = 100;
    const imgW = Math.min(maxImgW, maxImgH / aspectRatio);
    const imgH = imgW * aspectRatio;
    const imgX = MARGIN + (CONTENT_W - imgW) / 2;

    doc.addImage(imgData, 'JPEG', imgX, y, imgW, imgH);
    y += imgH + 7;
  }

  // ─── Severidade ───────────────────────────────────────────────────────────

  const lvlColor = LEVEL_COLORS[input.severity.level] ?? LEVEL_COLORS['III']!;

  doc.setFillColor(...lvlColor);
  doc.rect(MARGIN, y, 1.5, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...lvlColor);
  doc.text(input.severity.level, MARGIN + 4.5, y + 7);

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(input.severity.label, MARGIN + 15, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(input.severity.description, MARGIN + 4.5, y + 12);

  y += 20;

  // ─── Distribuição por região ───────────────────────────────────────────────

  if (input.regionCounts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Distribuição por região', MARGIN, y);
    y += 5;

    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, y, CONTENT_W, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Região', MARGIN + 2, y + 4);
    doc.text('Lesões', MARGIN + 100, y + 4, { align: 'right' });
    doc.text('%', MARGIN + CONTENT_W - 2, y + 4, { align: 'right' });
    y += 6;

    // Linhas
    doc.setFont('helvetica', 'normal');
    for (const r of input.regionCounts) {
      doc.setDrawColor(235, 235, 235);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text(r.label, MARGIN + 2, y + 4.5);
      doc.text(String(r.count), MARGIN + 100, y + 4.5, { align: 'right' });
      doc.text(`${r.percentage}%`, MARGIN + CONTENT_W - 2, y + 4.5, { align: 'right' });
      y += 6;
    }

    y += 4;
  }

  // ─── Avisos de qualidade ───────────────────────────────────────────────────

  const warnings = input.qaWarnings?.filter(Boolean) ?? [];
  if (warnings.length > 0) {
    doc.setFillColor(255, 248, 230);
    doc.setDrawColor(230, 180, 60);
    doc.roundedRect(MARGIN, y, CONTENT_W, 7 + warnings.length * 5, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(120, 80, 0);
    doc.text('Imagem com qualidade subótima — interprete com reserva adicional:', MARGIN + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    for (let i = 0; i < warnings.length; i++) {
      doc.text(`• ${warnings[i]}`, MARGIN + 4, y + 10 + i * 5);
    }

    y += 8 + warnings.length * 5 + 3;
  }

  // ─── Rodapé ───────────────────────────────────────────────────────────────

  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, FOOTER_Y - 3, PAGE_W - MARGIN, FOOTER_Y - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  const disclaimer =
    'Esta análise é um auxílio clínico gerado por inteligência artificial. Não constitui diagnóstico médico, ' +
    'não prescreve tratamentos e não substitui avaliação presencial por profissional habilitado. ' +
    'Resultados podem variar conforme iluminação, pose e tipo de pele.';
  const lines = doc.splitTextToSize(disclaimer, CONTENT_W);
  doc.text(lines, MARGIN, FOOTER_Y);

  // ─── Salvar ───────────────────────────────────────────────────────────────

  const filename = `dermapro-acne-${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}.pdf`;
  doc.save(filename);
}

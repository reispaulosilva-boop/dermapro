import { jsPDF } from 'jspdf';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MARGIN = 20;        // mm
const PAGE_W = 210;       // A4 portrait width mm
const CONTENT_W = PAGE_W - MARGIN * 2;
const DISCLAIMER = 'Análise visual estética. Não constitui diagnóstico médico.';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PdfDocument = {
  doc: jsPDF;
  addHeader: (title: string, moduleLabel?: string) => number;
  addFooter: (pageNumber: number, totalPages: number) => void;
  addImageWithCaption: (canvas: HTMLCanvasElement, caption: string, y: number) => number;
  addSection: (title: string, y: number) => number;
  addTable: (headers: string[], rows: string[][], y: number) => number;
};

// ─── FACTORY ─────────────────────────────────────────────────────────────────

export function createPdfDocument(): PdfDocument {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFont('helvetica');

  return {
    doc,
    addHeader: (title, moduleLabel) => addHeader(doc, title, moduleLabel),
    addFooter: (pageNumber, totalPages) => addFooter(doc, pageNumber, totalPages),
    addImageWithCaption: (canvas, caption, y) => addImageWithCaption(doc, canvas, caption, y),
    addSection: (title, y) => addSection(doc, title, y),
    addTable: (headers, rows, y) => addTable(doc, headers, rows, y),
  };
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function addHeader(doc: jsPDF, title: string, moduleLabel?: string): number {
  const date = formatDate(new Date());
  let y = MARGIN;

  // Logo text (DM Sans not embedded; using bold Helvetica for now)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 30, 40);
  doc.text('DermaPro', MARGIN, y);

  // Date right-aligned
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 140);
  doc.text(date, PAGE_W - MARGIN, y, { align: 'right' });

  y += 6;

  // Module label (small monospaced-style caps)
  if (moduleLabel) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 170);
    doc.text(moduleLabel.toUpperCase(), MARGIN, y);
    y += 5;
  }

  // Horizontal rule
  doc.setDrawColor(220, 224, 228);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  // Page title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 30, 40);
  doc.text(title, MARGIN, y);
  y += 12;

  return y;
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
  const pageH = doc.internal.pageSize.getHeight();
  const y = pageH - MARGIN + 4;

  doc.setDrawColor(220, 224, 228);
  doc.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 160, 170);
  doc.text(DISCLAIMER, MARGIN, y);
  doc.text(`${pageNumber} / ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
}

// ─── IMAGE WITH CAPTION ───────────────────────────────────────────────────────

function addImageWithCaption(
  doc: jsPDF,
  canvas: HTMLCanvasElement,
  caption: string,
  y: number,
): number {
  const aspectRatio = canvas.width / canvas.height;
  const imgW = CONTENT_W;
  const imgH = imgW / aspectRatio;

  doc.addImage(canvas, 'PNG', MARGIN, y, imgW, imgH);
  y += imgH + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 140);
  doc.text(caption, PAGE_W / 2, y, { align: 'center' });
  y += 8;

  return y;
}

// ─── SECTION HEADING ─────────────────────────────────────────────────────────

function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(50, 70, 80);
  doc.text(title.toUpperCase(), MARGIN, y);

  y += 2;
  doc.setDrawColor(200, 210, 215);
  doc.line(MARGIN, y, MARGIN + CONTENT_W * 0.3, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 40, 50);
  return y;
}

// ─── TABLE ────────────────────────────────────────────────────────────────────

function addTable(doc: jsPDF, headers: string[], rows: string[][], y: number): number {
  const colW = CONTENT_W / headers.length;
  const rowH = 8;
  const cellPadX = 3;
  const cellPadY = 5.5;

  // Header row
  doc.setFillColor(230, 235, 240);
  doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 70, 80);
  headers.forEach((h, i) => {
    doc.text(h, MARGIN + i * colW + cellPadX, y + cellPadY);
  });
  y += rowH;

  // Data rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 40, 50);
  rows.forEach((row, ri) => {
    if (ri % 2 === 1) {
      doc.setFillColor(245, 247, 249);
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
    }
    row.forEach((cell, ci) => {
      doc.text(cell, MARGIN + ci * colW + cellPadX, y + cellPadY);
    });
    // Bottom border
    doc.setDrawColor(218, 224, 228);
    doc.line(MARGIN, y + rowH, MARGIN + CONTENT_W, y + rowH);
    y += rowH;
  });

  return y + 6;
}

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────

/**
 * Saves the PDF to the user's device.
 * @param doc - jsPDF instance
 * @param moduleId - used in the filename
 * @param prefix - filename prefix (default "dermapro")
 */
export function downloadPdf(doc: jsPDF, moduleId: string, prefix = 'dermapro'): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  doc.save(`${prefix}-${moduleId}-${date}-${time}.pdf`);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

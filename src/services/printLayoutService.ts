import { PDFDocument, rgb } from 'pdf-lib';
import { PrintLayoutFormat } from '../types/card';

// Conversion factor: 1 mm = 72 / 25.4 points ≈ 2.83464567 pt
const MM_TO_PT = 72 / 25.4;

export interface GeneratedPrintDoc {
  pdfBytes: Uint8Array;
  blobUrl: string;
  filename: string;
}

export async function generatePrintPdf(
  frontCanvas: HTMLCanvasElement,
  backCanvas: HTMLCanvasElement | null,
  format: PrintLayoutFormat,
  cardTitle: string = 'ID_Card'
): Promise<GeneratedPrintDoc> {
  const pdfDoc = await PDFDocument.create();

  // Convert canvas to PNG bytes
  const frontDataUrl = frontCanvas.toDataURL('image/png');
  const frontBytes = await fetch(frontDataUrl).then((r) => r.arrayBuffer());
  const frontImage = await pdfDoc.embedPng(frontBytes);

  let backImage = null;
  if (backCanvas) {
    const backDataUrl = backCanvas.toDataURL('image/png');
    const backBytes = await fetch(backDataUrl).then((r) => r.arrayBuffer());
    backImage = await pdfDoc.embedPng(backBytes);
  }

  const cardWidthPt = 85.6 * MM_TO_PT;
  const cardHeightPt = 53.98 * MM_TO_PT;

  if (format === 'pvc_cr80') {
    // Page 1: Front
    const page1 = pdfDoc.addPage([cardWidthPt, cardHeightPt]);
    page1.drawImage(frontImage, {
      x: 0,
      y: 0,
      width: cardWidthPt,
      height: cardHeightPt,
    });

    // Page 2: Back (if available)
    if (backImage) {
      const page2 = pdfDoc.addPage([cardWidthPt, cardHeightPt]);
      page2.drawImage(backImage, {
        x: 0,
        y: 0,
        width: cardWidthPt,
        height: cardHeightPt,
      });
    }
  } else if (format === 'photo_4x6') {
    // 6x4 inch (landscape): 152.4mm x 101.6mm
    const pageWidth = 152.4 * MM_TO_PT;
    const pageHeight = 101.6 * MM_TO_PT;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw background white
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(1, 1, 1),
    });

    if (backImage) {
      // Side-by-side centered
      const gapPt = 6 * MM_TO_PT;
      const totalCardsWidth = cardWidthPt * 2 + gapPt;
      const startX = (pageWidth - totalCardsWidth) / 2;
      const startY = (pageHeight - cardHeightPt) / 2;

      // Front
      page.drawImage(frontImage, {
        x: startX,
        y: startY,
        width: cardWidthPt,
        height: cardHeightPt,
      });

      // Back
      page.drawImage(backImage, {
        x: startX + cardWidthPt + gapPt,
        y: startY,
        width: cardWidthPt,
        height: cardHeightPt,
      });

      // Draw cut marks
      drawCutGuidelines(page, startX, startY, cardWidthPt, cardHeightPt);
      drawCutGuidelines(page, startX + cardWidthPt + gapPt, startY, cardWidthPt, cardHeightPt);
    } else {
      // Single card centered
      const startX = (pageWidth - cardWidthPt) / 2;
      const startY = (pageHeight - cardHeightPt) / 2;
      page.drawImage(frontImage, {
        x: startX,
        y: startY,
        width: cardWidthPt,
        height: cardHeightPt,
      });
      drawCutGuidelines(page, startX, startY, cardWidthPt, cardHeightPt);
    }
  } else if (format === 'lamination_pouch') {
    // A4 sheet (210mm x 297mm) with pouch format centered
    const pageWidth = 210 * MM_TO_PT;
    const pageHeight = 297 * MM_TO_PT;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const gapPt = 4 * MM_TO_PT; // 4mm fold spine gap
    const totalW = backImage ? cardWidthPt * 2 + gapPt : cardWidthPt;
    const startX = (pageWidth - totalW) / 2;
    const startY = (pageHeight - cardHeightPt) / 2;

    page.drawImage(frontImage, {
      x: startX,
      y: startY,
      width: cardWidthPt,
      height: cardHeightPt,
    });
    drawCutGuidelines(page, startX, startY, cardWidthPt, cardHeightPt);

    if (backImage) {
      page.drawImage(backImage, {
        x: startX + cardWidthPt + gapPt,
        y: startY,
        width: cardWidthPt,
        height: cardHeightPt,
      });
      drawCutGuidelines(page, startX + cardWidthPt + gapPt, startY, cardWidthPt, cardHeightPt);

      // Draw fold dashed line in middle
      const midX = startX + cardWidthPt + gapPt / 2;
      page.drawLine({
        start: { x: midX, y: startY - 10 },
        end: { x: midX, y: startY + cardHeightPt + 10 },
        thickness: 0.8,
        color: rgb(0.5, 0.5, 0.5),
        dashArray: [4, 4],
      });
    }
  } else if (format === 'a4_5card') {
    // A4 Sheet (210mm x 297mm): Up to 5 card pairs (or multiple copies)
    const pageWidth = 210 * MM_TO_PT;
    const pageHeight = 297 * MM_TO_PT;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const gapY = 8 * MM_TO_PT;
    const pairWidth = backImage ? cardWidthPt * 2 + 3 * MM_TO_PT : cardWidthPt;
    const startX = (pageWidth - pairWidth) / 2;
    const topMargin = 20 * MM_TO_PT;

    // Up to 4 or 5 rows
    const rows = 5;
    const availableHeight = pageHeight - topMargin * 2;
    const rowStep = Math.min(cardHeightPt + gapY, availableHeight / rows);

    for (let i = 0; i < 5; i++) {
      const y = pageHeight - topMargin - (i + 1) * rowStep + 10;
      if (y < 15) break;

      page.drawImage(frontImage, {
        x: startX,
        y,
        width: cardWidthPt,
        height: cardHeightPt,
      });
      drawCutGuidelines(page, startX, y, cardWidthPt, cardHeightPt);

      if (backImage) {
        const bx = startX + cardWidthPt + 3 * MM_TO_PT;
        page.drawImage(backImage, {
          x: bx,
          y,
          width: cardWidthPt,
          height: cardHeightPt,
        });
        drawCutGuidelines(page, bx, y, cardWidthPt, cardHeightPt);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  const cleanTitle = cardTitle.replace(/[^a-zA-Z0-9_-]/g, '_');

  return {
    pdfBytes,
    blobUrl,
    filename: `${cleanTitle}_print_ready_${format}.pdf`,
  };
}

function drawCutGuidelines(
  page: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const markLen = 8;
  const color = rgb(0.7, 0.7, 0.7);

  // Top-left
  page.drawLine({ start: { x: x - markLen, y }, end: { x, y }, thickness: 0.5, color });
  page.drawLine({ start: { x, y: y - markLen }, end: { x, y }, thickness: 0.5, color });

  // Top-right
  page.drawLine({ start: { x: x + width, y }, end: { x: x + width + markLen, y }, thickness: 0.5, color });
  page.drawLine({ start: { x: x + width, y: y - markLen }, end: { x: x + width, y }, thickness: 0.5, color });

  // Bottom-left
  page.drawLine({ start: { x: x - markLen, y: y + height }, end: { x, y: y + height }, thickness: 0.5, color });
  page.drawLine({ start: { x, y: y + height }, end: { x, y: y + height + markLen }, thickness: 0.5, color });

  // Bottom-right
  page.drawLine({ start: { x: x + width, y: y + height }, end: { x: x + width + markLen, y: y + height }, thickness: 0.5, color });
  page.drawLine({ start: { x, y: y + height }, end: { x, y: y + height + markLen }, thickness: 0.5, color });
}

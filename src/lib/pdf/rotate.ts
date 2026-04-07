import { PDFDocument, degrees } from "pdf-lib";

export async function rotatePdf(
  file: File,
  rotationMap: Record<number, number> // 0-indexed page -> rotation angle to ADD
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();

  for (const [idxStr, angle] of Object.entries(rotationMap)) {
    const idx = parseInt(idxStr, 10);
    if (idx >= 0 && idx < pages.length && angle !== 0) {
      const page = pages[idx];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + angle));
    }
  }

  return pdf.save();
}

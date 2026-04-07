import { PDFDocument } from "pdf-lib";

export async function deletePages(
  file: File,
  pagesToDelete: number[] // 0-indexed
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();

  // Sort descending so removal doesn't shift indices
  const sorted = [...new Set(pagesToDelete)]
    .filter((i) => i >= 0 && i < totalPages)
    .sort((a, b) => b - a);

  for (const idx of sorted) {
    pdf.removePage(idx);
  }

  return pdf.save();
}

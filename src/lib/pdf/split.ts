import { PDFDocument } from "pdf-lib";

export interface SplitRange {
  start: number; // 1-indexed
  end: number; // 1-indexed, inclusive
}

export async function splitPdf(
  file: File,
  ranges: SplitRange[]
): Promise<Uint8Array[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const start = Math.max(0, range.start - 1);
    const end = Math.min(totalPages - 1, range.end - 1);
    const indices = [];
    for (let i = start; i <= end; i++) indices.push(i);

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(pdf, indices);
    pages.forEach((page) => newDoc.addPage(page));
    results.push(await newDoc.save());
  }

  return results;
}

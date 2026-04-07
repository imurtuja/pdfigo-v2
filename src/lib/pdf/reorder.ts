import { PDFDocument } from "pdf-lib";

export async function reorderPages(
  file: File,
  newOrder: number[] // 0-indexed array representing new page order
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes);

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, newOrder);
  pages.forEach((page) => newDoc.addPage(page));

  return newDoc.save();
}

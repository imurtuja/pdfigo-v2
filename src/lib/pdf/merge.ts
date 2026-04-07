import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedDoc.addPage(page));
  }

  return mergedDoc.save();
}

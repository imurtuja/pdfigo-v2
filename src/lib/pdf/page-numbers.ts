import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

export interface PageNumberOptions {
  position?: PageNumberPosition;
  fontSize?: number;
  startNumber?: number;
  prefix?: string;
}

export async function addPageNumbers(
  file: File,
  options: PageNumberOptions = {}
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  const position = options.position ?? "bottom-center";
  const fontSize = options.fontSize ?? 12;
  const startNumber = options.startNumber ?? 1;
  const prefix = options.prefix ?? "";
  const margin = 40;

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const text = `${prefix}${startNumber + i}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x: number, y: number;

    switch (position) {
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-right":
        x = width - margin - textWidth;
        y = margin;
        break;
      case "bottom-center":
        x = width / 2 - textWidth / 2;
        y = margin;
        break;
      case "top-left":
        x = margin;
        y = height - margin;
        break;
      case "top-right":
        x = width - margin - textWidth;
        y = height - margin;
        break;
      case "top-center":
        x = width / 2 - textWidth / 2;
        y = height - margin;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  return pdf.save();
}

import { PDFDocument } from "pdf-lib";

export async function protectPdf(
  file: File,
  userPassword: string,
  ownerPassword?: string
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  // pdf-lib doesn't natively support encryption
  // We use the encrypt option on save
  return pdf.save({
    // @ts-expect-error - pdf-lib does not officially expose encryption options in typings for save method
    userPassword,
    ownerPassword: ownerPassword || userPassword,
    permissions: {
      printing: "lowResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });
}

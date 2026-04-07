import { PDFDocument } from "pdf-lib";

export async function unlockPdf(
  file: File,
  password: string
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();

  // Load with password - pdf-lib will attempt to decrypt
  const pdf = await PDFDocument.load(bytes, {
    // @ts-expect-error - password is an internal undocumented option for basic decryption
    password,
    ignoreEncryption: false,
  });

  // Re-save without encryption
  return pdf.save();
}

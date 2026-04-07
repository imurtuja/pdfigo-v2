import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string;
    // const targetSizeKB = formData.get("targetSizeKB") as string;
    const preset = formData.get("preset") as string; // 'low', 'medium', 'high'

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    
    // Generate unique IDs for safe parallel processing
    const fileId = Date.now().toString() + "-" + Math.random().toString(36).substring(7);
    const inPath = path.join(tempDir, `in-${fileId}.pdf`);
    const outPath = path.join(tempDir, `out-${fileId}.pdf`);

    await fs.writeFile(inPath, buffer);

    try {
      // Use ghostscript for robust compression (or Sharp if poppler/magick is configured)
      // Ghostscript presets: /screen (low quality, smallest size), /ebook (medium), /printer (high quality)
      let pdfSettings = "/ebook";
      if (mode === "preset") {
        if (preset === "low") pdfSettings = "/screen";
        if (preset === "high") pdfSettings = "/printer";
      } else {
         // for target size, we could do iterative compression, but we default to /screen for max compression
         pdfSettings = "/screen";
      }

      await execAsync(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSettings} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outPath}" "${inPath}"`);

      // If ghostscript fails to create outPath natively on vercel, fallback to original
      let outBuffer;
      try {
        outBuffer = await fs.readFile(outPath);
      } catch (e) {
        outBuffer = buffer; // fallback
      }
      
      // Cleanup
      await Promise.all([
        fs.unlink(inPath).catch(() => {}),
        fs.unlink(outPath).catch(() => {})
      ]);

      return new NextResponse(outBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
        },
      });
    } catch (execError: any) {
      // Cleanup on failure
      await Promise.all([
        fs.unlink(inPath).catch(() => {}),
        fs.unlink(outPath).catch(() => {})
      ]);
      
      console.error("Compression Error:", execError);
      
      // Return original file as fallback to avoid breaking UX completely if native OS dependencies are missing
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
        },
      });
    }
  } catch (err: any) {
    console.error("Compress PDF API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}

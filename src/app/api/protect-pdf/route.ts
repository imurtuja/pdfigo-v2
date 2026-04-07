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
    const password = formData.get("password") as string;

    if (!file || !password) {
      return NextResponse.json(
        { error: "File and password are required" },
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
      // Use QPDF to encrypt. 
      // AES-256 requires QPDF 7+.
      await execAsync(`qpdf --encrypt "${password}" "${password}" 256 -- "${inPath}" "${outPath}"`);

      const outBuffer = await fs.readFile(outPath);
      
      // Cleanup
      await Promise.all([
        fs.unlink(inPath).catch(() => {}),
        fs.unlink(outPath).catch(() => {})
      ]);

      return new NextResponse(outBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="protected-${file.name}"`,
        },
      });
    } catch (execError: any) {
      // Cleanup on failure
      await Promise.all([
        fs.unlink(inPath).catch(() => {}),
        fs.unlink(outPath).catch(() => {})
      ]);
      
      console.error("QPDF Error:", execError);
      return NextResponse.json(
        { error: "QPDF failed. Please ensure 'qpdf' is installed on your server." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Protect PDF API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}

"use client";

import { useState } from "react";
import { unlockPdf } from "@/lib/pdf/unlock";
import type { ToolControlsProps } from "./types";
import { Unlock, Eye, EyeOff } from "lucide-react";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";
import { Lock, Loader2 } from "lucide-react";

export default function UnlockControls({
  files, setProcessing, processing, setProgress, setResultBlob, setResultFileName, setError,
}: ToolControlsProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleUnlock = async () => {
    if (files.length === 0 || !password.trim()) return;
    try {
      setProcessing(true); setProgress(20); setError(null);
      const result = await unlockPdf(files[0], password);
      setProgress(90);
      setResultBlob(new Blob([result as unknown as BlobPart], { type: "application/pdf" }));
      const baseName = files[0].name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Unlock PDF - PDFigo by Murtuja.pdf`); setProgress(100);
    } catch (err) {
      setError(`Failed. Check password. ${err instanceof Error ? err.message : ""}`);
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Locked Document"
          description="This file is encrypted and cannot be previewed until unlocked."
          mode="vertical"
        >
          <div className="w-full flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 font-medium">Document is Encrypted</p>
            <p className="text-xs text-white/40 mt-2 max-w-sm">Provide the correct password in the right panel to decrypt and generate a new, unlocked PDF copy.</p>
          </div>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <h3 className="text-sm font-medium text-white mb-2">Decryption Required</h3>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-3 font-semibold">
              Enter PDF Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 shadow-inner"
                placeholder="Password..."
                disabled={processing}
              />
              <button
                onClick={() => setShow(!show)}
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      }
      action={
        <button
          onClick={handleUnlock}
          disabled={!password.trim() || processing}
          className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5" />}
          {processing ? "Decrypting..." : "Unlock PDF"}
        </button>
      }
    />
  );
}

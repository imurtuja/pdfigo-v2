"use client";

import { useState } from "react";
import type { ToolControlsProps } from "./types";
import { Minimize2, Loader2, Gauge } from "lucide-react";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";

type Mode = "targetSize" | "preset";
type PresetQuality = "low" | "medium" | "high";

const presets: { value: PresetQuality; label: string; desc: string }[] = [
  { value: "high", label: "High Quality", desc: "Minimal compression, preserves visual fidelity" },
  { value: "medium", label: "Balanced", desc: "Good balance of size reduction and clarity" },
  { value: "low", label: "Maximum Shrink", desc: "Aggressive compression for smallest file size" },
];

export default function CompressControls({
  files, setProcessing, processing, setProgress, setResultBlob, setResultFileName, setError,
}: ToolControlsProps) {
  const file = files[0] || null;
  const { pages, totalPages, loading, error: loadError } = usePdfLoader(file, true, 20);

  const [mode, setMode] = useState<Mode>("targetSize");
  const [targetSizeKB, setTargetSizeKB] = useState("1024"); // 1MB default
  const [preset, setPreset] = useState<PresetQuality>("medium");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleCompress = async () => {
    if (!file) return;
    try {
      setProcessing(true);
      setProgress(10);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      if (mode === "targetSize") {
        formData.append("targetSizeKB", targetSizeKB);
      } else {
        formData.append("preset", preset);
      }

      setProgress(30);
      const response = await fetch("/api/compress-pdf", { method: "POST", body: formData });

      setProgress(70);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Compression processing failed");
      }

      const blob = await response.blob();
      setResultBlob(blob);
      const baseName = files[0].name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Compress PDF - PDFigo by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Compression Failed: ${err instanceof Error ? err.message : "Internal error"}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!file) return null;

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Document Preview"
          description={`${totalPages} pages total. Original Size: ${formatSize(file.size)}`}
          mode="grid"
        >
          {loadError && <p className="text-sm text-red-400 w-full col-span-full">{loadError}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-4 w-full">
            {pages.map((p) => (
              <div
                key={p.pageNum}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-md flex items-center justify-center p-2 mb-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="max-w-full max-h-full object-contain bg-white shadow-sm" />
                <div className="absolute top-2 left-2 bg-black/60 shadow-md px-2 py-0.5 rounded text-[10px] text-white">
                  {p.pageNum}
                </div>
              </div>
            ))}
            {loading && (
              <div className="aspect-[3/4] rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-xs text-white/40">Rendering...</span>
              </div>
            )}
          </div>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Compression Logic</h3>
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 mb-6">
              <button
                onClick={() => setMode("targetSize")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "targetSize" ? "bg-purple-500 text-white shadow-md shadow-purple-500/20" : "text-white/40 hover:text-white/70"
                  }`}
              >
                Exact File Size
              </button>
              <button
                onClick={() => setMode("preset")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "preset" ? "bg-purple-500 text-white shadow-md shadow-purple-500/20" : "text-white/40 hover:text-white/70"
                  }`}
              >
                Quality Presets
              </button>
            </div>
          </div>

          {mode === "targetSize" ? (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block">
                Desired Maximum File Size
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={10}
                  value={targetSizeKB}
                  onChange={(e) => setTargetSizeKB(e.target.value)}
                  className="w-full pl-4 pr-16 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">
                  KB
                </div>
              </div>
              <p className="text-[10px] text-white/30 flex items-center gap-1.5 mt-2 leading-relaxed">
                <Gauge className="w-3.5 h-3.5 shrink-0" /> The system will compress iteratively until the file is below {(parseInt(targetSizeKB) || 0) / 1024} MB.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">
                Select Quality
              </label>
              {presets.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setPreset(o.value)}
                  className={`w-full flex flex-col items-start p-4 rounded-xl text-left transition-all border ${preset === o.value
                    ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-3 h-3 rounded-full transition-colors ${preset === o.value ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-white/20"
                      }`} />
                    <p className="text-sm font-semibold text-white">{o.label}</p>
                  </div>
                  <p className="text-[10px] text-white/40 pl-5">{o.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      }
      action={
        <button
          onClick={handleCompress}
          disabled={processing || (mode === 'targetSize' && !targetSizeKB)}
          className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minimize2 className="w-5 h-5" />}
          {processing ? "Compressing Engine Active..." : "Compress PDF"}
        </button>
      }
    />
  );
}

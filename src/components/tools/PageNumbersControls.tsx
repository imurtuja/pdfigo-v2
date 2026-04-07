"use client";

import { useState } from "react";
import { addPageNumbers, type PageNumberPosition } from "@/lib/pdf/page-numbers";
import type { ToolControlsProps } from "./types";
import { Hash, Loader2 } from "lucide-react";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";

const positions: { value: PageNumberPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom C" },
  { value: "bottom-right", label: "Bottom R" },
];

function getPositionClasses(pos: PageNumberPosition): string {
  switch (pos) {
    case "top-left": return "top-1 left-1 sm:top-2 sm:left-2";
    case "top-center": return "top-1 left-1/2 -translate-x-1/2 sm:top-2";
    case "top-right": return "top-1 right-1 sm:top-2 sm:right-2";
    case "bottom-left": return "bottom-1 left-1 sm:bottom-2 sm:left-2";
    case "bottom-center": return "bottom-1 left-1/2 -translate-x-1/2 sm:bottom-2";
    case "bottom-right": return "bottom-1 right-1 sm:bottom-2 sm:right-2";
  }
}

export default function PageNumbersControls({
  files, setProcessing, processing, setProgress, setResultBlob, setResultFileName, setError,
}: ToolControlsProps) {
  const file = files[0] || null;
  const { pages, totalPages, loading, error: loadError } = usePdfLoader(file, true, 20); // Limit to top 20 pages for visual reference

  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [startNum, setStartNum] = useState(1);

  const handleAdd = async () => {
    if (!file) return;
    try {
      setProcessing(true); setProgress(20); setError(null);
      const result = await addPageNumbers(file, { position, startNumber: startNum });
      setProgress(90);
      setResultBlob(new Blob([result as unknown as BlobPart], { type: "application/pdf" }));
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResultFileName(`${baseName} - Page Numbers - PDFigo by Murtuja.pdf`); setProgress(100);
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally { setProcessing(false); }
  };

  if (!file) return null;

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Document Preview"
          description={`${totalPages} pages total. Showing up to 20 pages.`}
          mode="grid"
        >
          <div className="w-full h-full min-h-0">
            {loadError && <p className="text-sm text-red-400 p-4">{loadError}</p>}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 w-full content-start">
              {pages.map((p, index) => {
                const currentNumber = startNum + index;
                return (
                  <div key={p.pageNum} className="relative aspect-[1/1.414] bg-white rounded-lg shadow-sm border border-transparent overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />

                    {/* Number Overlay */}
                    <div className={`absolute ${getPositionClasses(position)} bg-purple-600/90 text-white rounded w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-[10px] font-bold shadow-md transition-all duration-300`}>
                      {currentNumber}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="aspect-[1/1.414] rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="text-[10px] text-white/40">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </UniversalPreview>
      }
      options={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <h3 className="text-sm font-medium text-white mb-2">Page Number Settings</h3>

          <div>
            <label className="text-xs text-white/35 block mb-3 uppercase tracking-wider font-semibold">Position</label>
            <div className="grid grid-cols-3 gap-2">
              {positions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPosition(p.value)}
                  className={`py-2 px-2 rounded-lg text-[10px] font-medium transition-all border ${position === p.value ? "border-purple-500/50 bg-purple-500/10 text-purple-200" : "border-white/10 bg-white/[0.02] text-white/40 hover:text-white/60"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/35 block mb-2 uppercase tracking-wider font-semibold">Start Number</label>
            <input
              type="number"
              min={1}
              value={startNum}
              onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>
      }
      action={
        <button
          onClick={handleAdd}
          disabled={processing || loading}
          className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Hash className="w-5 h-5" />}
          {processing ? "Adding..." : "Add Page Numbers"}
        </button>
      }
    />
  );
}

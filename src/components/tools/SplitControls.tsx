"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import type { ToolControlsProps } from "./types";
import { Scissors, X, RotateCcw, Loader2 } from "lucide-react";
import { usePdfLoader } from "@/hooks/usePdfLoader";
import UniversalPreview from "../pdf/UniversalPreview";
import ToolLayout from "./ToolLayout";

export default function SplitControls({
  files,
  setProcessing,
  processing,
  setProgress,
  setResultBlob,
  setResultFileName,
  setError,
}: ToolControlsProps) {
  const file = files[0] || null;
  const { pages, totalPages, loading, error: loadError } = usePdfLoader(file, true, 200);

  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());

  const togglePage = (pageNum: number) => {
    setRemovedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const resetSelection = () => {
    setRemovedPages(new Set());
  };

  const handleSplit = async () => {
    if (!file) return;
    if (removedPages.size === totalPages) {
      setError("You cannot remove all pages. Please keep at least one page.");
      return;
    }

    try {
      setProcessing(true);
      setProgress(10);
      setError(null);

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      const newDoc = await PDFDocument.create();
      const numPages = pdf.getPageCount();

      const indicesToKeep = [];
      for (let i = 0; i < numPages; i++) {
        if (!removedPages.has(i + 1)) {
          indicesToKeep.push(i);
        }
      }

      setProgress(40);
      const copiedPages = await newDoc.copyPages(pdf, indicesToKeep);
      copiedPages.forEach((page) => newDoc.addPage(page));

      setProgress(80);
      const resultBytes = await newDoc.save();

      const blob = new Blob([resultBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);

      const baseName = file.name.replace(/\.pdf$/i, "");
      setResultFileName(`${baseName} - Split PDF - PDFigo by Murtuja.pdf`);
      setProgress(100);
    } catch (err) {
      setError(`Failed to split: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!file) return null;

  return (
    <ToolLayout
      preview={
        <UniversalPreview
          title="Visual Document Map"
          description={`${totalPages} pages total. Click 'X' to remove pages from the final split PDF.`}
          mode="grid"
          rightAction={
            removedPages.size > 0 && (
              <button
                onClick={resetSelection}
                className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )
          }
        >
          <div className="w-full h-full min-h-0">
            {loadError && <p className="text-sm text-red-400 p-4">{loadError}</p>}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 w-full content-start">
              {pages.map((p) => {
                const isRemoved = removedPages.has(p.pageNum);
                return (
                  <div
                    key={p.pageNum}
                    className={`relative aspect-[1/1.414] bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 group ${isRemoved ? "opacity-30 grayscale border-red-500/50" : "opacity-100 hover:ring-2 hover:ring-purple-500 border-transparent"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-cover" />

                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <span className="text-[10px] sm:text-xs text-white font-medium">{p.pageNum}</span>
                    </div>

                    <button
                      onClick={() => togglePage(p.pageNum)}
                      className={`absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${isRemoved
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-black/40 text-white/80 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100"
                        }`}
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-start gap-4">
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Create Split PDF</h3>
            <p className="text-xs text-white/40 max-w-sm">
              {removedPages.size > 0
                ? `${removedPages.size} page(s) removed. Final PDF will contain ${totalPages - removedPages.size} pages.`
                : "No pages removed. Final PDF will be identical to original."}
            </p>
          </div>
        </div>
      }
      action={
        <button
          onClick={handleSplit}
          disabled={processing || loading || removedPages.size === totalPages}
          className="btn btn-primary w-full shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
          {processing ? "Processing..." : "Create Split PDF"}
        </button>
      }
    />
  );
}

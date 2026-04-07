"use client";

import { motion } from "framer-motion";
import { Download, CheckCircle, RotateCcw } from "lucide-react";

interface DownloadSectionProps {
  resultBlob: Blob | null;
  fileName: string;
  onReset: () => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function DownloadSection({
  resultBlob,
  fileName,
  onReset,
}: DownloadSectionProps) {
  if (!resultBlob) return null;

  const handleDownload = () => {
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Processing complete!</p>
          <p className="text-xs text-white/40">
            {fileName} · {formatSize(resultBlob.size)}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleDownload} className="btn btn-success flex-1">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button onClick={onReset} className="btn btn-secondary px-4">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

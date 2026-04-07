"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070612]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              PDF<span className="text-purple-400">i</span>go
            </span>
          </Link>

          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <Link
              href="/tools"
              className="hover:text-white/60 transition-colors"
            >
              Tools
            </Link>
          </div>

          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} PDFigo by Murtuja. All tools run locally.
          </p>
        </div>
      </div>
    </footer>
  );
}

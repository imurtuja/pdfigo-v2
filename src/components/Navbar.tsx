"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] border-b border-white/5 bg-[#05040e]/80 backdrop-blur-xl flex items-center transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Logo (Visible on all) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            PDFigo
          </span>
        </Link>

        {/* Center: Navigation (Desktop only) */}
        <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all ${
                  isActive 
                    ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: CTA (Desktop only) */}
        <div className="hidden md:flex items-center">
          <Link 
            href="/tools" 
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
          >
            Get Started
          </Link>
        </div>
        
      </div>
    </nav>
  );
}

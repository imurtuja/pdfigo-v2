"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench } from "lucide-react";

const mobileLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Tools", icon: Wrench },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
      <div className="flex items-center gap-8">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 transition-all ${
                isActive 
                  ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

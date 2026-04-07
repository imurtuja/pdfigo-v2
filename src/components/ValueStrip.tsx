import { ShieldCheck, Zap, Lock } from "lucide-react";

export default function ValueStrip() {
  const items = [
    { icon: Zap, text: "Lightning Fast" },
    { icon: ShieldCheck, text: "100% Free" },
    { icon: Lock, text: "Private & Secure" },
  ];

  return (
    <div className="w-full border-y border-white/[0.04] bg-[#05040e]">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
               <item.icon className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-white/80">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

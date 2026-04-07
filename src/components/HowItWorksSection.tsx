import { UploadCloud, Settings2, Download } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: UploadCloud,
      title: "1. Upload Your Files",
      description: "Drag and drop your PDFs or images directly into the browser. Files are loaded instantly without server delays.",
    },
    {
      icon: Settings2,
      title: "2. Edit & Process",
      description: "Use our interactive tools to merge, split, compress, or convert. Everything happens securely on your device.",
    },
    {
      icon: Download,
      title: "3. Download Instantly",
      description: "Get your processed files immediately. No waiting in queues, no email signups, and absolutely no limits.",
    },
  ];

  return (
    <section className="py-14 md:py-20 relative overflow-hidden bg-[#05040e]">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/10 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-white/50 text-base md:text-lg">
            A seamless workflow designed for speed and simplicity. No complex setups or accounts required.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-8 relative max-w-5xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center flex-1 max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-[#0a0a1a] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative z-10 group hover:border-purple-500/30 transition-colors">
                <step.icon className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

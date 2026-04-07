"use client";

import { tools } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ToolsGridProps {
  limit?: number;
}

export default function ToolsGrid({ limit }: ToolsGridProps) {
  const displayedTools = limit ? tools.slice(0, limit) : tools;

  return (
    <section id="tools" className="py-14 md:py-20 w-full overflow-hidden bg-[#05040e]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
           className="text-center mb-12"
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-3">
             All Tools
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
             All PDF Tools
          </h2>
          <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed">
             A complete toolkit to manage your PDF workflow. All tools run locally in your browser.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedTools.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>

        {/* View All Button */}
        {limit && (
          <div className="mt-12 flex justify-center">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                View All Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

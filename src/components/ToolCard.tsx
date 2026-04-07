"use client";

import Link from "next/link";
import { tools } from "@/lib/tools";
import { motion } from "framer-motion";

interface ToolCardProps {
  tool: typeof tools[number];
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = tool.icon as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link
        href={`/tool/${tool.slug}`}
        className="block rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] hover:bg-white/10 hover:border-white/[0.16] hover:scale-[1.02] hover:shadow-xl transition-all duration-200 h-full group"
      >
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${tool.color}15` }}
        >
          <Icon
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            style={{ color: tool.color }}
          />
        </div>

        {/* Text */}
        <h3 className="text-sm font-semibold text-white mb-1">{tool.name}</h3>
        <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </Link>
    </motion.div>
  );
}

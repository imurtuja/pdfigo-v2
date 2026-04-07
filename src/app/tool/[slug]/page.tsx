import type { Metadata } from "next";
import { getToolBySlug, tools } from "@/lib/tools";
import ToolPageClient from "./ToolPageClient";

// Generate static params for all tools (helps with ISR/SSG)
export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

// Dynamic SEO metadata per tool
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested PDF tool could not be found.",
    };
  }

  const title = `${tool.name} - Free Online`;
  const description = `${tool.description} Fast, free, and private - powered by PDFigo by Murtuja. No file uploads to servers.`;

  return {
    title,
    description,
    openGraph: {
      title: `${tool.name} | PDFigo by Murtuja`,
      description,
      url: `https://pdfigo.murtuja.in/tool/${slug}`,
      siteName: "PDFigo by Murtuja",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | PDFigo by Murtuja`,
      description,
    },
    alternates: {
      canonical: `https://pdfigo.murtuja.in/tool/${slug}`,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ToolPageClient slug={slug} />;
}

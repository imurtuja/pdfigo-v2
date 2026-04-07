import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for sharp image processing
  serverExternalPackages: ["sharp"],

  // Allow large file uploads via API routes
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // pdfjs-dist optionally requires "canvas" (node-only); disable for browser builds
      canvas: { browser: "./empty-module.js" },
    },
  },
  webpack: (config) => {
    // Fallback for webpack builds
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;

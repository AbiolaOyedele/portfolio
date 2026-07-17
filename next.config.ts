import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next.js doesn't infer a parent
  // directory when multiple lockfiles exist (e.g. a stray ~/package-lock.json).
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      // /vibecode was renamed to /playground — keep old links/bookmarks working.
      { source: "/vibecode", destination: "/playground", permanent: true },
      // /graphics/[subcategory] hub pages were retired in favor of the
      // single interactive canvas at /graphics — keep old links working.
      { source: "/graphics/branding", destination: "/graphics", permanent: true },
      { source: "/graphics/social-media", destination: "/graphics", permanent: true },
      { source: "/graphics/decks", destination: "/graphics", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

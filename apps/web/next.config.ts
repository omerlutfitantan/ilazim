import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ilazim/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;

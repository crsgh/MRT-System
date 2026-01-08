import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Turbopack compatibility, avoid webpack-specific config
  transpilePackages: [],
};

export default nextConfig;

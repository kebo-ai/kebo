import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kebo/shared"],
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;

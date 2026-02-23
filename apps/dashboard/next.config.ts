import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kebo/shared"],
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/es/app",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

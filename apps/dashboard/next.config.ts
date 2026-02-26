import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kebo/shared"],
  reactCompiler: true,
  // Type checking is handled by `tsc --noEmit` with project references,
  // which correctly resolves cross-package @/ path aliases. Next.js's
  // built-in checker doesn't support project references.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;

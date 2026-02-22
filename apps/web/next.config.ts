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
        destination: "/es",
        permanent: false,
      },
      {
        source: "/privacidad",
        destination: "/politica-de-privacidad",
        permanent: true,
      },
      {
        source: "/datos-personales",
        destination: "/politica-de-privacidad",
        permanent: true,
      },
      {
        source: "/terminos",
        destination: "/terminos-y-condiciones",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

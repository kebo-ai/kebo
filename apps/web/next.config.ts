import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kebo/shared"],
  async redirects() {
    return [
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

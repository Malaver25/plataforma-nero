import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/panel/configuracion", destination: "/gestion/organizacion/configuracion", permanent: false },
      { source: "/panel/usuarios/:path*", destination: "/gestion/personas/usuarios/:path*", permanent: false },
      { source: "/panel", destination: "/gestion", permanent: false },
    ];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

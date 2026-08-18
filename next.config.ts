import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: process.env.VERCEL ? undefined : "standalone",
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

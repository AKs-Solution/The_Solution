import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;

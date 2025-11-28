import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Vercelでのデプロイを確実にするため
  output: 'standalone',
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },

  rules: {
    "@typescript-eslint/no-explicit-any": "off"
  },

  project: "sky-realty"

  
  /* config options here */
};

export default nextConfig;

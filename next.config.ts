import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure pg and other native modules work in serverless
  serverExternalPackages: ["pg", "pg-pool", "bcryptjs"],
};

export default nextConfig;

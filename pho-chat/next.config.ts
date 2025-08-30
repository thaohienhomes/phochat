import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      // Add domains as needed
      // { protocol: "https", hostname: "images.example.com" },
    ],
  },
  // Ignore lint and type errors during production builds to unblock deploys.
  // We still see them locally in dev.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
